const fs = require('fs');
let content = fs.readFileSync('ORS_ONE_BRIEFING.md', 'utf8');

content = content.replace(
  `## Known Issues / Pending`,
  `## Session 2 Updates (31 Mar 2026)
- Pricing page: auto-shuffling right card (Solo/Team/Full Connect - INR 5000/10000/17500)
- Signup: personal email blocked (Gmail, Yahoo etc) except balajispillai@gmail.com
- Signup: email OTP verification mandatory for Customer role before signup
- Login: pending/rejected accounts blocked from accessing dashboard
- User approval: SuperAdmin sees Status column (Pending/Active/Rejected) in Platform Users
- User approval: Approve/Reject buttons for pending users
- Auto-email via Resend when SuperAdmin approves a user (src/app/api/send-approval-email/route.ts)
- Auth login fix: signOut called before showing pending/rejected toast

## Known Issues / Pending`
);

fs.writeFileSync('ORS_ONE_BRIEFING.md', content);
console.log('Done!');
