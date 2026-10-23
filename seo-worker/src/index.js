// CoachingBuddy SEO publish gateway. Deploy separately to Cloudflare Workers.
// NO GitHub or password secrets may be embedded in frontend code or this file.
const SEO_FILE = "web/public/seo-overrides.json";
const textEncoder = new TextEncoder();

const reply = (object, status = 200, extra = {}) =>
  new Response(JSON.stringify(object), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra },
  });
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
const bytesOf = (str) => textEncoder.encode(str);
const fromB64url = (str) => Uint8Array.from(atob(str.replaceAll("-", "+").replaceAll("_", "/")), (c) => c.charCodeAt(0));
const hex = (bytes) => [...bytes].map((v) => v.toString(16).padStart(2, "0")).join("");
const utf8ToB64 = (input) => {
  const bytes = bytesOf(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.slice(i, i + 8192));
  return btoa(binary);
};
const b64ToUtf8 = (input) => new TextDecoder().decode(Uint8Array.from(atob(input.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
const safeEqual = (a, b) => a.length === b.length && a.every((byte, i) => byte === b[i]);

async function sessionKey(secret) {
  return crypto.subtle.importKey("raw", bytesOf(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function signSession(env) {
  const payload = b64url(bytesOf(JSON.stringify({ sub: "seo-admin", exp: Math.floor(Date.now() / 1000) + 1200 })));
  const signature = b64url(new Uint8Array(await crypto.subtle.sign("HMAC", await sessionKey(env.SEO_SESSION_SECRET), bytesOf(payload))));
  return payload + "." + signature;
}
async function authenticated(req, env) {
  const value = req.headers.get("Authorization") || "";
  const token = value.startsWith("Bearer ") ? value.slice(7) : "";
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(parts[0])));
    if (data.sub !== "seo-admin" || !Number.isInteger(data.exp) || data.exp <= Date.now() / 1000) return false;
    return crypto.subtle.verify("HMAC", await sessionKey(env.SEO_SESSION_SECRET), fromB64url(parts[1]), bytesOf(parts[0]));
  } catch { return false; }
}
async function checkPassword(password, env) {
  if (typeof password !== "string" || password.length > 256 || !env.SEO_LOGIN_SALT || !env.SEO_LOGIN_HASH) return false;
  const material = await crypto.subtle.importKey("raw", bytesOf(password), "PBKDF2", false, ["deriveBits"]);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({
    name: "PBKDF2", salt: fromB64url(env.SEO_LOGIN_SALT), iterations: 310000, hash: "SHA-256",
  }, material, 256));
  const expected = fromB64url(env.SEO_LOGIN_HASH);
  return safeEqual(derived, expected);
}
function validKey(key) {
  return typeof key === "string" && key.length < 251 && /^(city:[a-z0-9-]+|category:[a-z0-9-]+:[a-z0-9-]+|institute:[A-Za-z0-9_-]+)$/.test(key);
}
function field(value, max) {
  if (value == null || value === "") return "";
  if (typeof value !== "string" || value.length > max) throw new Error("Invalid or oversized SEO field");
  return value.trim();
}
function cleanEntry(item, env) {
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Invalid SEO entry");
  const result = {
    title: field(item.title, 200), description: field(item.description, 500),
    h1: field(item.h1, 250), intro: field(item.intro, 10000),
    canonical: field(item.canonical, 1000), index: item.index !== false,
    updatedAt: new Date().toISOString(),
  };
  if (result.canonical) {
    const url = new URL(result.canonical, env.SITE_ORIGIN);
    if (url.origin !== env.SITE_ORIGIN || url.protocol !== "https:" || url.username || url.password || url.hash) throw new Error("Canonical must be on the approved HTTPS website");
    result.canonical = url.href;
  }
  if (!Array.isArray(item.faqs) || item.faqs.length > 12) throw new Error("Invalid FAQs");
  result.faqs = item.faqs.map((faq) => ({
    question: field(faq?.question, 300), answer: field(faq?.answer, 2000),
  })).filter((faq) => faq.question && faq.answer);
  return result;
}
function repoUrl(env) {
  if (!/^[\w.-]+$/.test(env.GITHUB_OWNER) || !/^[\w.-]+$/.test(env.GITHUB_REPO) || !/^[\w./-]+$/.test(env.GITHUB_BRANCH)) throw new Error("Invalid repository configuration");
  return "https://api.github.com/repos/" + env.GITHUB_OWNER + "/" + env.GITHUB_REPO + "/contents/" + SEO_FILE;
}
async function githubFile(env) {
  const url = repoUrl(env) + "?ref=" + encodeURIComponent(env.GITHUB_BRANCH);
  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + env.GITHUB_TOKEN, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "CoachingBuddy-SEO-Publisher" },
  });
  if (!response.ok) throw new Error("GitHub could not read the publishing file (" + response.status + ")");
  const data = await response.json();
  if (data.size > 800000 || typeof data.sha !== "string") throw new Error("Publishing file too large");
  const config = JSON.parse(b64ToUtf8(data.content));
  if (config.version !== 1 || !config.entries || Array.isArray(config.entries) || typeof config.entries !== "object") throw new Error("Invalid published SEO configuration");
  return { config, sha: data.sha };
}
async function commitGitHub(env, config, sha, key) {
  const response = await fetch(repoUrl(env), {
    method: "PUT",
    headers: { Authorization: "Bearer " + env.GITHUB_TOKEN, Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "CoachingBuddy-SEO-Publisher" },
    body: JSON.stringify({
      message: "seo: publish " + key,
      branch: env.GITHUB_BRANCH,
      sha,
      content: utf8ToB64(JSON.stringify(config, null, 2) + "\n"),
    }),
  });
  if (response.status === 409 || response.status === 422) return reply({ error: "Concurrent GitHub update. Reload live SEO state and retry." }, 409);
  if (!response.ok) {
    console.error("GitHub publish rejected", response.status);
    return reply({ error: "GitHub rejected the publish commit (" + response.status + "). Check repository permission." }, 502);
  }
  const body = await response.json();
  return reply({ ok: true, status: "deployment_pending", commit: body.commit?.sha || null });
}
export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const cors = origin === env.SITE_ORIGIN ? {
      "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", Vary: "Origin",
    } : {};
    if (!env.SITE_ORIGIN || !env.GITHUB_TOKEN || !env.SEO_SESSION_SECRET || !env.SEO_LOGIN_HASH || !env.LOGIN_LIMITER) {
      return reply({ error: "Publishing gateway is not configured" }, 503, cors);
    }
    if (origin !== env.SITE_ORIGIN) return reply({ error: "Origin not allowed" }, 403);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const route = new URL(req.url).pathname.replace(/\/+$/, "") || "/";
    try {
      if (route === "/login" && req.method === "POST") {
        const limit = await env.LOGIN_LIMITER.limit({ key: "seo-admin-login" });
        if (!limit.success) return reply({ error: "Too many attempts. Try again shortly." }, 429, cors);
        const data = await req.json();
        const email = String(data.email || "").trim().toLowerCase();
        if (email !== env.SEO_ADMIN_EMAIL.toLowerCase() || !await checkPassword(data.password, env)) {
          return reply({ error: "Invalid SEO Admin email or password" }, 401, cors);
        }
        return reply({ token: await signSession(env), expiresInSeconds: 1200 }, 200, cors);
      }
      if (!await authenticated(req, env)) return reply({ error: "SEO session expired. Log in again." }, 401, cors);
      if (route === "/session" && req.method === "GET") return reply({ authenticated: true }, 200, cors);
      if (route === "/published" && req.method === "GET") {
        const { config, sha } = await githubFile(env);
        return reply({ config, sha }, 200, cors);
      }
      if (route === "/publish" && req.method === "POST") {
        const raw = await req.text();
        if (raw.length > 30000) return reply({ error: "SEO publish payload too large" }, 413, cors);
        const body = JSON.parse(raw);
        const key = body.key;
        if (!validKey(key) || typeof body.expectedSha !== "string") return reply({ error: "Invalid publish request" }, 400, cors);
        const { config, sha } = await githubFile(env);
        if (sha !== body.expectedSha) return reply({ error: "Newer published changes exist. Refresh before publishing." }, 409, cors);
        const item = cleanEntry(body.entry, env);
        config.entries[key] = item;
        config.generatedAt = new Date().toISOString();
        return commitGitHub(env, config, sha, key);
      }
      if (route === "/remove" && req.method === "POST") {
        const body = await req.json();
        if (!validKey(body.key) || typeof body.expectedSha !== "string") return reply({ error: "Invalid remove request" }, 400, cors);
        const { config, sha } = await githubFile(env);
        if (sha !== body.expectedSha) return reply({ error: "Newer published changes exist. Refresh before removing." }, 409, cors);
        delete config.entries[body.key];
        config.generatedAt = new Date().toISOString();
        return commitGitHub(env, config, sha, body.key);
      }
      return reply({ error: "Route not found" }, 404, cors);
    } catch (error) {
      console.error("SEO gateway:", String(error?.message || error));
      return reply({ error: "SEO gateway request failed. Review Worker logs." }, 500, cors);
    }
  },
};
