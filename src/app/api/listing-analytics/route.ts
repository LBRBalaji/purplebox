import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

const COLLECTION = 'listing-analytics';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET() {
  try {
    const docSnap = await getDb().collection(COLLECTION).doc('0').get();
    if (docSnap.exists) {
      const d = docSnap.data();
      return NextResponse.json(Array.isArray(d?.data) ? d.data : d || {}, { headers });
    }
    return NextResponse.json(Array.isArray([]) ? [] : {}, { headers });
  } catch (error) {
    console.error('Failed to read ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500, headers });
  }
}

export async function POST(request) {
  try {
    const newData = await request.json();
    const payload = Array.isArray(newData) ? { data: newData } : newData;
    await getDb().collection(COLLECTION).doc('0').set(payload);
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}