const fs = require('fs');
const content = `import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function POST(req: NextRequest) {
  try {
    const { email, sessionToken, deviceInfo } = await req.json();
    if (!email || !sessionToken) return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers });
    await getDb().collection('sessions').doc(email).set({
      sessionToken,
      deviceInfo: deviceInfo || '',
      updatedAt: Date.now(),
    });
    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400, headers });
    await getDb().collection('sessions').doc(email).delete();
    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }
}`;
fs.writeFileSync('src/app/api/sessions/route.ts', content);
console.log('Done!');
