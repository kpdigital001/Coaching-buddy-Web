# CoachingBuddy Production Frontend

This is the existing CoachingBuddy React/Vite frontend with SEO enhancements applied without replacing the site's original UI/UX or account/contact flows.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The production output is generated in `dist/`.

## Production routes

- Student login: `/student/login`
- Institute login: `/institute/login`
- SEO Admin password screen: `/seo-admin/login`
- SEO Admin dashboard: `/seo-admin`

Keep the existing backend/API available at the URL configured by `VITE_SERVER_URL`.

## SEO Admin access

The authorized SEO email is configured in `.env` with `VITE_SEO_ADMIN_EMAILS`.

SEO Admin uses two layers without changing normal user authentication:
1. Existing institute account authentication (OTP/Google) remains unchanged.
2. `/seo-admin` then requires the separate SEO-only password gate.

The plaintext SEO password is not stored in the source. Only its SHA-256 verifier is configured in `.env`.

The SEO password session is stored in `sessionStorage`, expires after 8 hours, and is cleared when the browser session closes. The SEO logout button clears only this SEO session and does not modify normal institute/student authentication.

The SEO Admin URLs are intentionally not shown in the public navigation/footer.

## SEO Admin direct login
`/seo-admin` is isolated from the normal institute/student authentication flow. When the SEO session is not present it goes only to `/seo-admin/login`, where the configured SEO Admin email and password are used. Normal Student and Institute login behavior is unchanged.
