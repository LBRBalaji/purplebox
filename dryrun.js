const http = require('http');
const jsonListings = require('./src/data/listings.json');
const arr = Array.isArray(jsonListings) ? jsonListings : Object.values(jsonListings);

http.get('http://localhost:9002/api/listings', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const firestoreListings = JSON.parse(data);
      const firestoreIds = new Set(firestoreListings.map(l => l.listingId));
      const missing = arr.filter(l => !firestoreIds.has(l.listingId));
      console.log('=== DRY RUN - NO CHANGES MADE ===');
      console.log('Total in JSON:', arr.length);
      console.log('Total in Firestore:', firestoreListings.length);
      console.log('Missing from Firestore:', missing.length);
      console.log('\nMissing listings:');
      missing.forEach(l => {
        console.log(' -', l.listingId, '|', l.developerId, '|', l.location, '|', l.status);
      });
    } catch(e) { console.log('Parse error:', e.message); }
  });
}).on('error', e => console.log('Error:', e.message));
