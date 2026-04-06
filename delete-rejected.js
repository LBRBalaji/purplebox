const http = require('http');

http.get('http://localhost:9002/api/listings', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const listings = JSON.parse(data);
    const toDelete = new Set(
      listings
        .filter(l =>
          l.status === 'rejected' &&
          ['admin@ccidevelopers.com','wd1@o2o.com','wd2@o2o.com','wd3@o2o.com'].includes(l.developerId)
        )
        .map(l => l.listingId)
    );
    const clean = listings.filter(l => !toDelete.has(l.listingId));
    console.log('Original count:', listings.length);
    console.log('Deleting:', toDelete.size);
    console.log('Remaining:', clean.length);

    const body = JSON.stringify(clean);
    const options = {
      hostname: 'localhost',
      port: 9002,
      path: '/api/listings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = http.request(options, (res2) => {
      let d = '';
      res2.on('data', c => d += c);
      res2.on('end', () => {
        console.log('Result:', d);
        process.exit(0);
      });
    });
    req.on('error', e => console.log('Error:', e.message));
    req.write(body);
    req.end();
  });
}).on('error', e => console.log('Error:', e.message));
