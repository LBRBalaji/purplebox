const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Wrap ProviderOverview with memo to stop jumping
c = c.replace(
  'function ProviderOverview() {',
  'const ProviderOverview = React.memo(function ProviderOverview() {'
);

// Close the memo wrap - find the end of the function
// The function ends before const MainDashboard
c = c.replace(
  '});\n\nconst MainDashboard = () => {',
  '});\n});\n\nconst MainDashboard = () => {'
);

fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log('Done');
