const fs = require('fs');
let content = fs.readFileSync('src/contexts/data-context.tsx', 'utf8');

// Replace getCompanyDownloadCounts with new comprehensive function
content = content.replace(
  `  const getCompanyDownloadCounts = useCallback((companyName: string): { daily: number; weekly: number } => {
    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    const companyDownloads = downloadHistory.filter(d => d.companyName === companyName);
    
    const dailyTimestamps = new Set(companyDownloads.filter(d => d.timestamp >= todayStart).map(d => d.timestamp));
    const weeklyTimestamps = new Set(companyDownloads.filter(d => d.timestamp >= weekStart).map(d => d.timestamp));
    return {
        daily: dailyTimestamps.size,
        weekly: weeklyTimestamps.size,
    };
  }, [downloadHistory]);`,
  `  const getEmailDomain = (email: string) => {
    if (email === 'balajispillai@gmail.com') return 'balaji-test';
    return email.split('@')[1]?.toLowerCase() || email;
  };

  const getDownloadLimits = useCallback((user: User, listingsToDownload: ListingSchema[]) => {
    const todayStart = startOfDay(new Date()).getTime();
    const domain = getEmailDomain(user.email);
    const isPremium = user.plan === 'Paid_Premium';

    const INDIVIDUAL_LIMIT = isPremium ? 15 : 5;
    const CITY_LIMIT = isPremium ? 15 : 5;
    const MAX_CITIES = isPremium ? 10 : 3;

    // Individual daily downloads
    const individualToday = downloadHistory.filter(d => d.userId === user.email && d.timestamp >= todayStart).length;
    if (individualToday >= INDIVIDUAL_LIMIT) {
      return { allowed: false, message: \`You've reached your daily download limit of \${INDIVIDUAL_LIMIT} listings. Your limit refreshes tomorrow.\` + (!isPremium ? ' Upgrade to Premium for higher limits.' : '') };
    }

    // Soft warning at 4th download
    if (individualToday === INDIVIDUAL_LIMIT - 1) {
      // Will be handled after download
    }

    // Company domain checks
    const companyTodayDownloads = downloadHistory.filter(d => getEmailDomain(d.userId) === domain && d.timestamp >= todayStart);

    // Check cities downloaded today by company
    const citiesDownloadedToday = [...new Set(companyTodayDownloads.map(d => d.location?.toLowerCase().trim()))].filter(Boolean);

    // Get cities in this download request
    const newCities = [...new Set(listingsToDownload.map(l => l.location?.toLowerCase().trim()))].filter(Boolean);

    // Check city limit
    for (const city of newCities) {
      const cityDownloads = companyTodayDownloads.filter(d => d.location?.toLowerCase().trim() === city).length;
      if (cityDownloads >= CITY_LIMIT) {
        return { allowed: false, message: \`Your team has reached the daily download limit for \${city}. Explore listings in other locations or upgrade your plan.\` };
      }
    }

    // Check max cities limit
    const allCitiesToday = new Set([...citiesDownloadedToday, ...newCities]);
    if (allCitiesToday.size > MAX_CITIES) {
      return { allowed: false, message: \`Your team has reached the maximum of \${MAX_CITIES} cities per day. Upgrade to Premium to access more locations.\` };
    }

    return { allowed: true, message: '' };
  }, [downloadHistory]);

  const getCompanyDownloadCounts = useCallback((companyName: string): { daily: number; weekly: number } => {
    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    const companyDownloads = downloadHistory.filter(d => d.companyName === companyName);
    const dailyTimestamps = new Set(companyDownloads.filter(d => d.timestamp >= todayStart).map(d => d.timestamp));
    const weeklyTimestamps = new Set(companyDownloads.filter(d => d.timestamp >= weekStart).map(d => d.timestamp));
    return { daily: dailyTimestamps.size, weekly: weeklyTimestamps.size };
  }, [downloadHistory]);`
);

// Replace old limit check in logDownload
content = content.replace(
  `    const { daily, weekly } = getCompanyDownloadCounts(user.companyName);
    if (user.plan !== 'Paid_Premium') {
        if (daily >= 2) {
            const message = "Your company has reached its daily download limit of 2. Premium users have unlimited downloads.";
            toast({ variant: "destructive", title: "Daily Limit Reached", description: message });
            return { success: false, limitReached: true, message };
        }
        if (weekly >= 4) {
            const message = "Your company has reached its weekly download limit of 4. Premium users have unlimited downloads.";
            toast({ variant: "destructive", title: "Weekly Limit Reached", description: message });
            return { success: false, limitReached: true, message };
        }
    }`,
  `    const limitCheck = getDownloadLimits(user, listingsToDownload);
    if (!limitCheck.allowed) {
        toast({ variant: "destructive", title: "Download Limit Reached", description: limitCheck.message });
        return { success: false, limitReached: true, message: limitCheck.message };
    }

    // Soft warning — 1 download remaining
    const todayStart = startOfDay(new Date()).getTime();
    const individualToday = downloadHistory.filter(d => d.userId === user.email && d.timestamp >= todayStart).length;
    const INDIVIDUAL_LIMIT = user.plan === 'Paid_Premium' ? 15 : 5;
    if (individualToday === INDIVIDUAL_LIMIT - 1) {
        toast({ title: "Almost at your limit", description: "You have 1 download remaining today. Use it wisely!" });
    }`
);

// Add getDownloadLimits to useCallback dependencies
content = content.replace(
  `  }, [getCompanyDownloadCounts, persistDownloadHistory, persistListingAnalytics, toast, addRegisteredLead]);`,
  `  }, [getCompanyDownloadCounts, getDownloadLimits, persistDownloadHistory, persistListingAnalytics, toast]);`
);

fs.writeFileSync('src/contexts/data-context.tsx', content);
console.log('Done!');
