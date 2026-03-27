require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);
async function fix() {
  const snap = await getDocs(collection(db, 'location-circles'));
  for (const d of snap.docs) {
    const data = d.data();
    if (data.locations && data.locations._array !== undefined) {
      const realArray = JSON.parse(data.locations._array);
      await updateDoc(doc(db, 'location-circles', d.id), { locations: realArray });
      console.log('Fixed: ' + data.name);
    }
  }
  console.log('Done!');
  process.exit(0);
}
fix().catch(e => { console.error(e); process.exit(1); });
