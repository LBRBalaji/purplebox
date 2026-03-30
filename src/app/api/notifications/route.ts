import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

const COLLECTION = 'notifications';

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
      const data = docSnap.data();
      return NextResponse.json(Array.isArray(data?.data) ? data.data : Object.values(data || {}), { headers });
    }
    return NextResponse.json([], { headers });
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
        colRef.doc(key).set(typeof value === 'object' ? value as object : { value })
      ));
    }
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}
