const fs = require('fs');
let content = fs.readFileSync('src/contexts/data-context.tsx', 'utf8');

const firebaseImport = "import { db } from '@/lib/firebase';\nimport { doc, onSnapshot } from 'firebase/firestore';\n";
content = content.replace("'use client';", "'use client';\n" + firebaseImport);

const snapshotCode = `
  useEffect(() => {
    const unsubNotif = onSnapshot(doc(db, 'notifications', '0'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const notifs = Array.isArray(d?.data) ? d.data : [];
        setNotifications(notifs);
      }
    });
    const unsubLeads = onSnapshot(doc(db, 'registered-leads', '0'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const leads = Array.isArray(d) ? d : Object.values(d || {});
        if (leads.length > 0) setRegisteredLeads(leads);
      }
    });
    const unsubAnalytics = onSnapshot(doc(db, 'listing-analytics', '0'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const analytics = Array.isArray(d?.data) ? d.data : Object.values(d || {});
        if (analytics.length > 0) setListingAnalytics(analytics);
      }
    });
    return () => { unsubNotif(); unsubLeads(); unsubAnalytics(); };
  }, []);
`;

const marker = "const fetchData = useCallback(() => {";
content = content.replace(marker, snapshotCode + "\n  " + marker);

fs.writeFileSync('src/contexts/data-context.tsx', content);
console.log('Done! Lines:', content.split('\n').length);
