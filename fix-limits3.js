const fs = require('fs');
let lines = fs.readFileSync('src/contexts/data-context.tsx', 'utf8').split('\n');

const insertAt = lines.findIndex(l => l.includes('const getCompanyDownloadCounts = useCallback'));

const newFunc = [
  `  const getEmailDomain = (email: string) => {`,
  `    if (email === 'balajispillai@gmail.com') return 'balaji-test';`,
  `    return email.split('@')[1]?.toLowerCase() || email;`,
  `  };`,
  ``,
  `  const getDownloadLimits = useCallback((user: User, listingsToDownload: ListingSchema[]) => {`,
  `    const todayStart = startOfDay(new Date()).getTime();`,
  `    const domain = getEmailDomain(user.email);`,
  `    const isPremium = user.plan === 'Paid_Premium';`,
  `    const INDIVIDUAL_LIMIT = isPremium ? 15 : 5;`,
  `    const CITY_LIMIT = isPremium ? 15 : 5;`,
  `    const MAX_CITIES = isPremium ? 10 : 3;`,
  `    const individualToday = downloadHistory.filter(d => d.userId === user.email && d.timestamp >= todayStart).length;`,
  `    if (individualToday >= INDIVIDUAL_LIMIT) {`,
  `      return { allowed: false, message: \`You've reached your daily limit of \${INDIVIDUAL_LIMIT} downloads. Your access refreshes tomorrow.\${!isPremium ? ' Upgrade to Premium for higher limits.' : ''}\` };`,
  `    }`,
  `    const companyTodayDownloads = downloadHistory.filter(d => getEmailDomain(d.userId) === domain && d.timestamp >= todayStart);`,
  `    const citiesDownloadedToday = [...new Set(companyTodayDownloads.map(d => d.location?.toLowerCase().trim()))].filter(Boolean);`,
  `    const newCities = [...new Set(listingsToDownload.map(l => l.location?.toLowerCase().trim()))].filter(Boolean);`,
  `    for (const city of newCities) {`,
  `      const cityDownloads = companyTodayDownloads.filter(d => d.location?.toLowerCase().trim() === city).length;`,
  `      if (cityDownloads >= CITY_LIMIT) {`,
  `        return { allowed: false, message: \`Your team has reached the daily download limit for \${city}. Explore listings in other locations or upgrade your plan.\` };`,
  `      }`,
  `    }`,
  `    const allCitiesToday = new Set([...citiesDownloadedToday, ...newCities]);`,
  `    if (allCitiesToday.size > MAX_CITIES) {`,
  `      return { allowed: false, message: \`Your team has reached the maximum of \${MAX_CITIES} cities per day. Upgrade to Premium to access more locations.\` };`,
  `    }`,
  `    return { allowed: true, message: '' };`,
  `  }, [downloadHistory]);`,
  ``,
];

lines.splice(insertAt, 0, ...newFunc);
fs.writeFileSync('src/contexts/data-context.tsx', lines.join('\n'));
console.log('Done! Inserted at line:', insertAt);
