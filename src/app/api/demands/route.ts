import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

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
    const snapshot = await getDocs(collection(db, ''));
    if (isArray) {
      const data = snapshot.docs
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map(d => d.data());
      return NextResponse.json(data, { headers });
    } else {
      const data: Record<string, any> = {};
      snapshot.forEach(d => { data[d.id] = d.data(); });
      return NextResponse.json(data, { headers });
    }
  } catch (error) {
    console.error('Failed to read :', error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    const colRef = collection(db, '');
    const snapshot = await getDocs(colRef);
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
    if (Array.isArray(newData)) {
      await Promise.all(newData.map((item, i) => setDoc(doc(db, '', String(i)), item)));
    } else {
      await Promise.all(Object.entries(newData).map(([key, value]) =>
        setDoc(doc(db, '', key), typeof value === 'object' ? value as any : { value })
      ));
    }
    return NextResponse.json({ message: ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write :', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}