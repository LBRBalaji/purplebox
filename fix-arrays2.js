require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, setDoc } = require('firebase/firestore');

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

function fixArrays(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && obj._array !== undefined) {
    try { return JSON.parse(obj._array); } catch(e) { return []; }
  }
  if (Array.isArray(obj)) return obj.map(fixArrays);
  if (typeof obj === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = fixArrays(v);
    }
    return result;
  }
  return obj;
}

const collections = [
  'demands', 'notifications', 'submissions', 'agent-leads', 'registered-leads',
  'transaction-activities', 'negotiation-boards', 'download-history',
  'view-history', 'share-history', 'listing-analytics'
];

async function fixAll() {
  for (const col of collections) {
    console.log('Fixing: ' + col);
    const snapshot = await getDocs(collection(db, col));
    let fixed = 0;
    for (const d of snapshot.docs) {
      const data = d.data();
      if (typeof data === 'object' && !Array.isArray(data)) {
        const fixedData = fixArrays(data);
        await updateDoc(doc(db, col, d.id), fixedData);
        fixed++;
      }
    }
    console.log('Fixed ' + fixed + ' docs in ' + col);
  }
  console.log('All done!');
  process.exit(0);
}

fixAll().catch(e => { console.error(e); process.exit(1); });
