const http = require('http');
http.get('http://localhost:9002/api/listings', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const listings = JSON.parse(data);
    const toDelete = listings.filter(l =>
      l.status === 'rejected' &&
      ['admin@ccidevelopers.com','wd1@o2o.com','wd2@o2o.com','wd3@o2o.com'].includes(l.developerId)
    );
    console.log('=== DRY RUN - NO CHANGES MADE ===');
    console.log('Listings to be deleted:', toDelete.length);
    toDelete.forEach(l => {
      console.log(' -', l.listingId, '|', l.developerId, '|', l.location, '|', l.name || 'no name');
    });
    console.log('\nRemaining after delete:', listings.length - toDelete.length);
    process.exit(0);
  });
}).on('error', e => console.log('Error:', e.message));
