const fs = require('fs');
let content = fs.readFileSync('src/contexts/auth-context.tsx', 'utf8');

// Fix User type to add status field
content = content.replace(
  "createdAt: string;\n};",
  "createdAt: string;\n  status?: 'pending' | 'approved' | 'rejected';\n};"
);

// Fix signup to add pending status
content = content.replace(
  "const newUser: User = { ...details, email, isCompanyAdmin: false, createdAt: new Date().toISOString() };",
  "const newUser: User = { ...details, email, isCompanyAdmin: false, status: 'pending', createdAt: new Date().toISOString() };"
);

// Fix addUser to add pending status
content = content.replace(
  "const newUser: User = { ...details, email, createdAt: new Date().toISOString() };",
  "const newUser: User = { ...details, email, status: 'pending', createdAt: new Date().toISOString() };"
);

fs.writeFileSync('src/contexts/auth-context.tsx', content);
console.log('Done');
