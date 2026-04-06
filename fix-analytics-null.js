const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/analytics/page.tsx', 'utf8');

// Fix all .map() calls on potentially undefined arrays
content = content.replace(/\(downloadHistory\)\.map/g, '(downloadHistory || []).map');
content = content.replace(/\(registeredLeads\)\.map/g, '(registeredLeads || []).map');
content = content.replace(/\(listings\)\.map/g, '(listings || []).map');
content = content.replace(/\(demands\)\.map/g, '(demands || []).map');
content = content.replace(/\(communityPosts\)\.map/g, '(communityPosts || []).map');
content = content.replace(/communityPosts\.reduce/g, '(communityPosts || []).reduce');
content = content.replace(/communityPosts\.map/g, '(communityPosts || []).map');
content = content.replace(/\[\.\.\.communityPosts\]/g, '[...(communityPosts || [])]');
content = content.replace(/\[\.\.\.allUsers\]/g, '[...(allUsers || [])]');
content = content.replace(/allUsers\.filter/g, '(allUsers || []).filter');
content = content.replace(/new Set\(downloadHistory\.map/g, 'new Set((downloadHistory || []).map');
content = content.replace(/new Set\(communityPosts\.map/g, 'new Set((communityPosts || []).map');

fs.writeFileSync('src/app/dashboard/analytics/page.tsx', content);
console.log('Done!');
