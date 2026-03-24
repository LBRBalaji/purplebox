const fs = require('fs');
let content = fs.readFileSync('src/components/header.tsx', 'utf8');
content = content.replace(
  'href="https://wa.me/919841098170?text=need%20O2O%20support%20call%20me%20back%20please" target="_blank" rel="noopener noreferrer">',
  'href="https://wa.me/919841098170?text=need%20O2O%20support%20call%20me%20back%20please" target="_blank" rel="noopener noreferrer" className="hidden sm:block">'
);
fs.writeFileSync('src/components/header.tsx', content);
console.log('Done');
