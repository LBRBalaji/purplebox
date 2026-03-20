const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dataDir = path.join(__dirname, 'src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

function sanitize(value) {
  if (Array.isArray(value)) return { _array: JSON.stringify(value) };
  if (typeof value === 'object' && value !== null) {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = sanitize(v);
    }
    return result;
  }
  return value;
}

async function migrate() {
  for (const file of files) {
    const collectionName = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    console.log(`Migrating ${collectionName}...`);
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        await setDoc(doc(collection(db, collectionName), String(i)), sanitize(data[i]));
      }
    } else if (typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        const sanitized = typeof value === 'object' ? sanitize(value) : { value };
        await setDoc(doc(collection(db, collectionName), key), sanitized);
      }
    }
    console.log(`✅ ${collectionName} done`);
  }
  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(console.error);
