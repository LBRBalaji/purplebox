import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

const COLLECTION = 'prospect-connections';
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET() {
  try {
    const snapshot = await getDb().collection(COLLECTION).get();
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json(data, { headers });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch' }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { developerId, listingId, prospectCompany, activityType, status, requestedAt, confirmedAt } = body;
    const id = `${developerId}_${listingId}_${prospectCompany}`.replace(/[^a-zA-Z0-9_]/g, '_');
    await getDb().collection(COLLECTION).doc(id).set({
      developerId, listingId, prospectCompany, activityType,
      status: status || 'requested',
      requestedAt: requestedAt || Date.now(),
      confirmedAt: confirmedAt || null,
    }, { merge: true });
    return NextResponse.json({ message: 'Saved', id }, { headers });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to save' }, { status: 500, headers });
  }
}
