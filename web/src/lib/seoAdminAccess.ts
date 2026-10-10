export const SEO_ADMIN_SESSION_KEY = 'COACHING_BUDDY_SEO_ADMIN_SESSION_V3';
const SEO_ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// Production fallback values are intentionally limited to the SEO-only gate.
// They make the SEO login independent of whether a hosting panel preserves .env
// during the Vite production build. Normal Student/Institute auth is untouched.
const FALLBACK_SEO_ADMIN_EMAILS = ['seo@coachingbuddy.co.in'];
const FALLBACK_SEO_ADMIN_PASSWORD_SHA256 =
  '1128d527a539db94e78c0da90e7c80980cdd22c7462a7142aa5efad19a82cccc';

function readEnv(name: string): string {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return String(env?.[name] || '').trim();
}

export function getAllowedSeoAdminEmails(): string[] {
  const configured = readEnv('VITE_SEO_ADMIN_EMAILS')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return configured.length ? configured : FALLBACK_SEO_ADMIN_EMAILS;
}

export function isSeoAdminIdentityAllowed(email?: string | null, _role?: string | null): boolean {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return getAllowedSeoAdminEmails().includes(normalizedEmail);
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifySeoAdminPassword(password: string): Promise<boolean> {
  const configuredHash = readEnv('VITE_SEO_ADMIN_PASSWORD_SHA256').toLowerCase();
  const expectedHash = /^[a-f0-9]{64}$/.test(configuredHash)
    ? configuredHash
    : FALLBACK_SEO_ADMIN_PASSWORD_SHA256;

  const actualHash = await sha256(password);
  return actualHash === expectedHash;
}

export function unlockSeoAdminSession(email: string): void {
  const payload = {
    email: String(email || '').trim().toLowerCase(),
    unlockedAt: Date.now(),
  };
  sessionStorage.setItem(SEO_ADMIN_SESSION_KEY, JSON.stringify(payload));
}

export function clearSeoAdminSession(): void {
  sessionStorage.removeItem(SEO_ADMIN_SESSION_KEY);
  sessionStorage.removeItem('COACHING_BUDDY_SEO_ADMIN_SESSION_V2');
  sessionStorage.removeItem('COACHING_BUDDY_SEO_ADMIN_SESSION_V1');
}

export function isSeoAdminSessionUnlocked(): boolean {
  const raw = sessionStorage.getItem(SEO_ADMIN_SESSION_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as { email?: string; unlockedAt?: number };
    const email = String(parsed.email || '').trim().toLowerCase();
    const allowedEmail = isSeoAdminIdentityAllowed(email);
    const unlockedAt = Number(parsed.unlockedAt || 0);
    const isFresh = unlockedAt > 0 && Date.now() - unlockedAt <= SEO_ADMIN_SESSION_TTL_MS;

    if (allowedEmail && isFresh) return true;
  } catch {
    // Invalid session is cleared below.
  }

  clearSeoAdminSession();
  return false;
}
