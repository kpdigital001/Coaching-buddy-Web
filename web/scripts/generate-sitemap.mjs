import { writeFile } from 'node:fs/promises';

const SITE_URL = 'https://coachingbuddy.co.in';
const API_URL = process.env.COACHING_BUDDY_API_URL || `${SITE_URL}/api`;

const slugify = (value = '') =>
  String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const xmlEscape = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const institutePath = (store) => {
  const id = store.uid || store.id;
  const name = slugify(store.name) || 'coaching-institute';
  const city = slugify(store.address?.city) || 'india';
  return `/institute/${city}/${name}--${encodeURIComponent(id)}`;
};

const categoryPath = (name, city = 'india') =>
  `/coaching-institutes/${slugify(city) || 'india'}/${slugify(name) || 'coaching'}`;

const cityPath = (city) => `/coaching-institutes/${slugify(city)}`;

async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Sitemap API request failed: ${response.status} ${path}`);
  }

  return response.json();
}

function urlEntry(loc, changefreq = 'weekly', priority = '0.7') {
  return [
    '  <url>',
    `    <loc>${xmlEscape(`${SITE_URL}${loc}`)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

async function main() {
  const staticEntries = [
    urlEntry('/', 'daily', '1.0'),
    urlEntry('/explore', 'daily', '0.9'),
    urlEntry('/about', 'monthly', '0.6'),
    urlEntry('/contact-support', 'monthly', '0.5'),
    urlEntry('/privacy-policy', 'yearly', '0.3'),
    urlEntry('/terms', 'yearly', '0.3'),
  ];

  let categories = [];
  let stores = [];

  try {
    const [categoryResponse, storeResponse] = await Promise.all([
      getJson('/category/parents'),
      getJson('/store?status=1'),
    ]);

    categories = Array.isArray(categoryResponse?.data) ? categoryResponse.data : [];
    stores = Array.isArray(storeResponse?.data) ? storeResponse.data : [];
  } catch (error) {
    console.warn('[sitemap] Dynamic API data unavailable. Writing static sitemap only.');
    console.warn(error instanceof Error ? error.message : error);
  }

  const cities = [...new Set(stores.map((store) => store.address?.city).filter(Boolean))];

  const categoryEntries = categories.flatMap((category) => {
    const categoryId = String(category.uid || category.id || '');
    const categoryName = category.name || '';

    const matchingStores = stores.filter((store) => {
      const storeCategories = Array.isArray(store.categories) ? store.categories : [];
      return storeCategories.some((storeCategory) => {
        const storeCategoryId = String(storeCategory.uid || storeCategory.id || '');
        const storeCategoryName = String(storeCategory.name || '');
        return (
          (categoryId && storeCategoryId === categoryId) ||
          (categoryName && slugify(storeCategoryName) === slugify(categoryName))
        );
      });
    });

    if (matchingStores.length === 0) return [];

    const categoryCities = [
      ...new Set(matchingStores.map((store) => store.address?.city).filter(Boolean)),
    ];

    return [
      urlEntry(categoryPath(categoryName, 'india'), 'daily', '0.8'),
      ...categoryCities.map((city) => urlEntry(categoryPath(categoryName, city), 'daily', '0.7')),
    ];
  });

  const dynamicEntries = [
    ...cities.map((city) => urlEntry(cityPath(city), 'daily', '0.8')),
    ...categoryEntries,
    ...stores
      .filter((store) => (store.uid || store.id) && store.name)
      .map((store) => urlEntry(institutePath(store), 'weekly', '0.8')),
  ];

  const uniqueEntries = [...new Set([...staticEntries, ...dynamicEntries])];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniqueEntries,
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf8');
  console.log(`[sitemap] Generated ${uniqueEntries.length} URLs.`);
}

main().catch((error) => {
  console.error('[sitemap] Generation failed.', error);
  process.exitCode = 1;
});
