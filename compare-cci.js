const http = require('http');
http.get('http://localhost:9002/api/listings', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const listings = JSON.parse(data);
    const rejected = listings.filter(l => l.developerId === 'admin@ccidevelopers.com' && l.status === 'rejected');
    const approved = listings.filter(l => l.developerId === 'raj.attri@ccigroup.co.in' && l.status === 'approved');
    console.log('=== REJECTED (admin@ccidevelopers.com) ===');
    rejected.forEach(l => console.log(l.listingId, '|', l.location, '|', l.sizeSqFt, 'sqft', '|', l.name||'no name'));
    console.log('\n=== APPROVED (raj.attri@ccigroup.co.in) ===');
    approved.forEach(l => console.log(l.listingId, '|', l.location, '|', l.sizeSqFt, 'sqft', '|', l.name||'no name'));
    process.exit(0);
  });
}).on('error', e => console.log('Error:', e.message));
