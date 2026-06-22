import { getDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

const COLLECTION = 'transaction-dockets';
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const doc = await getDb().collection(COLLECTION).doc(id).get();
      if (!doc.exists) return NextResponse.json({ message: 'Not found' }, { status: 404, headers });
      return NextResponse.json(doc.data(), { headers });
    }
    const snapshot = await getDb().collection(COLLECTION).get();
    return NextResponse.json(snapshot.docs.map(d => d.data()), { headers });
  } catch (error) {
    console.error('Failed to read ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500, headers });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { docketId, updates, newDocket } = body;

    if (newDocket) {
      const newId = 'TD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const final = { ...newDocket, docketId: newId };
      await getDb().collection(COLLECTION).doc(newId).set(final);
      return NextResponse.json({ message: 'Docket created', docketId: newId }, { headers });
    }

    if (!docketId) return NextResponse.json({ message: 'docketId required' }, { status: 400, headers });
    const docRef = getDb().collection(COLLECTION).doc(docketId);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ message: 'Docket not found' }, { status: 404, headers });
    await docRef.update(updates);
    return NextResponse.json({ message: 'Docket updated' }, { headers });
  } catch (error: any) {
    console.error('PATCH failed:', error);
    return NextResponse.json({ message: 'Failed: ' + error.message }, { status: 500, headers });
  }
}
