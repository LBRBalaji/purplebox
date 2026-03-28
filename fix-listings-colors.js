const fs = require('fs');
let c = fs.readFileSync('src/components/listings-page-component.tsx', 'utf8');

// 1. Hero headline — navy instead of primary purple
c = c.replace(
  'className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary"',
  'className="text-4xl md:text-5xl font-black tracking-tight text-[#0D1F3C]" style={{fontFamily:"Calibri,Arial,sans-serif"}}'
);

// 2. Hero tagline — orange accent
c = c.replace(
  'className="mt-4 text-lg text-accent"',
  'className="mt-4 text-base text-[#F18F01] font-semibold"'
);

// 3. Stats numbers — navy
c = c.replace(
  /className="text-2xl md:text-3xl font-bold text-primary"\>{inventoryCount}/g,
  'className="text-2xl md:text-3xl font-black text-[#0D1F3C]">{inventoryCount}'
);
c = c.replace(
  /className="text-2xl md:text-3xl font-bold text-primary"\>{formatSize/g,
  'className="text-2xl md:text-3xl font-black text-[#0D1F3C]">{formatSize'
);

// 4. View Full Details button — navy background
c = c.replace(
  /asChild className="w-full" variant="outline"/g,
  'asChild className="w-full bg-[#0D1F3C] hover:bg-[#132840] text-white border-none rounded-xl font-semibold"'
);

// 5. Download bar — navy background with orange button
c = c.replace(
  'className="flex items-center justify-between gap-6 p-4 rounded-lg shadow-2xl bg-card border w-full max-w-2xl animate-in slide-in-from-bottom-5"',
  'className="flex items-center justify-between gap-6 p-4 rounded-2xl shadow-2xl bg-[#0D1F3C] border border-[#1E3A5F] w-full max-w-2xl animate-in slide-in-from-bottom-5"'
);

// 6. Download bar text — white
c = c.replace(
  'className="font-semibold text-sm">\n                        {selectedForDownload.length} listing',
  'className="font-semibold text-sm text-white">\n                        {selectedForDownload.length} listing'
);

// 7. Download button — orange
c = c.replace(
  '<Button onClick={handleDownload}>\n                            <Download className="mr-2 h-4 w-4" /> Download Selected',
  '<Button onClick={handleDownload} className="bg-[#F18F01] hover:bg-[#E07309] text-white border-none font-bold rounded-xl">\n                            <Download className="mr-2 h-4 w-4" /> Download Selected'
);

// 8. Clear button — white ghost on dark
c = c.replace(
  '<Button variant="ghost" size="sm" onClick={clearSelectedForDownload}>\n                            <X className="mr-2 h-4 w-4" /> Clear',
  '<Button variant="ghost" size="sm" onClick={clearSelectedForDownload} className="text-white/70 hover:text-white hover:bg-white/10">\n                            <X className="mr-2 h-4 w-4" /> Clear'
);

// 9. Filter section heading — navy
c = c.replace(
  'className="text-2xl font-bold font-headline tracking-tight"',
  'className="text-xl font-black text-[#0D1F3C] tracking-tight"'
);

// 10. Info alert — navy theme
c = c.replace(
  'className="mb-8 bg-primary/5 border-primary/20 p-6 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center"',
  'className="mb-8 bg-[#0D1F3C]/5 border-[#0D1F3C]/15 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center"'
);

// 11. Alert title — navy
c = c.replace(
  'className="font-bold text-primary/90 text-xl flex items-center gap-3"',
  'className="font-black text-[#0D1F3C] text-lg flex items-center gap-3"'
);

// 12. Log Your Demand button — orange
c = c.replace(
  '<Button onClick={handleLogDemandClick}>',
  '<Button onClick={handleLogDemandClick} className="bg-[#F18F01] hover:bg-[#E07309] text-white border-none font-bold rounded-xl mt-2">'
);

fs.writeFileSync('src/components/listings-page-component.tsx', c);
console.log('Done!');
