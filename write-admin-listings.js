const fs = require('fs');
const src = fs.readFileSync('/home/claude/create-admin-listings.js', 'utf8');
eval(src.replace("const fs = require('fs');", '').replace("console.log('Done!');", ''));
fs.writeFileSync('src/components/admin-listings.tsx', newComponent);
console.log('Done!');
