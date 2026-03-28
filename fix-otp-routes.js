const fs = require('fs');

const adminLib = `import * as admin from 'firebase-admin';

function getApp() {
  if (admin.apps.length) return admin.apps[0];
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
    }),
  });
}

export function getDb() { return admin.firestore(getApp()); }
export function getAdminAuth() { return admin.auth(getApp()); }
`;

const sendOtp = `import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const { getDb } = await import('@/lib/firebase-admin');
    const db = getDb();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await db.collection('otp-verifications').doc(email).set({ otp, expiresAt, createdAt: Date.now() });
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [email],
        subject: 'Your ORS-ONE Download Verification Code',
        html: '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f4f6f9;border-radius:12px;"><div style="background:#0D1F3C;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;"><h1 style="color:#ffffff;margin:0;font-size:24px;">ORS-ONE</h1><p style="color:#AABBD0;margin:8px 0 0;font-size:13px;">Building Transaction Ready Assets</p></div><div style="background:#ffffff;padding:24px;border-radius:8px;text-align:center;"><p style="color:#1A2B3C;font-size:16px;margin-bottom:8px;">Your download verification code is:</p><div style="background:#F4F6F9;border:2px dashed #F18F01;border-radius:8px;padding:20px;margin:16px 0;"><span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#0D1F3C;">' + otp + '</span></div><p style="color:#6B7E92;font-size:13px;">This code expires in <strong>5 minutes</strong>.</p><p style="color:#6B7E92;font-size:13px;">If you did not request this, please ignore this email.</p></div><p style="color:#6B7E92;font-size:11px;text-align:center;margin-top:16px;">ORS-ONE - lease.orsone.app</p></div>',
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to send email'); }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
`;

const verifyOtp = `import { NextRequest, NextResponse } from 'next/server';
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
`;

fs.writeFileSync('src/lib/firebase-admin.ts', adminLib);
console.log('firebase-admin.ts created');
fs.mkdirSync('src/app/api/send-otp', { recursive: true });
fs.mkdirSync('src/app/api/verify-otp', { recursive: true });
fs.writeFileSync('src/app/api/send-otp/route.ts', sendOtp);
console.log('send-otp route created');
fs.writeFileSync('src/app/api/verify-otp/route.ts', verifyOtp);
console.log('verify-otp route created');
console.log('All done!');
