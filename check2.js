require('dotenv').config({path:'.env'});
const admin=require('./node_modules/firebase-admin');
let pk=process.env.FIREBASE_PRIVATE_KEY||'';
if(pk.startsWith('"')) pk=pk.slice(1,-1);
pk=pk.replace(/\\n/g,'\n');
admin.initializeApp({credential:admin.credential.cert({
  projectId:process.env.FIREBASE_PROJECT_ID,
  clientEmail:process.env.FIREBASE_CLIENT_EMAIL,
  privateKey:pk
})});
admin.firestore().collection('users').get().then(s=>{
  const adminEmails=s.docs.map(d=>d.id).filter(e=>e.startsWith('admin@'));
  console.log('Admin@ accounts:');
  adminEmails.forEach(e=>{
    const data=s.docs.find(d=>d.id===e).data();
    console.log(e,'|',data.role,'|',data.companyName,'|',data.status);
  });
  process.exit(0);
}).catch(e=>{console.log('Error:',e.message);process.exit(1);});
