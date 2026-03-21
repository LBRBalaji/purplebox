const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/approval/page.tsx', 'utf8');
content = content.replace(
  "const hasAccess = user?.email === 'admin@example.com' || user?.role === 'O2O';",
  "const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';"
);
fs.writeFileSync('src/app/dashboard/approval/page.tsx', content);
console.log('Done');
