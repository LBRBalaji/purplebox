'use client';
// Site Options hook — reads from the 'listings' collection filtered to
// status === 'sourced' (admin-created internal inventory) or status === 'approved'
// (developer-submitted listings shown read-only in the Site Options view).
//
// WRITES go directly to PATCH /api/listings, never through the data-context's
// addListing / persistListings path which uses the dangerous POST full-rewrite.
import * as React from 'react';
import type { ListingSchema } from '@/lib/schema';

export function useSiteOptions() {
  const [allListings, setAllListings] = React.useState<ListingSchema[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchListings = React.useCallback(async () => {
    try {
      const res = await fetch('/api/listings');
      const data = await res.json();
      setAllListings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('useSiteOptions: failed to fetch listings', e);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    // Auto-migrate any entries from the old site-options collection on first load.
    // Runs silently in the background — idempotent, safe to call every time.
    fetch('/api/admin-migrate-site-options?confirm=migrate')
      .then(r => r.json())
      .then(result => {
        if (result.migrated > 0) {
          console.info(`[Site Options] Auto-migrated ${result.migrated} entry/entries from old collection.`);
          fetchListings(); // refresh to show newly migrated entries
        }
      })
      .catch(() => {}); // silent — never surface migration errors to the user
    fetchListings();
    const interval = setInterval(fetchListings, 60000);
    return () => clearInterval(interval);
  }, [fetchListings]);

  // Site Options surface: sourced (internal) + approved (developer-submitted, read-only here)
  const siteOptions = allListings.filter(
    l => l.status === 'sourced' || l.status === 'approved'
  );

  // Create a new sourced listing — PATCH only, never POST
  const addSourcedListing = React.useCallback(async (listing: ListingSchema) => {
    const payload = { ...listing, status: 'sourced' as const };
    const res = await fetch('/api/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newListing: payload }),
    });
    const result = await res.json();
    await fetchListings();
    return result.listingId as string;
  }, [fetchListings]);

  // Update any field on a sourced listing — PATCH single document
  const updateSourcedListing = React.useCallback(async (listingId: string, updates: Partial<ListingSchema>) => {
    await fetch('/api/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, updates }),
    });
    await fetchListings();
  }, [fetchListings]);

  // Archive a sourced listing — sets status to 'rejected' (invisible everywhere)
  // When a developer later submits the same warehouse formally, their fresh 'pending'
  // listing is the active record; the admin manually archives this one.
  const archiveSourcedListing = React.useCallback(async (listingId: string) => {
    await updateSourcedListing(listingId, { status: 'rejected' as any });
  }, [updateSourcedListing]);

  // Update demand links on a sourced listing
  const updateDemandLinks = React.useCallback(async (listingId: string, demandIds: string[]) => {
    await updateSourcedListing(listingId, { demandIds } as any);
  }, [updateSourcedListing]);

  return {
    siteOptions,
    isLoading,
    addSourcedListing,
    updateSourcedListing,
    archiveSourcedListing,
    updateDemandLinks,
    refetch: fetchListings,
  };
}
