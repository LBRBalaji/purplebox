'use client';
import * as React from 'react';
import type { SiteOptionSchema } from '@/lib/schema';

export function useSiteOptions() {
  const [siteOptions, setSiteOptions] = React.useState<SiteOptionSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchSiteOptions = React.useCallback(async () => {
    try {
      const res = await fetch('/api/site-options');
      const data = await res.json();
      setSiteOptions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch site options:', e);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchSiteOptions();
    const interval = setInterval(fetchSiteOptions, 60000);
    return () => clearInterval(interval);
  }, [fetchSiteOptions]);

  const addSiteOption = React.useCallback(async (newSiteOption: Omit<SiteOptionSchema, 'siteOptionId'>) => {
    const res = await fetch('/api/site-options', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newSiteOption }),
    });
    const result = await res.json();
    await fetchSiteOptions();
    return result.siteOptionId as string;
  }, [fetchSiteOptions]);

  const updateSiteOption = React.useCallback(async (siteOptionId: string, updates: Partial<SiteOptionSchema>) => {
    await fetch('/api/site-options', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteOptionId, updates }),
    });
    await fetchSiteOptions();
  }, [fetchSiteOptions]);

  const archiveSiteOption = React.useCallback(async (siteOptionId: string) => {
    await updateSiteOption(siteOptionId, { siteStatus: 'archived' });
  }, [updateSiteOption]);

  return { siteOptions, isLoading, addSiteOption, updateSiteOption, archiveSiteOption, refetch: fetchSiteOptions };
}
