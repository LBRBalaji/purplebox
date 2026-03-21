const fs = require('fs');
let content = fs.readFileSync('src/app/globals.css', 'utf8');
content = content.replace(
  'body {\n  font-family: Arial, Helvetica, sans-serif;\n}',
  'body {\n  font-family: Arial, Helvetica, sans-serif;\n  overflow-x: hidden;\n  max-width: 100vw;\n}'
);
fs.writeFileSync('src/app/globals.css', content);
console.log('Done');
