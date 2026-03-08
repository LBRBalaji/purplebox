const fs = require('fs');
let c = fs.readFileSync('src/app/community/page.tsx', 'utf8');
c = c.replace('export default function', 'function CommunityPageInner');
c += '\n\nexport default function CommunityPage() {\n  return (\n    <React.Suspense fallback={<div>Loading</div>}>\n      <CommunityPageInner />\n    </React.Suspense>\n  );\n}';
fs.writeFileSync('src/app/community/page.tsx', c);
console.log('Done');
