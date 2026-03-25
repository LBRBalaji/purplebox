const fs = require('fs');
const files = [
  'src/components/header.tsx',
  'src/app/layout.tsx',
  'src/app/globals.css'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/Lakshmi Balaji O2O/g, 'ORS-ONE');
  content = content.replace(/Sourcing & Leasing Simplified/g, 'Building Transaction Ready Assets');
  content = content.replace(/Sourcing &amp; Leasing Simplified/g, 'Building Transaction Ready Assets');
  fs.writeFileSync(filePath, content);
  console.log('Fixed: ' + filePath);
}

files.forEach(fixFile);
console.log('All done!');
