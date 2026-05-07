import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDb } from '@/lib/firebase-admin';
export const runtime = 'nodejs';

// Creates Firebase Auth user + Firestore profile WITHOUT signing in as that user.
// Uses Admin SDK server-side — never touches the current client session.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, ...profile } = body;
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });

    const adminAuth = getAuth();
    let uid: string;
    try {
      const record = await adminAuth.createUser({
        email: email.toLowerCase(),
        password,
        displayName: profile.userName || '',
      });
      uid = record.uid;
    } catch (e: any) {
      if (e.code === 'auth/email-already-exists') {
        const existing = await adminAuth.getUserByEmail(email.toLowerCase());
        uid = existing.uid;
      } else throw e;
    }

    await getDb().collection('users').doc(email.toLowerCase()).set({
      ...profile, email: email.toLowerCase(), uid,
      status: profile.status || 'approved',
      createdAt: profile.createdAt || new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true, uid });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
