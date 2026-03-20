import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const COLLECTION = 'typing-status';

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
    const snapshot = await getDocs(collection(db, COLLECTION));
    const allNumeric = snapshot.docs.every(d => d.id.match(/^[0-9]+$/));
    if (allNumeric) {
      const data = snapshot.docs
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map(d => d.data());
      return NextResponse.json(data, { headers });
    } else {
      const data = {};
      snapshot.forEach(d => { data[d.id] = d.data(); });
      return NextResponse.json(data, { headers });
    }
  } catch (error) {
    console.error('Failed to read ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500, headers });
  }
}

export async function POST(request) {
  try {
    const newData = await request.json();
    const colRef = collection(db, COLLECTION);
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
    if (Array.isArray(newData)) {
      await Promise.all(newData.map((item, i) => setDoc(doc(db, COLLECTION, String(i)), item)));
    } else {
      await Promise.all(Object.entries(newData).map(([key, value]) =>
        setDoc(doc(db, COLLECTION, key), typeof value === 'object' ? value : { value })
      ));
    }
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}