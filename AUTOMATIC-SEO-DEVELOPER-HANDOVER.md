# CoachingBuddy Automatic SEO Defaults — Developer Handover

## Goal
Set SEO rules once in code. New user-created institute listings and new categories/cities in the EXISTING student API receive predictable metadata when visited. Keep existing UI and auth behavior unchanged.

## What changed
- Shared automatic SEO templates: web/src/lib/autoSeo.ts.
- City page: SEO title, description, H1, intro, canonical from city name.
- Category page: city + category title/description/H1/canonical from live API data.
- Institute page: institute name, city, area, existing descriptions and stable canonical URL.
- Manual SEO Dashboard overrides still take priority. No JSON entry is needed for standard automatic SEO.
- Institute cards, institute cover/logo/gallery and home banners/categories use role-aware alt text derived from existing data. The template does not claim to know what every photo depicts; authors can still provide more specific descriptions in a future CMS.
- Shared SEO component now exposes Open Graph and Twitter image alt properties.
- Build script web/scripts/generate-auto-seo-html.mjs reads the sitemap produced by the existing API-driven prebuild generator and writes per-URL initial HTML for city/category/institute pages. No additional API requests required.
- No changes to Student/Institute OTP, Google login, Call Now gating, booking, API endpoints, layouts or navigation.

## URL examples (generated from API/sitemap, not hardcoded)
- /coaching-institutes/pune -> Best Coaching Institutes in Pune - Courses, Fees & Reviews
- /coaching-institutes/pune/jee -> Best Jee Coaching Institutes in Pune
- /institute/pune/institute-slug--ID -> Institute Slug Coaching in Pune - Courses, Fees & Reviews

## IMPORTANT: What "automatic" does and does not mean
1. At runtime, when the React page loads a new institute/category/city record, SEO title, meta description, canonical and alt text are computed automatically, without using SEO Admin. The existing UI/UX and student call/login flow are preserved.
2. For search bots and social link previews, the INITIAL HTTP HTML needs these tags too. This branch handles that automatically AT BUILD TIME for paths in web/public/sitemap.xml.
3. A new institute created AFTER the last build does NOT immediately get a prerendered initial HTML file. The VPS currently deploys only when upstream main is pushed. To update bot-visible static HTML for newly added listings, a subsequent build/deploy must run, OR the site needs SSR/dynamic HTML rendering on its server/edge. Without backend or VPS access we cannot reliably trigger new static HTML on every database insert.
4. The existing sitemap generator requests categories/stores at build time; if the API is unavailable it falls back to static routes and cannot generate HTML for unseen listings. QA the network response and inspect generated paths.
5. Existing site VPS/Nginx must serve /coaching-institutes/.. and /institute/.. directory index.html from dist. If it always falls back to root index.html, Google may see generic tags. Verify view-source after deploying, not only browser DevTools.
6. No separate service page route/API exists in this examined web repository. A buildAutoServiceSeo helper is supplied for FUTURE service routes, but the helper does not magically create service pages.
7. An image's alt text should describe the image itself. Here it uses available institute/category data and image role; manually edit inaccurate alt in a content management system if actual image differs. Do not keyword stuff.

## Publishing and review
- Branch feature/automatic-seo-defaults is isolated from the earlier PHP and Cloudflare Worker SEO publishing proposals; do not merge multiple proposals blindly.
- Test with the fork's automatic-seo-review CI: npm ci, npm run build, static HTML smoke tests.
- Promote via authorized upstream GitHub PR; fork branch does NOT auto-deploy developer VPS. Upstream workflow auto-deploys main only.
- After deploy verify initial title/description/canonical for existing and newly built listing URLs, UI image alt, manual SEO overrides, all Student/Institute login/OTP/Google/Call Now and booking flows, mobile UI, and existing /api.
- Do not change DNS or VPS permissions for this code-only implementation.

## Operational suggestion
To avoid re-deploying manually after every listing change, ask the backend owner to trigger a signed/authorized GitHub Actions rebuild after listing approval, or arrange scheduled build/deploy from the upstream repository with appropriate safety checks. This requires cooperation from the upstream owner and existing deploy permissions; do not embed an SSH key or GitHub token in public frontend code.
