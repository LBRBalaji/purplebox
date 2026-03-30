import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { getDb } from '@/lib/firebase-admin';

const COLLECTION = 'listings';
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET() {
  try {
    const snapshot = await getDb().collection(COLLECTION).get();
    const data = snapshot.docs.map(d => d.data());
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Failed to read ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500, headers });
  }
}

export async function POST(request) {
  try {
    const newData = await request.json();
    const colRef = getDb().collection(COLLECTION);
    const snapshot = await colRef.get();
    await Promise.all(snapshot.docs.map(d => d.ref.delete()));
    if (Array.isArray(newData)) {
      await Promise.all(newData.map((item, i) => colRef.doc(String(i)).set(item)));
    } else {
      await Promise.all(Object.entries(newData).map(([key, value]) =>
        colRef.doc(key).set(typeof value === 'object' ? value : { value })
      ));
    }
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { listingId, updates, newListing } = body;

    // Create new listing
    if (newListing) {
      const newId = 'LST-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const finalListing = { ...newListing, listingId: newId };
      await getDb().collection(COLLECTION).doc(newId).set(finalListing);
      return NextResponse.json({ message: 'Listing created', listingId: newId }, { headers });
    }

    // Update existing listing
    if (!listingId) {
      return NextResponse.json({ message: 'listingId required' }, { status: 400, headers });
    }
    const snapshot = await getDb().collection(COLLECTION).get();
    const existing = snapshot.docs.find(d => d.data().listingId === listingId);
    if (!existing) {
      return NextResponse.json({ message: 'Listing not found: ' + listingId }, { status: 404, headers });
    }
    await existing.ref.update(updates);
    return NextResponse.json({ message: 'Listing updated' }, { headers });
  } catch (error) {
    console.error('PATCH failed:', error);
    return NextResponse.json({ message: 'Failed: ' + error.message }, { status: 500, headers });
  }
}