const fs = require('fs');
const path = require('path');

const files = [
  'src/app/terms-and-conditions/page.tsx',
  'src/app/resources/page.tsx',
  'src/app/about-us/page.tsx',
  'src/app/signup/page.tsx',
  'src/app/listings/[listingId]/page.tsx',
  'src/app/agent-signup/page.tsx',
  'src/app/cookie-policy/page.tsx',
  'src/app/community/[postId]/page.tsx',
  'src/components/layout-request-dialog.tsx',
  'src/components/negotiation-board.tsx',
  'src/components/download-terms-dialog.tsx',
  'src/components/shortlisted-properties.tsx',
  'src/components/listings-page-component.tsx',
  'src/components/login-dialog.tsx',
  'src/components/commercial-calculator.tsx',
  'src/components/listings/page.tsx',
  'src/components/acknowledge-lead-dialog.tsx'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/Lakshmi Balaji O2O/g, 'ORS-ONE');
  content = content.replace(/Sourcing & Leasing Simplified/g, 'Building Transaction Ready Assets');
  content = content.replace(/Sourcing &amp; Leasing Simplified/g, 'Building Transaction Ready Assets');
  content = content.replace(/O2O Platform/g, 'ORS-ONE');
  fs.writeFileSync(filePath, content);
  console.log('Fixed: ' + filePath);
});
console.log('All done!');
