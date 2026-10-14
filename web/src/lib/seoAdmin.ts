import { absoluteUrl, slugifySeo } from './seoUrls';

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface SeoOverride {
  title?: string;
  description?: string;
  h1?: string;
  intro?: string;
  canonical?: string;
  index?: boolean;
  faqs?: SeoFaq[];
  updatedAt?: string;
}

export interface SeoConfig {
  version: 1;
  generatedAt: string;
  entries: Record<string, SeoOverride>;
  revision?: number;
}

export const SEO_DRAFT_STORAGE_KEY = 'COACHING_BUDDY_SEO_DRAFT_CONFIG_V1';
export const SEO_PUBLISHED_CONFIG_PATH = '/seo-publisher/api.php?action=published';

export function createEmptySeoConfig(): SeoConfig {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries: {},
  };
}

export function citySeoKey(city: string): string {
  return `city:${slugifySeo(city) || 'india'}`;
}

export function categorySeoKey(city: string, category: string): string {
  return `category:${slugifySeo(city) || 'india'}:${slugifySeo(category) || 'coaching'}`;
}

export function instituteSeoKey(instituteId: string): string {
  return `institute:${instituteId}`;
}

export function normalizeCanonicalUrl(value: string | null | undefined, fallbackPath: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return absoluteUrl(fallbackPath);
  return /^https?:\/\//i.test(trimmed) ? trimmed : absoluteUrl(trimmed);
}

export function readSeoDraftConfig(): SeoConfig {
  if (typeof window === 'undefined') return createEmptySeoConfig();
  const raw = window.localStorage.getItem(SEO_DRAFT_STORAGE_KEY);
  if (!raw) return createEmptySeoConfig();

  try {
    const parsed = JSON.parse(raw) as SeoConfig;
    if (parsed?.version === 1 && parsed.entries && typeof parsed.entries === 'object') {
      return parsed;
    }
  } catch {
    // Ignore invalid local draft and return a clean config.
  }

  return createEmptySeoConfig();
}

export function writeSeoDraftConfig(config: SeoConfig): void {
  if (typeof window === 'undefined') return;
  const normalized: SeoConfig = {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries: config.entries || {},
  };
  window.localStorage.setItem(SEO_DRAFT_STORAGE_KEY, JSON.stringify(normalized));
}

export function saveSeoDraftEntry(key: string, entry: SeoOverride): SeoConfig {
  const config = readSeoDraftConfig();
  const next: SeoConfig = {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries: {
      ...config.entries,
      [key]: {
        ...entry,
        updatedAt: new Date().toISOString(),
      },
    },
  };
  writeSeoDraftConfig(next);
  return next;
}

export function removeSeoDraftEntry(key: string): SeoConfig {
  const config = readSeoDraftConfig();
  const nextEntries = { ...config.entries };
  delete nextEntries[key];
  const next: SeoConfig = {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries: nextEntries,
  };
  writeSeoDraftConfig(next);
  return next;
}

export function sanitizeSeoOverride(entry: SeoOverride | undefined): SeoOverride | undefined {
  if (!entry) return undefined;
  return {
    title: entry.title?.trim() || undefined,
    description: entry.description?.trim() || undefined,
    h1: entry.h1?.trim() || undefined,
    intro: entry.intro?.trim() || undefined,
    canonical: entry.canonical?.trim() || undefined,
    index: entry.index !== false,
    faqs: (entry.faqs || [])
      .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
      .filter((faq) => faq.question && faq.answer),
    updatedAt: entry.updatedAt,
  };
}

export async function fetchPublishedSeoConfig(): Promise<SeoConfig> {
  try {
    const response = await fetch(SEO_PUBLISHED_CONFIG_PATH, { cache: 'no-store' });
    if (!response.ok) return createEmptySeoConfig();
    const result = (await response.json()) as { config?: SeoConfig };
    const parsed = result.config as SeoConfig;
    if (parsed?.version === 1 && parsed.entries && typeof parsed.entries === 'object') {
      return parsed;
    }
  } catch {
    // Missing file or malformed JSON should never break public pages.
  }
  return createEmptySeoConfig();
}

export function downloadSeoConfig(config: SeoConfig, filename = 'seo-overrides.json'): void {
  if (typeof window === 'undefined') return;
  const normalized: SeoConfig = {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries: Object.fromEntries(
      Object.entries(config.entries || {})
        .map(([key, value]) => [key, sanitizeSeoOverride(value)])
        .filter(([, value]) => Boolean(value))
    ) as Record<string, SeoOverride>,
  };
  const blob = new Blob([JSON.stringify(normalized, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}