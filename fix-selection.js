const fs = require('fs');
let c = fs.readFileSync('src/contexts/data-context.tsx', 'utf8');

// Save selected listings to sessionStorage so they survive login redirect
c = c.replace(
  'const [selectedForDownload, setSelectedForDownload] = useState<ListingSchema[]>([]);',
  `const [selectedForDownload, setSelectedForDownload] = useState<ListingSchema[]>(() => {
    try {
      const saved = sessionStorage.getItem('pendingDownloadSelection');
      if (saved) { sessionStorage.removeItem('pendingDownloadSelection'); return JSON.parse(saved); }
    } catch(e) {}
    return [];
  });`
);

fs.writeFileSync('src/contexts/data-context.tsx', c);
console.log('data-context done');

// In listings page, save selection to sessionStorage before opening login dialog
let l = fs.readFileSync('src/components/listings-page-component.tsx', 'utf8');

// Fix SuperAdmin selection block
l = l.replace(
  "if (user.role !== 'User') {\n            toast({\n                variant: 'destructive',\n                title: 'Selection Not Available',\n                description: 'While you can browse, only Customer accounts can select properties for download.'\n            });\n            return;\n        }",
  "if (user.role !== 'User' && user.role !== 'SuperAdmin') {\n            toast({\n                variant: 'destructive',\n                title: 'Selection Not Available',\n                description: 'While you can browse, only Customer accounts can select properties for download.'\n            });\n            return;\n        }"
);

// Save selection before login redirect
l = l.replace(
  'if (!user) {\n            setIsLoginOpen(true);\n            return;\n        }',
  `if (!user) {
            try { sessionStorage.setItem('pendingDownloadSelection', JSON.stringify(selectedForDownload)); } catch(e) {}
            setIsLoginOpen(true);
            return;
        }`
);

// Also save when Select Me is clicked and user not logged in
l = l.replace(
  'if (!user) {\n                setIsLoginOpen(true);\n                return;\n            }',
  `if (!user) {
                try { sessionStorage.setItem('pendingDownloadSelection', JSON.stringify([listing])); } catch(e) {}
                setIsLoginOpen(true);
                return;
            }`
);

fs.writeFileSync('src/components/listings-page-component.tsx', l);
console.log('listings-page done');
console.log('All done!');
