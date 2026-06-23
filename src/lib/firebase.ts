import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy singleton — initialise once, re-use on every subsequent import.
// The typeof window guard prevents any execution in SSR / edge runtime contexts
// where Firebase client SDK is not available. All callers are 'use client'
// components, so this is always accessed from the browser.
let _app: FirebaseApp | undefined;
let _db:  Firestore   | undefined;
let _auth: Auth        | undefined;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return _app;
}

if (typeof window !== 'undefined') {
  try {
    const app = getFirebaseApp();
    _db   = getFirestore(app);
    _auth = getAuth(app);
  } catch (e) {
    console.error('[Firebase] Client SDK initialisation failed:', e);
  }
}

// Non-null assertions are safe here: every caller is a 'use client' component
// that only runs in the browser, where the try block above always succeeds
// (assuming the NEXT_PUBLIC_FIREBASE_* env vars are present in the build).
export const db   = _db   as Firestore;
export const auth = _auth as Auth;

export const analytics = typeof window !== 'undefined'
  ? isSupported().then(yes => yes ? getAnalytics(getFirebaseApp()) : null)
  : null;
