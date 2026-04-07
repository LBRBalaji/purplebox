import * as admin from 'firebase-admin';

function getApp() {
  if (admin.apps.length) return admin.apps[0];
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getDb() { return admin.firestore(getApp()); }
export function getAdminAuth() { return admin.auth(getApp()); }

export function getStorage() { return admin.storage(getApp()); }
