const fs = require('fs');
let content = fs.readFileSync('src/contexts/data-context.tsx', 'utf8');

content = content.replace(
  `    setDownloadHistory(prev => {
        const updatedHistory = [...prev, ...newDownloadRecords];
        persistDownloadHistory(updatedHistory);
        return updatedHistory;
    });`,
  `    // Auto-create leads per provider on download
    Object.entries(providerToListingsMap).forEach(([providerEmail, listingIds]) => {
      if (providerEmail === 'superadmin@o2o.com') return;
      const leadId = 'LDR-DL-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2,5).toUpperCase();
      const newLead: Omit<RegisteredLead, 'registeredAt'> = {
        id: leadId,
        customerId: user.email,
        leadName: user.companyName,
        leadContact: user.userName,
        leadEmail: user.email,
        leadPhone: user.phone || '',
        requirementsSummary: 'Customer downloaded listing details. Awaiting engagement.',
        registeredBy: user.email,
        providers: [{
          providerEmail,
          properties: listingIds.map(id => ({ listingId: id, status: 'Pending' })),
        }],
        isO2OCollaborator: false,
        engagePath: null,
      };
      addRegisteredLead(newLead, user.email);
    });

    setDownloadHistory(prev => {
        const updatedHistory = [...prev, ...newDownloadRecords];
        persistDownloadHistory(updatedHistory);
        return updatedHistory;
    });`
);

fs.writeFileSync('src/contexts/data-context.tsx', content);
console.log('Done!');
