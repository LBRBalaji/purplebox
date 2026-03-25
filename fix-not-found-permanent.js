const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.build = 'mkdir -p src/app/_not-found && echo "export default function NotFound() { return null; }" > src/app/_not-found/page.tsx && next build';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('Done');
