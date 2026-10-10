import { useEffect, useState } from 'react';
import { fetchPublishedSeoConfig, SeoOverride, sanitizeSeoOverride } from '../lib/seoAdmin';

let publishedConfigPromise: ReturnType<typeof fetchPublishedSeoConfig> | null = null;

function getPublishedConfig() {
  if (!publishedConfigPromise) {
    publishedConfigPromise = fetchPublishedSeoConfig();
  }
  return publishedConfigPromise;
}

export function resetSeoOverrideCache(): void {
  publishedConfigPromise = null;
}

export function useSeoOverride(key: string): SeoOverride | undefined {
  const [override, setOverride] = useState<SeoOverride | undefined>(undefined);

  useEffect(() => {
    let active = true;
    if (!key) {
      setOverride(undefined);
      return () => {
        active = false;
      };
    }

    getPublishedConfig().then((config) => {
      if (!active) return;
      setOverride(sanitizeSeoOverride(config.entries?.[key]));
    });

    return () => {
      active = false;
    };
  }, [key]);

  return override;
}
