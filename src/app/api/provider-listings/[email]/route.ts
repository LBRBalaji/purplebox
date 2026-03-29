import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const developerEmail = decodeURIComponent(params.email);
    if (!developerEmail) {
      return NextResponse.json({ message: 'Developer email is required.' }, { status: 400, headers });
    }
    const snapshot = await getDb().collection('listings').where('developerId', '==', developerEmail).get();
    const providerListings = snapshot.docs.map(d => d.data());
    return NextResponse.json(providerListings, { headers });
  } catch (error) {
    console.error('Failed to fetch provider listings:', error);
    return NextResponse.json({ message: 'Failed to fetch provider listings.' }, { status: 500, headers });
  }
}