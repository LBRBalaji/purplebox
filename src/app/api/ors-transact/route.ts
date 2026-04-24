import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
export const runtime = 'nodejs';

const COLLECTION = 'ors-transact-listings';
const PAGE_SIZE = 24; // 3-col grid friendly

// Seeded shuffle — same seed gives same order, different seed = different shuffle
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const page = parseInt(url.searchParams.get('page') || '1');
    const facilityType = url.searchParams.get('facilityType') || '';
    const state = url.searchParams.get('state') || '';
    const district = url.searchParams.get('district') || '';
    const locality = url.searchParams.get('locality') || '';
    const sizeMin = url.searchParams.get('sizeMin') || '';
    const sizeMax = url.searchParams.get('sizeMax') || '';
    const search = url.searchParams.get('search') || '';
    // Daily seed — changes every day so shuffle is different each day
    const seed = parseInt(url.searchParams.get('seed') || String(Math.floor(Date.now() / 86400000)));

    // ── Metadata endpoints ──────────────────────────────────────────────────
    // Return distinct values for filter dropdowns
    if (url.searchParams.get('meta') === 'states') {
      const snap = await getDb().collection(COLLECTION).select('state').get();
      const states = [...new Set(snap.docs.map((d: any) => d.data().state).filter(Boolean))].sort();
      return NextResponse.json({ states });
    }
    if (url.searchParams.get('meta') === 'localities') {
      const stateFilter = url.searchParams.get('state') || '';
      let q: any = getDb().collection(COLLECTION).select('locality_circle');
      if (stateFilter) q = q.where('state', '==', stateFilter);
      const snap = await q.get();
      const localities = [...new Set(snap.docs.map((d: any) => d.data().locality_circle).filter(Boolean))].sort();
      return NextResponse.json({ localities });
    }

    // ── Main query ──────────────────────────────────────────────────────────
    let q: any = getDb().collection(COLLECTION);

    // Apply Firestore equality filters (these use indexes efficiently)
    if (facilityType) q = q.where('facility_type', '==', facilityType);
    if (state) q = q.where('state', '==', state);
    if (district) q = q.where('district', '==', district);
    if (locality) q = q.where('locality_circle', '==', locality);

    // Fetch ALL matching docs (for search + shuffle + pagination to work correctly)
    // Firestore limit: we fetch all matches then paginate in memory
    const snapshot = await q.get();
    let docs: any[] = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    // Size filter in-memory
    if (sizeMin || sizeMax) {
      docs = docs.filter(d => {
        const sz = Number(d.lease_area_as_advertised_in_sq_ft) || 0;
        if (sizeMin && sz < Number(sizeMin)) return false;
        if (sizeMax && sz > Number(sizeMax)) return false;
        return true;
      });
    }

    // Full-text search across all matching docs (not just current page)
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      docs = docs.filter(d =>
        [d.ors_property_id, d.city_location, d.district, d.state,
         d.locality_circle, d.facility_type, d.sub_district]
          .some(v => v?.toLowerCase().includes(s))
      );
    }

    const total = docs.length;

    // Shuffle with daily seed (random order, consistent within a day)
    const shuffled = seededShuffle(docs, seed);

    // Paginate
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const pageData = shuffled.slice(start, start + PAGE_SIZE);

    // Get overall collection count for the counter
    let collectionTotal = total;
    try {
      const countSnap = await getDb().collection(COLLECTION).count().get();
      collectionTotal = countSnap.data().count;
    } catch {}

    return NextResponse.json({
      listings: pageData,
      total,
      collectionTotal,
      page,
      totalPages,
      pageSize: PAGE_SIZE,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.bulk && Array.isArray(body.listings)) {
      const db = getDb();
      const results = { imported: 0, skipped: 0 };
      const CHUNK = 499;

      for (let i = 0; i < body.listings.length; i += CHUNK) {
        const batch = db.batch();
        const chunk = body.listings.slice(i, i + CHUNK);
        for (const listing of chunk) {
          if (!listing.ors_property_id) { results.skipped++; continue; }
          const docId = listing.ors_property_id.replace(/\s+/g, '_').toLowerCase();
          const ref = db.collection(COLLECTION).doc(docId);
          batch.set(ref, {
            ...listing, id: docId,
            createdAt: listing.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            listingMode: listing.listingMode || 'ors_transact',
          }, { merge: true });
          results.imported++;
        }
        await batch.commit();
      }
      return NextResponse.json({ success: true, ...results });
    }

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
