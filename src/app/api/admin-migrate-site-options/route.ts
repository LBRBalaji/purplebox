import { getDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// ONE-TIME MIGRATION: moves all documents from the old 'site-options'
// Firestore collection into the 'listings' collection with status 'sourced'.
//
// The old siteOptionSchema stored warehouse details inside a nested 'details'
// object. The new architecture uses ListingSchema directly with status='sourced'.
// This endpoint flattens each document and writes it to the listings collection.
//
// Safe to run multiple times — uses the original siteOptionId as a stable
// key so re-running won't create duplicates.

const headers = { 'Content-Type': 'application/json' };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Basic protection — require a confirmation param
  if (searchParams.get('confirm') !== 'migrate') {
    return NextResponse.json({
      message: 'Add ?confirm=migrate to the URL to run the migration.',
      usage: '/api/admin-migrate-site-options?confirm=migrate'
    }, { status: 400, headers });
  }

  try {
    const db = getDb();

    // 1. Read all documents from the old site-options collection
    const snapshot = await db.collection('site-options').get();

    if (snapshot.empty) {
      return NextResponse.json({
        message: 'No documents found in the site-options collection.',
        migrated: 0,
        skipped: 0,
      }, { headers });
    }

    const results: { id: string; location: string; status: string }[] = [];
    let migrated = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
      const old = doc.data();

      // Skip archived entries
      if (old.siteStatus === 'archived') {
        skipped++;
        results.push({ id: doc.id, location: old.details?.location || '?', status: 'skipped (archived)' });
        continue;
      }

      // Use the old siteOptionId as the new listingId for idempotency
      const newListingId = 'SRC-' + doc.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);

      // Check if already migrated
      const existing = await db.collection('listings').doc(newListingId).get();
      if (existing.exists) {
        skipped++;
        results.push({ id: newListingId, location: old.details?.location || '?', status: 'skipped (already exists)' });
        continue;
      }

      // Flatten the nested details into a proper ListingSchema document
      const d = old.details || {};
      const newListing = {
        listingId: newListingId,
        status: 'sourced',
        plan: 'Free',
        listingType: 'Owner',
        developerId: old.createdBy || old.sourcedBy || 'migrated',
        createdBy: old.createdBy || old.sourcedBy,
        createdAt: old.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Flatten top-level fields from details
        location: d.location || '',
        sizeSqFt: d.sizeSqFt || 0,
        availabilityDate: d.availabilityDate,
        constructionProgress: d.constructionProgress,
        warehouseModel: d.warehouseModel,
        rentPerSqFt: d.rentPerSqFt,
        rentalSecurityDeposit: d.rentalSecurityDeposit,
        // Nested structures preserved as-is
        area: d.area,
        buildingSpecifications: d.buildingSpecifications,
        siteSpecifications: d.siteSpecifications,
        certificatesAndApprovals: d.certificatesAndApprovals,
        documents: d.documents || [],
        description: d.description,
        additionalInformation: d.additionalInformation,
        // Site Options specific fields
        demandIds: old.demandIds || [],
        sourceNotes: old.sourceNotes,
        // Keep the old ID as a reference so admin can trace provenance
        migratedFromSiteOptionId: doc.id,
      };

      // Remove undefined fields before writing
      const clean = Object.fromEntries(Object.entries(newListing).filter(([_, v]) => v !== undefined));

      await db.collection('listings').doc(newListingId).set(clean);
      migrated++;
      results.push({ id: newListingId, location: d.location || '?', status: 'migrated ✓' });
    }

    return NextResponse.json({
      message: `Migration complete. ${migrated} migrated, ${skipped} skipped.`,
      migrated,
      skipped,
      total: snapshot.docs.length,
      results,
    }, { headers });

  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({ message: 'Migration failed: ' + error.message }, { status: 500, headers });
  }
}
