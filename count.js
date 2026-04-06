const http = require('http');
http.get('http://localhost:9002/api/listings', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const listings = JSON.parse(data);
    const approved = listings.filter(l => l.status === 'approved');
    console.log('Total approved:', approved.length);
    const raj = listings.filter(l => l.developerId === 'raj.attri@ccigroup.co.in');
    console.log('raj.attri total:', raj.length);
    console.log('raj.attri approved:', raj.filter(l=>l.status==='approved').length);
    process.exit(0);
  });
}).on('error', e => console.log('Error:', e.message));
