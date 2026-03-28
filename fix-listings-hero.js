const fs = require('fs');
let c = fs.readFileSync('src/components/listings-page-component.tsx', 'utf8');

// Wrap the hero section with navy background
c = c.replace(
  '<div className="text-center py-8 md:py-12">',
  '<div className="text-center py-16 md:py-20 px-4 -mx-4 md:-mx-8 mb-8 bg-[#0D1F3C] relative overflow-hidden" style={{backgroundImage:"radial-gradient(circle at 10% 50%, rgba(241,143,1,0.1), transparent 50%), radial-gradient(circle at 90% 20%, rgba(124,58,237,0.1), transparent 50%)"}}>'
);

// Fix icon colors for dark background
c = c.replace(
  'className="flex items-center justify-center gap-4 text-primary mb-4"',
  'className="flex items-center justify-center gap-4 text-[#F18F01] mb-4"'
);

// Fix divider lines for dark background
c = c.replace(
  /className="w-8 h-px bg-border"\/>/g,
  'className="w-8 h-px bg-white/20" />'
);

// Fix stats label colors for dark background
c = c.replace(
  /className="text-xs text-muted-foreground tracking-wider">WAREHOUSES/g,
  'className="text-xs text-white/50 tracking-wider">WAREHOUSES'
);
c = c.replace(
  /className="text-xs text-muted-foreground tracking-wider">SQ\. FT\. LISTED/g,
  'className="text-xs text-white/50 tracking-wider">SQ. FT. LISTED'
);

// Fix separator color
c = c.replace(
  'orientation="vertical" className="h-10"',
  'orientation="vertical" className="h-10 bg-white/20"'
);

// Add ORS-ONE eyebrow label like other pages
c = c.replace(
  '<div className="flex items-center justify-center gap-4 text-[#F18F01] mb-4">',
  '<div className="inline-flex items-center gap-2 bg-[#F18F01]/10 border border-[#F18F01]/30 rounded-full px-4 py-1.5 mb-6"><div className="h-2 w-2 rounded-full bg-[#F18F01]" /><span className="text-[#F18F01] text-xs font-bold tracking-widest uppercase">ORS-ONE Marketplace</span></div>\n                <div className="flex items-center justify-center gap-4 text-[#F18F01] mb-4">'
);

fs.writeFileSync('src/components/listings-page-component.tsx', c);
console.log('Done!');
