import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const doc = await db.collection('otp-verifications').doc(email).get();
    if (!doc.exists) return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 400 });
    const data = doc.data();
    if (Date.now() > data.expiresAt) {
      await db.collection('otp-verifications').doc(email).delete();
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }
    if (data.otp !== otp) return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
    await db.collection('otp-verifications').doc(email).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
