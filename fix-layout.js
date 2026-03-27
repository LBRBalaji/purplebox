const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
const old = '        // Redirect non-admins away from settings (only super admin has access)\n        if (pathname.startsWith(\'/dashboard/settings\') && !isSuperAdmin) {\n            router.push(\'/dashboard\');\n        }';
const fix = '        // Settings accessible to all logged-in users (for Change Password)';
c = c.replace(old, fix);
fs.writeFileSync('src/app/dashboard/layout.tsx', c);
console.log('Done');
