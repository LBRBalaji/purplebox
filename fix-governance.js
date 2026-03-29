const fs = require('fs');
let c = fs.readFileSync('src/components/data-governance.tsx', 'utf8');

// Fix 1: Reset isDone on mount and op change
c = c.replace(
  "const [activeOp, setActiveOp] = React.useState<Op | null>(null);",
  "const [activeOp, setActiveOp] = React.useState<Op | null>(null);\n  React.useEffect(() => { reset(); }, [activeOp]);"
);

// Fix 2: Replace updateListing with direct API call
c = c.replace(
  "const { listings, registeredLeads, updateListing } = useData();",
  "const { listings, registeredLeads } = useData();"
);

// Fix 3: Replace updateListing calls with fetch to API
c = c.replace(
  `      if (activeOp === 'transfer-listings' || activeOp === 'merge-accounts') {
        for (const item of preview) {
          const listing = listings.find(l => l.listingId === item.id);
          if (listing) await updateListing({ ...listing, developerId: toUser });
        }`,
  `      if (activeOp === 'transfer-listings' || activeOp === 'merge-accounts') {
        for (const item of preview) {
          const listing = listings.find(l => l.listingId === item.id);
          if (listing) {
            await fetch('/api/listings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...listing, developerId: toUser }),
            });
          }
        }`
);

c = c.replace(
  `        for (const item of preview) {
          const listing = listings.find(l => l.listingId === item.id);
          if (listing && toUser) await updateListing({ ...listing, developerId: toUser });
        }`,
  `        for (const item of preview) {
          const listing = listings.find(l => l.listingId === item.id);
          if (listing && toUser) {
            await fetch('/api/listings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...listing, developerId: toUser }),
            });
          }
        }`
);

c = c.replace(
  `        const listingItems = preview.filter(p => p.type === 'listing');
        for (const item of listingItems) {
          const listing = listings.find(l => l.listingId === item.id);
          if (listing) await updateListing({ ...listing, developerName: newCompanyName });
        }`,
  `        const listingItems = preview.filter(p => p.type === 'listing');
        for (const item of listingItems) {
          const listing = listings.find(l => l.listingId === item.id);
          if (listing) {
            await fetch('/api/listings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...listing, developerName: newCompanyName }),
            });
          }
        }`
);

fs.writeFileSync('src/components/data-governance.tsx', c);
console.log('Done');
