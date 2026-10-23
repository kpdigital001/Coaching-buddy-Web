/**
 * One-time automatic SEO templates for dynamic CoachingBuddy content.
 * Populated from the existing student API. No new fields or backend changes.
 * Manual SEO overrides retain precedence on public pages.
 */
import type { StudentInstitute } from '../types/student';
import { buildCategoryPath, buildCityPath, buildInstitutePath } from './seoUrls';

export interface AutoSeoMetadata {
  title: string;
  description: string;
  h1: string;
  intro: string;
  canonicalPath: string;
}

const nameOf = (value: string | null | undefined, fallback: string): string =>
  String(value || '').replace(/\s+/g, ' ').trim() || fallback;

export function buildAutoCitySeo(city: string): AutoSeoMetadata {
  const cityName = nameOf(city, 'India');
  return {
    title: `Best Coaching Institutes in ${cityName} - Courses, Fees & Reviews`,
    description: `Explore coaching institutes in ${cityName}. Compare available courses, fees, locations and student reviews on Coaching Buddy.`,
    h1: `Top Coaching Institutes in ${cityName}`,
    intro: 'Browse verified academies, programs, expert faculties, fees, and authentic student reviews across all competitive exams.',
    canonicalPath: buildCityPath(cityName),
  };
}

export function buildAutoCategorySeo(category: string, city?: string | null): AutoSeoMetadata {
  const categoryName = nameOf(category, 'Coaching');
  const cityName = nameOf(city, '');
  return {
    title: cityName
      ? `Best ${categoryName} Coaching Institutes in ${cityName}`
      : `Best ${categoryName} Coaching Institutes in India`,
    description: `Explore ${categoryName} coaching institutes${cityName ? ` in ${cityName}` : ' across India'}. Compare available courses, fees, locations and student reviews.`,
    h1: cityName
      ? `Top ${categoryName} Coaching Institutes in ${cityName}`
      : `Top Coaching Institutes for ${categoryName}`,
    intro: 'Compare syllabus, classroom programs, faculties, fees, and student reviews across verified coaching centers.',
    canonicalPath: buildCategoryPath(categoryName, cityName || 'india'),
  };
}

export function buildAutoExploreSeo(): AutoSeoMetadata {
  return {
    title: 'Explore Coaching Institutes & Exam Categories in India',
    description: 'Explore coaching institutes across India by exam category, city, courses, fees and student reviews on Coaching Buddy.',
    h1: 'Explore All Coaching Categories & Institutes',
    intro: 'Browse verified academies, programs, expert faculties, fees, and authentic student reviews across all competitive exams.',
    canonicalPath: '/explore',
  };
}

export function buildAutoInstituteSeo(institute: StudentInstitute): AutoSeoMetadata {
  const instituteName = nameOf(institute.name, 'Coaching Institute');
  const city = nameOf(institute.address?.city, 'India');
  const area = nameOf(institute.address?.area, '');
  return {
    title: `${instituteName} Coaching in ${city} - Courses, Fees & Reviews`,
    description: `${instituteName}${area ? ` in ${area}` : ''}${city !== 'India' ? `, ${city}` : ''}. Compare available courses, fees, admission details, contact information and student reviews on Coaching Buddy.`,
    h1: instituteName,
    intro: institute.longDescription || institute.shortDescription || '',
    canonicalPath: buildInstitutePath(institute),
  };
}

/** Available for future service pages; does not create routes or imply services exist. */
export function buildAutoServiceSeo(service: string, city?: string | null): AutoSeoMetadata {
  const serviceName = nameOf(service, 'Coaching Services');
  const cityName = nameOf(city, '');
  return {
    title: `${serviceName}${cityName ? ` in ${cityName}` : ' in India'} | Coaching Buddy`,
    description: `Explore ${serviceName.toLowerCase()}${cityName ? ` in ${cityName}` : ' across India'}. Find relevant coaching information and compare available institutes on Coaching Buddy.`,
    h1: `${serviceName}${cityName ? ` in ${cityName}` : ''}`,
    intro: `Explore available ${serviceName.toLowerCase()} and related coaching institutes.`,
    canonicalPath: '',
  };
}

/**
 * Alt describes the image's role; it does not pretend to inspect image pixels.
 * For purely decorative images, use alt="" instead.
 */
export function instituteImageAlt(
  institute: Pick<StudentInstitute, 'name' | 'address'>,
  kind: 'cover' | 'logo' | 'gallery' = 'cover',
  position?: number,
): string {
  const name = nameOf(institute.name, 'Coaching institute');
  const locality = [institute.address?.area, institute.address?.city]
    .map((value) => nameOf(value, ''))
    .filter(Boolean)
    .join(', ');
  const suffix = locality ? ` in ${locality}` : '';
  if (kind === 'logo') return `${name} logo`;
  if (kind === 'gallery') return `${name} gallery photo${position ? ` ${position}` : ''}${suffix}`;
  return `${name} coaching institute${suffix}`;
}

export function categoryImageAlt(category: string): string {
  return `${nameOf(category, 'Coaching')} coaching category`;
}
export function bannerImageAlt(title?: string): string {
  return nameOf(title, 'Coaching Buddy coaching courses and institutes');
}
