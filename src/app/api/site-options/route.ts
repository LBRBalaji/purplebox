import { getDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

const COLLECTION = 'site-options';
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { siteOptionId, updates, newSiteOption } = body;

    // Create a new site option
    if (newSiteOption) {
      const newId = 'SITE-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const finalSiteOption = { ...newSiteOption, siteOptionId: newId };
      await getDb().collection(COLLECTION).doc(newId).set(finalSiteOption);
      return NextResponse.json({ message: 'Site option created', siteOptionId: newId }, { headers });
    }

    // Update an existing site option
    if (!siteOptionId) {
      return NextResponse.json({ message: 'siteOptionId required' }, { status: 400, headers });
    }
    const docRef = getDb().collection(COLLECTION).doc(siteOptionId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ message: 'Site option not found: ' + siteOptionId }, { status: 404, headers });
    }
    await docRef.update(updates);
    return NextResponse.json({ message: 'Site option updated' }, { headers });
  } catch (error: any) {
    console.error('PATCH failed:', error);
    return NextResponse.json({ message: 'Failed: ' + error.message }, { status: 500, headers });
  }
}
