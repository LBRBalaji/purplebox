const fs = require('fs');

// Fix listings/page.tsx - old hardcoded message
let content = fs.readFileSync('src/components/listings/page.tsx', 'utf8');
content = content.replace(
  `             toast({
                variant: 'destructive',
                title: 'Daily Download Limit Reached',
                description: \`You have already downloaded twice today. Please try again tomorrow.\`
            });`,
  `             toast({
                variant: 'destructive',
                title: 'Download Limit Reached',
                description: \`You've reached your daily download limit. Your access refreshes tomorrow. Explore our Premium plans for higher limits.\`
            });`
);
fs.writeFileSync('src/components/listings/page.tsx', content);
console.log('Fixed listings/page.tsx');

// Fix listings-page-component.tsx
content = fs.readFileSync('src/components/listings-page-component.tsx', 'utf8');
content = content.replace(
  /title: ['"]Daily Download Limit Reached['"],\s*description: [^}]+}/g,
  `title: 'Download Limit Reached', description: "You've reached your daily download limit of 5 listings. Your access refreshes tomorrow. Upgrade to Premium for higher limits."}`
);
fs.writeFileSync('src/components/listings-page-component.tsx', content);
console.log('Fixed listings-page-component.tsx');

// Fix listing detail page
content = fs.readFileSync('src/app/listings/[listingId]/page.tsx', 'utf8');
content = content.replace(
  /title: ["']Download Limit Reached["'],\s*description: [^}]+}/g,
  `title: "Download Limit Reached", description: "You've reached your daily download limit. Your access refreshes tomorrow. Upgrade to Premium for higher limits."}`
);
fs.writeFileSync('src/app/listings/[listingId]/page.tsx', content);
console.log('Fixed listing detail page');

console.log('All done!');
