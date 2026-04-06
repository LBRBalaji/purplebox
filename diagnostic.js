const http = require('http');

http.get('http://localhost:9002/api/listings', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const listings = JSON.parse(data);
      console.log('=== FULL DIAGNOSTIC ===');
      console.log('Total listings in Firestore:', listings.length);

      const byStatus = {};
      listings.forEach(l => {
        byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      });
      console.log('\nBy status:');
      Object.entries(byStatus).forEach(([s,c]) => console.log(' -', s, ':', c));

      const byDev = {};
      listings.forEach(l => {
        if(!byDev[l.developerId]) byDev[l.developerId] = {};
        byDev[l.developerId][l.status] = (byDev[l.developerId][l.status] || 0) + 1;
      });
      console.log('\nBy developer + status:');
      Object.entries(byDev).forEach(([dev, statuses]) => {
        console.log(' ', dev);
        Object.entries(statuses).forEach(([s,c]) => console.log('    -', s, ':', c));
      });

    } catch(e) { console.log('Error:', e.message); }
  });
}).on('error', e => console.log('Error:', e.message));
