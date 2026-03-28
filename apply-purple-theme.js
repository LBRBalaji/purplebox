const fs = require('fs');

function purplify(content) {
  return content
    // Navy backgrounds → primary purple
    .replace(/bg-\[#0D1F3C\]/g, 'bg-primary')
    .replace(/bg-\[#132840\]/g, 'bg-primary/90')
    .replace(/bg-\[#1E3A5F\]/g, 'bg-primary/80')
    // Orange → primary purple
    .replace(/text-\[#F18F01\]/g, 'text-primary')
    .replace(/bg-\[#F18F01\]/g, 'bg-primary')
    .replace(/hover:bg-\[#E07309\]/g, 'hover:bg-primary/90')
    .replace(/bg-\[#F18F01\]\/10/g, 'bg-primary/10')
    .replace(/bg-\[#F18F01\]\/20/g, 'bg-primary/20')
    .replace(/border-\[#F18F01\]/g, 'border-primary')
    .replace(/border-\[#F18F01\]\/30/g, 'border-primary/30')
    .replace(/border-\[#F18F01\]\/50/g, 'border-primary/50')
    .replace(/text-\[#F18F01\]\/10/g, 'text-primary/10')
    // Slate colors → app theme colors
    .replace(/bg-\[#F8F9FB\]/g, 'bg-background')
    .replace(/bg-\[#F8F9FB\]/g, 'bg-secondary/30')
    // Navy text → foreground/primary
    .replace(/text-\[#0D1F3C\]/g, 'text-primary')
    // Inline styles with navy
    .replace(/#0D1F3C/g, '#6141ac')
    .replace(/#F18F01/g, '#6141ac')
    .replace(/#E07309/g, '#5535a0')
    .replace(/#132840/g, '#5535a0')
    .replace(/#F8F9FB/g, 'hsl(259 30% 96%)')
    // Slate text colors
    .replace(/text-slate-700/g, 'text-foreground')
    .replace(/text-slate-600/g, 'text-foreground/80')
    .replace(/text-slate-500/g, 'text-muted-foreground')
    .replace(/text-slate-400/g, 'text-muted-foreground/70')
    .replace(/text-slate-300/g, 'text-muted-foreground/50')
    .replace(/bg-slate-100/g, 'bg-secondary')
    .replace(/bg-slate-50/g, 'bg-secondary/50')
    .replace(/border-slate-100/g, 'border-border')
    .replace(/border-slate-200/g, 'border-border')
    .replace(/hover:border-\[#F18F01\]\/30/g, 'hover:border-primary/30')
    // white text on dark → primary-foreground
    .replace(/text-white\/70/g, 'text-primary-foreground/70')
    .replace(/text-white\/60/g, 'text-primary-foreground/60')
    .replace(/text-white\/50/g, 'text-primary-foreground/50')
    .replace(/text-white\/40/g, 'text-primary-foreground/40')
    .replace(/text-white\/30/g, 'text-primary-foreground/30')
    .replace(/text-white/g, 'text-primary-foreground')
    .replace(/bg-white\/10/g, 'bg-primary-foreground/10')
    .replace(/bg-white\/15/g, 'bg-primary-foreground/15')
    .replace(/bg-white\/20/g, 'bg-primary-foreground/20')
    .replace(/bg-white\/90/g, 'bg-primary-foreground/90')
    .replace(/bg-white/g, 'bg-card')
    .replace(/border-white\/10/g, 'border-primary-foreground/10')
    .replace(/border-white\/20/g, 'border-primary-foreground/20')
    .replace(/border-white\/30/g, 'border-primary-foreground/30')
    .replace(/placeholder-white\/40/g, 'placeholder-primary-foreground/40')
    // Specific color overrides
    .replace(/#065A82/g, '#6141ac')
    .replace(/#7C3AED/g, '#6141ac')
    .replace(/#2D6A4F/g, '#6141ac')
    .replace(/\[#EBF5FF\]/g, '[hsl(259,44%,94%)]')
    .replace(/\[#F3EEFF\]/g, '[hsl(259,44%,94%)]')
    .replace(/\[#EDFFF4\]/g, '[hsl(259,44%,94%)]')
    .replace(/color: '#065A82'/g, "color: '#6141ac'")
    .replace(/color: '#7C3AED'/g, "color: '#6141ac'")
    .replace(/color: '#2D6A4F'/g, "color: '#6141ac'")
    .replace(/color: '#F18F01'/g, "color: '#6141ac'")
    .replace(/'#065A82' \+ '15'/g, "'#6141ac' + '15'")
    .replace(/'#2D6A4F' \+ '15'/g, "'#6141ac' + '15'")
    .replace(/'#7C3AED' \+ '15'/g, "'#6141ac' + '15'")
    .replace(/'#F18F01' \+ '15'/g, "'#6141ac' + '15'");
}

// Apply to all three pages
const pages = [
  'src/app/about-us/page.tsx',
  'src/app/community/page.tsx',
  'src/app/resources/page.tsx',
];

pages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  const updated = purplify(content);
  fs.writeFileSync(page, updated);
  console.log('Updated: ' + page);
});

// Also fix header mobile menu navy colors
const header = fs.readFileSync('src/components/header.tsx', 'utf8');
const updatedHeader = header
  .replace(/bg-\[#0D1F3C\]/g, 'bg-primary')
  .replace(/hover:bg-\[#132840\]/g, 'hover:bg-primary/90')
  .replace(/text-\[#F18F01\]/g, 'text-accent')
  .replace(/border-\[#F18F01\]\/30/g, 'border-accent/30')
  .replace(/bg-\[#F18F01\]\/10/g, 'bg-accent/10')
  .replace(/#0D1F3C/g, '#6141ac')
  .replace(/#F18F01/g, '#6141ac');
fs.writeFileSync('src/components/header.tsx', updatedHeader);
console.log('Updated: header.tsx');

console.log('All done!');
