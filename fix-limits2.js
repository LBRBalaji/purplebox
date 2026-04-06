const fs = require('fs');
let lines = fs.readFileSync('src/contexts/data-context.tsx', 'utf8').split('\n');

// Find the line numbers
const startLine = lines.findIndex(l => l.includes('const { daily, weekly } = getCompanyDownloadCounts'));
const endLine = lines.findIndex(l => l.includes('const newDownloadRecords: DownloadRecord[] = [];'));

console.log('Found at lines:', startLine, 'to', endLine);

const newCode = [
  `    const limitCheck = getDownloadLimits(user, listingsToDownload);`,
  `    if (!limitCheck.allowed) {`,
  `        toast({ variant: "destructive", title: "Download Limit Reached", description: limitCheck.message });`,
  `        return { success: false, limitReached: true, message: limitCheck.message };`,
  `    }`,
  `    const todayStart = startOfDay(new Date()).getTime();`,
  `    const individualToday = downloadHistory.filter(d => d.userId === user.email && d.timestamp >= todayStart).length;`,
  `    const INDIVIDUAL_LIMIT = user.plan === 'Paid_Premium' ? 15 : 5;`,
  `    if (individualToday === INDIVIDUAL_LIMIT - 1) {`,
  `        toast({ title: "Almost at your limit", description: "You have 1 download remaining today." });`,
  `    }`,
  `    `,
];

lines.splice(startLine, endLine - startLine, ...newCode);
fs.writeFileSync('src/contexts/data-context.tsx', lines.join('\n'));
console.log('Done!');
