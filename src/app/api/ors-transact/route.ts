import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
export const runtime = 'nodejs';

const COLLECTION = 'ors-transact-listings';
const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const page = parseInt(url.searchParams.get('page') || '1');
    const facilityType = url.searchParams.get('facilityType') || '';
    const state = url.searchParams.get('state') || '';
    const district = url.searchParams.get('district') || '';
    const locality = url.searchParams.get('locality') || '';
    const mode = url.searchParams.get('mode') || ''; // ors_transact | dual | ''
    const sizeMin = url.searchParams.get('sizeMin') || '';
    const sizeMax = url.searchParams.get('sizeMax') || '';

    let q = getDb().collection(COLLECTION).orderBy('ors_property_id');

    if (facilityType) q = q.where('facility_type', '==', facilityType) as any;
    if (state) q = q.where('state', '==', state) as any;
    if (district) q = q.where('district', '==', district) as any;
    if (locality) q = q.where('locality_circle', '==', locality) as any;
    if (mode) q = q.where('listingMode', '==', mode) as any;

    const snapshot = await (q as any).limit(PAGE_SIZE).get();
    const docs = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    // Size filter in-memory (Firestore doesn't support range on string fields easily)
    const filtered = docs.filter((d: any) => {
      if (sizeMin && Number(d.lease_area_as_advertised_in_sq_ft) < Number(sizeMin)) return false;
      if (sizeMax && Number(d.lease_area_as_advertised_in_sq_ft) > Number(sizeMax)) return false;
      return true;
    });

    return NextResponse.json({ listings: filtered, count: filtered.length, page });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Bulk import
    if (body.bulk && Array.isArray(body.listings)) {
      const batch = getDb().batch();
      const results = { imported: 0, skipped: 0 };

      for (const listing of body.listings) {
        if (!listing.ors_property_id) { results.skipped++; continue; }
        const docId = listing.ors_property_id.replace(/\s+/g, '_').toLowerCase();
        const ref = getDb().collection(COLLECTION).doc(docId);
        batch.set(ref, {
          ...listing,
          id: docId,
          createdAt: listing.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          listingMode: listing.listingMode || 'ors_transact',
        }, { merge: true });
        results.imported++;
        // Commit in batches of 499
        if (results.imported % 499 === 0) await batch.commit();
      }
      await batch.commit();
      return NextResponse.json({ success: true, ...results });
    }

    // Single create/update
    const { id, ...data } = body;
    const docId = id || data.ors_property_id?.replace(/\s+/g, '_').toLowerCase() || `ors_${Date.now()}`;
    await getDb().collection(COLLECTION).doc(docId).set({
      ...data, id: docId,
      updatedAt: new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
    }, { merge: true });
    return NextResponse.json({ success: true, id: docId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await getDb().collection(COLLECTION).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
