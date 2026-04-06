const fs = require('fs');
let content = fs.readFileSync('src/contexts/data-context.tsx', 'utf8');

content = content.replace(
  `    const unsubLeads = onSnapshot(doc(db, 'registered-leads', '0'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const leads = Array.isArray(d) ? d : Object.values(d || {});
        if (leads.length > 0) setRegisteredLeads(leads);
      }
    });`,
  `    const unsubLeads = onSnapshot(doc(db, 'registered-leads', '0'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        let leads = [];
        if (Array.isArray(d)) leads = d;
        else if (d && typeof d === 'object') leads = Object.values(d).filter(v => v && typeof v === 'object');
        if (leads.length > 0) setRegisteredLeads(leads as any);
      }
    });`
);

content = content.replace(
  `    const unsubAnalytics = onSnapshot(doc(db, 'listing-analytics', '0'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const analytics = Array.isArray(d?.data) ? d.data : Object.values(d || {});
        if (analytics.length > 0) setListingAnalytics(analytics);
      }
    });`,
  `    const unsubAnalytics = onSnapshot(doc(db, 'listing-analytics', '0'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        let analytics = [];
        if (Array.isArray(d?.data)) analytics = d.data;
        else if (d && typeof d === 'object') analytics = Object.values(d).filter(v => v && typeof v === 'object');
        if (analytics.length > 0) setListingAnalytics(analytics as any);
      }
    });`
);

fs.writeFileSync('src/contexts/data-context.tsx', content);
console.log('Done!');
