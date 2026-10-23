// Build-time SEO metadata HTML for selected public URLs.
// Vite UI and authentication routes remain unchanged.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const dist = new URL('../dist/', import.meta.url);
const source = new URL('../dist/index.html', import.meta.url);
const configSource = new URL('../public/seo-overrides.json', import.meta.url);
const SITE = 'https://coachingbuddy.co.in';
const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function meta(html, name, content, attr = 'name') {
  const rule = new RegExp('<meta[^>]*' + attr + '="' + name + '"[^>]*>', 'i');
  const tag = '<meta ' + attr + '="' + esc(name) + '" content="' + esc(content) + '" />';
  return rule.test(html) ? html.replace(rule, tag) : html.replace('</head>', tag + '\n</head>');
}
function matches(key, parts) {
  if (key.startsWith('city:')) return parts.length === 2 && parts[0] === 'coaching-institutes' && 'city:' + parts[1] === key;
  if (key.startsWith('category:')) return parts.length === 3 && parts[0] === 'coaching-institutes' && 'category:' + parts[1] + ':' + parts[2] === key;
  if (key.startsWith('institute:')) return parts.length === 3 && parts[0] === 'institute' && parts[2].endsWith('--' + key.slice(10));
  return false;
}
async function main() {
  const template = await readFile(source, 'utf8');
  const cfg = JSON.parse(await readFile(configSource, 'utf8'));
  if (cfg?.version !== 1 || !cfg.entries || Array.isArray(cfg.entries)) throw new Error('Invalid SEO config');
  let count = 0;
  for (const [key, entry] of Object.entries(cfg.entries)) {
    if (!entry || typeof entry !== 'object' || !entry.canonical) continue;
    const canonical = new URL(entry.canonical);
    if (canonical.origin !== SITE || canonical.search || canonical.hash) throw new Error('Invalid canonical: ' + key);
    const parts = canonical.pathname.split('/').filter(Boolean);
    if (!parts.every(x => /^[A-Za-z0-9_-]+$/.test(x)) || !matches(key, parts)) throw new Error('SEO path and key mismatch: ' + key);
    let html = template;
    const title = String(entry.title || '').trim();
    const description = String(entry.description || '').trim();
    if (title) {
      html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + esc(title) + '</title>');
      html = meta(html, 'og:title', title, 'property');
      html = meta(html, 'twitter:title', title);
    }
    if (description) {
      html = meta(html, 'description', description);
      html = meta(html, 'og:description', description, 'property');
      html = meta(html, 'twitter:description', description);
    }
    html = html.replace(/<link[^>]*rel="canonical"[^>]*>/i, '<link rel="canonical" href="' + esc(canonical.href) + '" />');
    html = meta(html, 'og:url', canonical.href, 'property');
    html = meta(html, 'robots', entry.index === false ? 'noindex, follow' : 'index, follow, max-image-preview:large');
    const faqs = Array.isArray(entry.faqs) ? entry.faqs.filter(x => x?.question && x?.answer).slice(0, 12) : [];
    if (faqs.length) {
      const schema = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(x => ({ '@type': 'Question', name: String(x.question), acceptedAnswer: { '@type': 'Answer', text: String(x.answer) } })),
      }).replace(/</g, '\\u003c');
      html = html.replace('</head>', '<script type="application/ld+json">' + schema + '</script>\n</head>');
    }
    const directory = new URL('./' + parts.join('/') + '/', dist);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL('index.html', directory), html, 'utf8');
    count++;
  }
  console.log('[seo] Static metadata HTML generated for ' + count + ' page(s).');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
