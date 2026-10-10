import { StudentInstitute } from '../types/student';

export const SITE_URL = 'https://coachingbuddy.co.in';
export const SITE_NAME = 'Coaching Buddy';

export function slugifySeo(value: string | null | undefined): string {
  return (value || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function humanizeSlug(slug: string | null | undefined): string {
  const clean = (slug || '').replace(/-/g, ' ').trim();
  if (!clean) return '';
  return clean.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isAllIndiaCity(city: string | null | undefined): boolean {
  const slug = slugifySeo(city);
  return !slug || slug === 'india' || slug === 'all' || slug === 'all-cities';
}

export function buildInstitutePath(institute: Pick<StudentInstitute, 'id' | 'name' | 'address'>): string {
  const city = slugifySeo(institute.address?.city) || 'india';
  const name = slugifySeo(institute.name) || 'coaching-institute';
  return `/institute/${city}/${name}--${encodeURIComponent(institute.id)}`;
}

export function extractInstituteIdFromSlug(slug: string | null | undefined): string {
  if (!slug) return '';
  const separatorIndex = slug.lastIndexOf('--');
  if (separatorIndex === -1) return '';
  const rawId = slug.slice(separatorIndex + 2);
  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
}

export function buildCityPath(city: string): string {
  const citySlug = slugifySeo(city) || 'india';
  return `/coaching-institutes/${citySlug}`;
}

export function buildCategoryPath(categoryName: string, city: string = 'india'): string {
  const citySlug = slugifySeo(city) || 'india';
  const categorySlug = slugifySeo(categoryName) || 'coaching';
  return `/coaching-institutes/${citySlug}/${categorySlug}`;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
