# CoachingBuddy One-Click SEO Publishing — Deployment Review

**Draft integration: do NOT merge or deploy to production before staging QA.**

## Scope
- Existing Student/Institute login, OTP, Google, dashboard, Call Now login gate, public UI, and API clients remain untouched.
- Dedicated SEO login uses the server-side PHP session; browser does not contain the SEO password/hash.
- Publishing endpoints are `web/public/seo-publisher/api.php` (authenticated) and `published.php` (public); live SEO state is stored privately in `coachingbuddy-seo-private/data`.
- React SEO dashboard enables Save Draft, Publish Live, Remove Live, and per-page Restore.
- `seo-entry.php` injects SEO tags/FAQ schema into the initial HTML where overrides exist; this is **not** full SSR of page content.

## Security and credentials
- `coachingbuddy-seo-private/config.example.php` is a **template**, not a live credential. The real `config.php` must be outside document root and **never** committed.
- Generate a **new** password and a PHP `password_hash()` value on the server; provide it through `CB_SEO_PASSWORD_HASH` or a private `config.php` value.
- Rotate the old SEO password. The previous main branch contained its frontend SHA-256 hash; that login is not secure against offline password guessing.
- Block HTTP access to `seo-private`, ideally keep it beside `public_html` or the actual webroot, not under it. Set the live data directory writable by the PHP worker (not 0777).
- Preserve all existing `/api` backend routes, sessions, cookies and CORS behaviors.

## Hosting inconsistency requiring owner/developer confirmation
This repository's `.github/workflows/deploy-web.yml` currently deploys `web/dist` via SSH as root to `/home/coachingbuddy/htdocs/coachingbuddy.co.in/` and reloads **Nginx**. That is a VPS-style workflow, NOT a Hostinger Business shared-host `.htaccess` deployment. **Do not merge this PR until the actual live origin, PHP-FPM support, routing and private directory can be confirmed.**

- On Apache/LiteSpeed (Hostinger shared hosting), include `web/public/.htaccess` rewrite rules and place `seo-private` beside the real web root.
- On Nginx, `.htaccess` has no effect. Configure server routes so `/seo-admin`, `/coaching-institutes/...`, etc. fallback through `seo-entry.php`, `/seo-overrides.json` resolves to `seo-publisher/published.php`, and `/seo-publisher/*.php` executes only under configured PHP-FPM. Keep `/api` upstream unchanged. **No server Nginx config is being changed by this PR.**
- Do not deploy the `coachingbuddy-seo-private/` folder to a public directory or through the existing `web/dist` sync; install it separately by authorized server administrator.

## Required QA before production
1. Confirm PHP 8.2+ and correct document root; create private `config.php` and secure storage outside web root.
2. `cd web && npm ci && npm run build` (repository build is not verified by this PR).
3. Validate PHP lint, exact source HTML metadata, title/description/canonical/robots/FAQ schema and runtime 200 responses.
4. Verify SEO login wrong password denied, correct password allowed, CSRF rejects missing token, unauthenticated publish rejects, session cookie flags, rate limiting.
5. Publish a staging City SEO change; refresh `/seo-overrides.json` and site source. Restore a previous version.
6. Verify all Student/Institute login, OTP, Google, dashboard and locked Call Now behavior. Test search, courses, bookings and `/api`.
7. Verify staging noindex, and backup + rollback plan; only then consider merging.

**This PR stages source for review; it does not perform Hostinger/VPS deployment.**