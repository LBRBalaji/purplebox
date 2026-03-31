# ORS-ONE Platform Briefing for Claude

## What is ORS-ONE?
Warehouse leasing marketplace. URL: lease.orsone.app
Business model: Source → Engage → Transact

## Stack
- Frontend: Next.js 15, TypeScript
- Database: Firebase Firestore (asia-south1)
- Auth: Firebase Auth
- Hosting: Vercel (auto-deploy on push)
- Repo: github.com/LBRBalaji/purplebox
- Terminal: Firebase Studio (purpleboxone-backup-45535400:~/studio)

## Theme
- Background: hsl(259 30% 96%) — light lavender
- Primary: #6141ac — medium purple
- Accent: hsl(259 44% 75%) — light purple
- Font: Arial, Helvetica, sans-serif

## Business Model
- Stage 1 SOURCE: Developer MUST pay ₹5,000+GST per prospect (mandatory)
- Stage 2 ENGAGE & Stage 3 TRANSACT: Developer chooses:
  - Path 1: Pay platform fee, handle independently
  - Path 2: ORS-ONE as Official Transaction Partner, pay industry standard brokerage on deal closure

## User Roles
- SuperAdmin/O2O: Platform admin (superadmin@o2o.com)
- Warehouse Developer: Property Provider (e.g. ejaz_nathani@welspun.com - Welspun One)
- User: Customer/Tenant (e.g. balajispillai@gmail.com - LBR Balaji O2O, 3PL & Logistics, Paid_Premium)
- Agent: Real estate agent

## Key Rules
- Never expose customer email/phone to developer
- Show only industry type to developer (not company name) until payment
- All stakeholders stay on platform — no redirect to WhatsApp/phone
- Personal emails not allowed for customers EXCEPT balajispillai@gmail.com (permanent test account)

## Architecture
- All API routes: src/app/api/ — use firebase-admin SDK (getDb())
- Data context: src/contexts/data-context.tsx — main state management
- Auth context: src/contexts/auth-context.tsx
- All APIs use single doc '0' for chat-messages, typing-status, notifications
- Other APIs use delete-all-rewrite pattern (stable, do not change)

## Key Components
- src/components/prospects-tab.tsx — Developer prospects view
- src/components/payment-requests.tsx — SuperAdmin payment confirmation
- src/components/global-chat.tsx — WhatsApp-style chat widget
- src/components/chat-dialog.tsx — Chat panel (uses onSnapshot for real-time)
- src/components/data-governance.tsx — 5 admin tools for data management
- src/app/dashboard/page.tsx — Main dashboard (Provider/Customer/Admin)
- src/app/dashboard/manage-users/page.tsx — SuperAdmin user management
- src/app/pricing/page.tsx — Pricing page

## Completed Features
- Header with MoreDropdown, New Listing button, Pricing nav
- Pricing page (Pay For Purpose model)
- Data Governance (Transfer Listings, Transfer Leads, Merge Accounts, Deactivate & Reassign, Company Rebrand)
- Rejected Listings tab in SuperAdmin
- Prospects tab for Property Providers (industry type shown, not company name)
- Pay ₹5,000 to Connect flow (developer → SuperAdmin confirms → lead auto-created)
- Payment Requests tab in Manage Users for SuperAdmin
- WhatsApp-style real-time chat (onSnapshot)
- Industry type mandatory in customer signup (15 types)
- All APIs migrated to firebase-admin SDK

## How to Give Commands
- User is non-developer
- Give single terminal commands to paste directly
- Use Node.js scripts (cat > file.js << EOF ... EOF then node file.js) for complex changes
- Always verify changes with grep before pushing
- Git workflow: git add [files] → git commit -m "message" → git push

## Known Issues / In Progress
- Firestore reads high (813k) — delete-all-rewrite pattern pending optimization
- Real-time updates via onSnapshot caused crashes — reverted, needs proper fix
- Industry type shows "Verified Prospect" for old downloads (no industryType stored)

## Conversation History
Full transcript available at: /mnt/transcripts/2026-03-30-17-19-57-ors-one-app-development.txt
To read it in a new chat: "Please read the transcript at /mnt/transcripts/2026-03-30-17-19-57-ors-one-app-development.txt for full context"

## Last Session Summary (30 Mar 2026)
- Fixed Data Governance merge tool (status preserved on transfer)
- Built Prospects tab for Property Providers (industry type shown)
- Built Pay to Connect flow (INR 5000 per prospect)
- Built Payment Requests tab for SuperAdmin
- Auto-creates Registered Lead on payment confirmation
- Redesigned chat to WhatsApp style with real-time onSnapshot
- Migrated all 20 APIs from client Firebase SDK to firebase-admin SDK
- Added industry type to customer signup (15 types, mandatory)
- Fixed chat history, frozen buttons, header overflow
- Suppressed typing status error toast (non-critical)
- Reverted onSnapshot on data-context (caused crash)
- Reverted delete-all-rewrite optimization (caused crash)
- Added ORS_ONE_BRIEFING.md for Claude context in new chats

## Session 2 Updates (31 Mar 2026)
- Pricing page: auto-shuffling right card (Solo/Team/Full Connect - INR 5000/10000/17500)
- Signup: personal email blocked (Gmail/Yahoo etc) except balajispillai@gmail.com
- Signup: email OTP verification mandatory for Customer role
- Login: pending/rejected accounts blocked from dashboard access
- User list: Status column added (Pending/Active/Rejected) with Approve/Reject buttons
- Auto-approval email via Resend when SuperAdmin approves user
- Auth login: signOut called before showing pending/rejected toast
