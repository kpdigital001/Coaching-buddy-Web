import React, { useEffect } from 'react';
import { SITE_NAME, SITE_URL } from '../../lib/seoUrls';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  robots?: string;
  structuredData?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_TITLE = 'Coaching Buddy - Find Top Coaching Institutes for JEE, NEET, Boards & UPSC';
const DEFAULT_DESCRIPTION =
  'Discover and compare verified coaching institutes across India for JEE, NEET, UPSC, Foundation and School Boards. Explore courses, fees, reviews and admission options on Coaching Buddy.';
const DEFAULT_IMAGE = `${SITE_URL}/student-logo.png`;

const normalizeUrl = (url: string) => {
  try {
    const parsed = new URL(url, SITE_URL);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return SITE_URL;
  }
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  structuredData,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const currentUrl = normalizeUrl(
    url || (typeof window !== 'undefined' ? `${SITE_URL}${window.location.pathname}` : SITE_URL)
  );

  useEffect(() => {
    document.title = fullTitle;

    const setMetaTag = (attrName: 'name' | 'property', attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);
    setMetaTag('name', 'author', 'Coaching Buddy');

    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:locale', 'en_IN');

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    const scriptId = 'coaching-buddy-schema-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (structuredData) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } else if (script) {
      script.remove();
    }
  }, [fullTitle, description, image, currentUrl, type, robots, structuredData]);

  return null;
};

export default SEO;
