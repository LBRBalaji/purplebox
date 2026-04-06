const fs = require('fs');
let content = fs.readFileSync('src/components/engage-path-selector.tsx', 'utf8');

content = content.replace(
  `      } else {
        updateRegisteredLead({ ...lead, engagePath: selected });
        toast({ title: 'Engagement Path Selected', description: 'Your preference has been saved. You can now proceed with the transaction.' });
      }`,
  `      } else {
        updateRegisteredLead({ ...lead, engagePath: selected });
        // Notify SuperAdmin if ORS-ONE chosen as Transaction Partner
        if (selected === 'orsone') {
          try {
            const notifRes = await fetch('/api/notifications');
            const notifData = await notifRes.json();
            const existingNotifs = Array.isArray(notifData) ? notifData : Object.values(notifData);
            const newNotif = {
              id: 'notif-' + Date.now(),
              type: 'new_activity',
              title: 'ORS-ONE Transaction Partner Request',
              message: (user?.companyName || user?.userName || 'A customer') + ' has selected ORS-ONE as their Official Transaction Partner for lead ' + leadId + '. Please follow up.',
              href: '/dashboard/transactions',
              timestamp: new Date().toISOString(),
              recipientEmail: 'superadmin@o2o.com',
              triggeredBy: user?.email || 'customer',
              isRead: false,
            };
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify([...existingNotifs, newNotif]),
            });
          } catch(e) { console.error('Notification error:', e); }
        }
        toast({ title: 'Engagement Path Selected', description: 'Your preference has been saved. You can now proceed with the transaction.' });
      }`
);

fs.writeFileSync('src/components/engage-path-selector.tsx', content);
console.log('Done!');
