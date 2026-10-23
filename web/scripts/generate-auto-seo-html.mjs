/**
 * Generate bot-visible initial HTML metadata from the sitemap already produced
 * by the existing prebuild API-driven sitemap generator.
 *
 * No new network calls. Does not change existing React or user authentication.
 * New records appear in HTML after the NEXT successful site build/deployment.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const site = 'https://coachingbuddy.co.in';
const dist = new URL('../dist/', import.meta.url);
const htmlFile = new URL('../dist/index.html', import.meta.url);
const sitemapFile = new URL('../public/sitemap.xml', import.meta.url);

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const humanize = (s) => {
  try { return decodeURIComponent(s).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }
  catch { return s.replace(/-/g, ' '); }
};
function meta(html, attribute, name, value) {
  const pattern = new RegExp('<meta\\s+[^>]*\\b' + attribute + '="' + name + '"[^>]*>', 'i');
  const tag = '<meta ' + attribute + '="' + esc(name) + '" content="' + esc(value) + '" />';
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', tag + '\n</head>');
}
function metadata(parts) {
  if (parts[0] === 'coaching-institutes' && parts.length === 2) {
    const city = humanize(parts[1]);
    return {
      title: 'Best Coaching Institutes in ' + city + ' - Courses, Fees & Reviews',
      description: 'Explore coaching institutes in ' + city + '. Compare available courses, fees, locations and student reviews on Coaching Buddy.',
    };
  }
  if (parts[0] === 'coaching-institutes' && parts.length === 3) {
    const city = humanize(parts[1]);
    const category = humanize(parts[2]);
    const suffix = city.toLowerCase() === 'india' ? ' across India' : ' in ' + city;
    return {
      title: 'Best ' + category + ' Coaching Institutes in ' + city,
      description: 'Explore ' + category + ' coaching institutes' + suffix + '. Compare available courses, fees, locations and student reviews.',
    };
  }
  if (parts[0] === 'institute' && parts.length === 3 && parts[2].includes('--')) {
    const city = humanize(parts[1]);
    const name = humanize(parts[2].slice(0, parts[2].lastIndexOf('--')));
    return {
      title: name + ' Coaching in ' + city + ' - Courses, Fees & Reviews',
      description: name + ' in ' + city + '. Compare available courses, fees, admission details, contact information and student reviews on Coaching Buddy.',
    };
  }
  return null;
}
function buildHtml(template, target, values) {
  const title = values.title + ' | Coaching Buddy';
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + esc(title) + '</title>');
  html = meta(html, 'name', 'description', values.description);
  html = meta(html, 'property', 'og:title', title);
  html = meta(html, 'property', 'og:description', values.description);
  html = meta(html, 'property', 'og:url', target);
  html = meta(html, 'name', 'twitter:title', title);
  html = meta(html, 'name', 'twitter:description', values.description);
  html = html.replace(/<link\s+[^>]*rel="canonical"[^>]*>/i, '<link rel="canonical" href="' + esc(target) + '" />');
  return html;
}
async function main() {
  const [template, sitemap] = await Promise.all([readFile(htmlFile, 'utf8'), readFile(sitemapFile, 'utf8')]);
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    match[1].replace(/&amp;/g, '&').replace(/&apos;/g, "'").replace(/&quot;/g, '"')
  );
  let generated = 0;
  for (const loc of new Set(locs)) {
    let url;
    try { url = new URL(loc); } catch { continue; }
    if (url.origin !== site || url.search || url.hash) continue;
    const parts = url.pathname.split('/').filter(Boolean);
    // Only public discovery routes. Never overwrite student/institute auth or API.
    if (!parts.every((part) => /^[a-zA-Z0-9_-]+$/.test(part))) continue;
    const values = metadata(parts);
    if (!values) continue;
    const dir = new URL('./' + parts.join('/') + '/', dist);
    await mkdir(dir, { recursive: true });
    await writeFile(new URL('index.html', dir), buildHtml(template, url.href, values), 'utf8');
    generated++;
  }
  console.log('[seo] Built automatic initial HTML for ' + generated + ' public city, category and institute URL(s).');
}
main().catch((err) => { console.error('[seo] Unable to generate static metadata:', err); process.exitCode = 1; });
