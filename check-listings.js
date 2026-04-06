require('dotenv').config({ path: '.env' });
const admin = require('./node_modules/firebase-admin');
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});
const db = admin.firestore();
db.collection('listings').get().then(snap => {
  const all = snap.docs.map(d => d.data());
  console.log('Total listings in Firestore:', all.length);
  const approved = all.filter(l => l.status === 'approved');
  console.log('Approved listings:', approved.length);
  const sample = all.slice(0, 2);
  sample.forEach(l => {
    console.log('---');
    console.log('listingId:', l.listingId);
    console.log('developerId:', l.developerId);
    console.log('developerEmail:', l.developerEmail);
    console.log('status:', l.status);
  });
  process.exit(0);
}).catch(e => { console.log('Error:', e.message); process.exit(1); });
