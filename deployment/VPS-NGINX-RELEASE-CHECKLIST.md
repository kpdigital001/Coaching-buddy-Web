# CoachingBuddy VPS/Nginx — Production Release Gate

## Evidence and current decision
- User-provided DNS evidence: `148.230.81.172` reverse PTR `srv908675.hstgr.cloud` (points toward Hostinger-managed server infrastructure; PTR alone is NOT proof of account ownership or exact VPS plan).
- Existing upstream GitHub workflow targets `/home/coachingbuddy/htdocs/coachingbuddy.co.in/` via root SSH and reloads **Nginx**; this is more consistent with a developer-operated VPS than the user's separate Hostinger Business shared account.
- **Do not change DNS or the live website.** Treat the origin server as unconfirmed until the server administrator verifies it.
- The PR is review-only. GitHub's React build and PHP lint passed after the compatibility fix (see PR Checks).

## Information the hosting administrator must verify (NO passwords in chat)
1. Confirm current A records for apex and www, IPv6 AAAA, CDN/reverse proxy, actual server IP and TLS termination. Screenshot the non-secret overview only.
2. Confirm web root for `coachingbuddy.co.in`, Nginx virtual-host server name, current `location /` fallback, API upstream config (redact secrets), PHP-FPM version/socket, user ownership, and whether PHP is allowed in this vhost.
3. Confirm that private storage at `/home/coachingbuddy/htdocs/coachingbuddy-seo-private` is **outside ALL public virtual hosts/aliases**, PHP worker can read it/write its `data` folder, and it cannot be browsed via HTTP. This relative path is required by current PHP sources when installed under the expected document root.
4. Generate a **new** SEO admin password privately; use `password_hash()` in PHP on the server and store hash only in `config.php` (never GitHub, VITE_ build variables, screenshots or this chat). The earlier browser-visible password verifier and shared historical password must be retired.
5. Confirm a rollback window, backup of current `dist`, existing `/api` proxy settings, and availability of staged URL or separate staging vhost.

## Nginx work — server admin only
- See `deployment/nginx-seo-publishing.locations.conf.example` for **illustrative locations** for exact PHP API, dynamic `seo-overrides.json`, and initial HTML via `seo-entry.php`.
- Replace sample FPM socket with the actual one. Merge (do NOT duplicate) existing `location /`.
- Keep existing `/api` and authentication routes untouched; avoid replacing the whole Nginx server block.
- Run `sudo nginx -t` and only then a controlled reload. `.htaccess` is ignored by Nginx.
- Keep static files served as before; note the Vite build still emits a `seo-overrides.json` asset but the Nginx exact match must route to the dynamic published source.
- Do not use the existing automatic SSH deploy job to publish without the private storage + routing already provisioned.

## Staging verification before merge
- Frontend: `cd web && npm ci && npm run build`.
- PHP: lint the 3 entry/API PHP files and the private `bootstrap.php`; verify php-fpm executes PHP, not downloadable source.
- A public `/coaching-institutes/<city>` with test override returns its title, description, canonical and robots in the **HTTP source**; confirm frontend H1/intro/FAQ rendering after JS load. Initial HTML injection is not full SSR/prerendering of React content.
- `/seo-publisher/api.php?action=session` returns unauthenticated before login; incorrect SEO login denied, correct newly rotated password accepted, CSRF rejected when missing; credentials and cookies not available cross-site; logout invalidates session.
- `/seo-overrides.json` and the public published API reflect a test publish immediately; previous version restore reverts only the selected key. Cache bypass verified.
- No unauthorized changes to `/api`, Institute OTP/Google login, Student OTP/login, student profile, contact/Call Now login gate, course search, booking, mobile UI, title/canonical behavior on non-SEO pages.
- Staging must use noindex and non-production credentials, and be inaccessible to unapproved users.
- Rehearse rollback to previous HTML/static bundle and prior Nginx configuration.

## Operational boundary
GitHub collaborator access does not imply shell/VPS access. No DNS changes, SSH commands, Hostinger management action or production deployment were performed by this PR. Contact developer/server administrator for an authorized staging setup; alternatively migrate hosting only through a separately planned ownership and backup process.
