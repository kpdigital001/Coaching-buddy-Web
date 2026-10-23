# CoachingBuddy — GitHub-only SEO publishing (review-only)

This branch replaces the earlier PHP/Nginx SEO publisher. DO NOT merge both branches.

## Scope and preservation
- Keep existing React/Vite UI, Student/Institute logins, OTP, Google login, contact gating, and existing /api behavior unchanged.
- SEO Admin login is isolated. Real password and GitHub credentials live ONLY in Cloudflare Worker secrets.
- Publish commits a selected SEO page to the ORIGINAL developer-owned repo main branch as web/public/seo-overrides.json.
- Original main GitHub Actions deploys on push to web/**. Status is pending until deployment succeeds.

## Required Cloudflare setup (no VPS credentials)
1. Create/access your own Cloudflare Workers account, install Wrangler v4+, then deploy seo-worker. Example commands: cd seo-worker && npm install && npx wrangler deploy.
2. Rotate the old SEO password. It and its client-side hash were previously disclosed. Generate a NEW unique password (at least 16 characters) using the local helper: node seo-worker/scripts/setup-password.mjs. Do not share this password or the output with ChatGPT.
3. Configure SEO_LOGIN_SALT, SEO_LOGIN_HASH and SEO_SESSION_SECRET as Cloudflare Worker secrets with npx wrangler secret put SECRET_NAME. Never commit real secrets.
4. Create a GitHub credential with Contents WRITE on original repository reactnativedev2026/Coaching-buddy-Web, and store as GITHUB_TOKEN Cloudflare Worker secret. Prefer narrowly scoped GitHub App installation credentials where possible. The user-owned fork write access is NOT sufficient to auto-deploy the original repository. The connected GitHub plugin lacks write access to original, so GitHub API authorization must independently succeed. Do not send token in chat.
5. Verify seo-worker/wrangler.toml SITE_ORIGIN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH (main), SEO_ADMIN_EMAIL. Browser CORS is locked to https://coachingbuddy.co.in.
6. After Worker is deployed, put its REAL public https URL into nonsecret VITE_SEO_WORKER_URL at original repo build time or a commit with only that public URL under web/.env.production.
7. Authorized GitHub user must merge this branch into original repository main. Fork PR merge does NOT update upstream.
8. Test one City SEO publish, upstream GitHub Actions, resulting live HTML source, JSON and rollback. Then test all student/institute login/gated Call Now, course, booking, dashboard and mobile flows.

## Worker design
- Cloudflare Worker validates admin credentials using PBKDF2 and enforces rate limiting (Cloudflare binding is approximate).
- Short lived HMAC signed session token (20 minutes) stored in sessionStorage for SEO only. No Github credential in browser.
- Commit endpoint validates a single SEO key, canonical page route and GitHub blob SHA to avoid clobbering concurrent changes.
- GitHub Contents API writes only the public JSON (not any developer login or app source).
- Remove saves a canonical-only default metadata tombstone because original VPS rsync deployment lacks --delete and could otherwise leave stale static HTML.

## SEO HTML and known limits
- Vite build runs web/scripts/generate-seo-pages.mjs to produce route-specific index.html for published canonical URLs (title, description, canonical, robots, FAQ JSON-LD).
- It does NOT server-render full React page body. Nginx must serve generated directory index.html for SEO URLs, otherwise default SPA HTML may still be returned. Validate using view-source and HTTP status.
- SEO updates are not instant. Publish means GitHub commit created; the app's auto-deploy must subsequently finish.
- Existing VPS Nginx routing is controlled by the developer. If it does not serve generated routes, server config or hosting must be changed by its authorized admin.
- If repository owner will not provide any upstream write authorization, direct publish to original repository is impossible. No GitHub login or server access bypass is attempted.

## Review safeguards
- CI: TypeScript/Vite build, Worker syntax, SEO script syntax, synthetic city URL metadata smoke test.
- Original upstream main and developer VPS NOT changed in this branch.
- No personal tokens/passwords/hashes are committed. GitHub history still contains the OLD frontend password verifier; rotate the old password before production.
- The previous PHP SEO draft PR should remain unmerged, since this design replaces it.
