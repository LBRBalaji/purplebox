/**
 * ORS-ONE Engagement Jobs — All touch points in one place
 * Trigger: GET /api/engagement-jobs?job=all  (or specific job name)
 * Vercel cron: daily at 8am IST via vercel.json
 */
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

const BASE = 'https://orsone.app';
const FROM = 'ORS-ONE <noreply@lakshmibalajio2o.com>';

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
  } catch {}
}

function wrap(title: string, body: string, ctaText: string, ctaHref: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;padding:32px;background:#f4f2fb;"><div style="background:linear-gradient(135deg,#1e1537,#3b2870);padding:20px;text-align:center;margin-bottom:24px;"><h1 style="color:#fff;margin:0;font-size:20px;">ORS-ONE</h1><p style="color:#9b7ee0;margin:6px 0 0;font-size:12px;">Building Transaction Ready Assets</p></div><div style="background:#fff;padding:28px;border:1px solid #e8e2f5;"><h2 style="color:#1e1537;font-size:16px;margin:0 0 12px;">${title}</h2>${body}<div style="text-align:center;margin:24px 0;"><a href="${ctaHref}" style="background:#6141ac;color:#fff;padding:12px 28px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">${ctaText} →</a></div><p style="color:#aaa;font-size:11px;text-align:center;">Lakshmi Balaji ORS Private Limited · orsone.app</p></div></div>`;
}

async function getAll(path: string) {
  try {
    const r = await fetch(`${BASE}/api/${path}`);
    const d = await r.json();
    return Array.isArray(d) ? d : Object.values(d || {});
  } catch { return []; }
}

async function postNotif(notif: any) {
  try {
    const existing: any[] = await getAll('notifications');
    await fetch(`${BASE}/api/notifications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([...existing, notif]) });
  } catch {}
}

function canEmail(user: any) { return user && user.emailNotifications !== false; }

// TP2 — 48hr RFQ unanswered nudge
async function tp2_rfqNudge(leads: any[], acts: any[], users: Record<string, any>) {
  let n = 0;
  const now = Date.now();
  for (const lead of leads) {
    const la = acts.filter(a => a.leadId === lead.id);
    const rfq = la.find(a => a.activityType === 'Quote Requested');
    if (!rfq) continue;
    const age = now - new Date(rfq.createdAt).getTime();
    if (age < 48 * 3600000 || age > 7 * 86400000) continue;
    const responded = la.some(a => ['Proposal Submitted', 'Site Visit Request'].includes(a.activityType));
    if (responded) continue;
    const devEmail = lead.providers?.[0]?.providerEmail;
    const dev = devEmail ? users[devEmail.toLowerCase()] : null;
    const cust = users[lead.customerId?.toLowerCase()];
    if (dev && canEmail(dev)) {
      await sendEmail(devEmail, `Action Required: Quote Request Awaiting Response — ${lead.id}`,
        wrap('Quote Request Pending 48 Hours',
          `<p style="color:#555;font-size:14px;line-height:1.7;"><strong>${lead.leadName}</strong> sent you a Request for Quote 48 hours ago and is awaiting your response.</p><div style="background:#fff8f0;border:1px solid #fde68a;padding:12px 16px;margin:16px 0;"><p style="color:#92400e;font-size:13px;margin:0;"><strong>Property:</strong> ${lead.requirementsSummary}</p></div>`,
          'Respond Now', `${BASE}/dashboard/leads/${lead.id}?tab=activity`));
      n++;
    }
    if (cust && canEmail(cust)) {
      await sendEmail(lead.customerId, `Your Quote Request — Status Update`,
        wrap('Quote Request Pending',
          `<p style="color:#555;font-size:14px;line-height:1.7;">Your Request for Quote for <strong>${lead.requirementsSummary}</strong> is still awaiting a developer response. ORS-ONE is monitoring this transaction.</p>`,
          'View Transaction', `${BASE}/dashboard/leads/${lead.id}?tab=activity`));
      n++;
    }
  }
  return n;
}

// TP3 — Demand → developer match notification
async function tp3_demandMatch(demands: any[], listings: any[], users: Record<string, any>, leads: any[]) {
  let n = 0;
  for (const demand of demands) {
    if (!demand.isOrsoneTP || !demand.location) continue;
    const [dlat, dlng] = demand.location.split(',').map(Number);
    if (isNaN(dlat)) continue;
    for (const l of listings) {
      if (l.status !== 'approved' || !l.latLng) continue;
      const [llat, llng] = l.latLng.split(',').map(Number);
      if (isNaN(llat)) continue;
      const R = 6371, dLa = (llat - dlat) * Math.PI / 180, dLo = (llng - dlng) * Math.PI / 180;
      const a = Math.sin(dLa/2)**2 + Math.cos(dlat*Math.PI/180)*Math.cos(llat*Math.PI/180)*Math.sin(dLo/2)**2;
      if (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) > (demand.radius || 30)) continue;
      if (demand.size && Math.abs((l.sizeSqFt||0) - demand.size) / demand.size > 0.3) continue;
      if (leads.some(ld => ld.customerId === demand.userEmail && ld.providers?.some((p: any) => p.properties?.some((pr: any) => pr.listingId === l.listingId)))) continue;
      const dev = l.developerId ? users[l.developerId.toLowerCase()] : null;
      if (!dev || !canEmail(dev)) continue;
      await sendEmail(l.developerId, `ORS-ONE: Customer Demand Matches Your Listing — ${l.listingId}`,
        wrap('New Demand Matches Your Listing',
          `<p style="color:#555;font-size:14px;line-height:1.7;">A verified customer needs <strong>${demand.size?.toLocaleString()} sft</strong> near <strong>${demand.locationName || demand.location}</strong> — your listing <strong>${l.listingId}</strong> is a match.</p><div style="background:#fffbeb;border:1px solid #fde68a;padding:12px 16px;margin:16px 0;"><p style="color:#92400e;font-size:12px;margin:0;">ORS-ONE Transaction Partner demand — brokerage applies on closure. Visit the Demand Board to submit your listing as a match.</p></div>`,
          'View Demand Board', `${BASE}/dashboard?tab=submit-match`));
      await postNotif({ id: `dm-${demand.demandId}-${l.listingId}`, type: 'new_lead_for_provider', title: `Demand Match: ${l.listingId}`, message: `A customer needs ${demand.size?.toLocaleString()} sft near ${demand.locationName || 'your area'}. Your listing ${l.listingId} matches. Visit Demand Board.`, href: `/dashboard?tab=submit-match`, recipientEmail: l.developerId, timestamp: new Date().toISOString(), triggeredBy: 'system', isRead: false });
      n++;
    }
  }
  return n;
}

// TP1 — Developer weekly digest (run on Mondays)
async function tp1_weeklyDigest(listings: any[], analytics: any[], leads: any[], downloads: any[], users: Record<string, any>) {
  let n = 0;
  const ago7 = Date.now() - 7 * 86400000;
  const devs = Object.values(users).filter((u: any) => u.role === 'Warehouse Developer' && u.status === 'approved');
  for (const dev of devs) {
    if (!canEmail(dev)) continue;
    const ids = new Set(listings.filter((l: any) => l.developerId === dev.email && l.status === 'approved').map((l: any) => l.listingId));
    if (ids.size === 0) continue;
    const views = analytics.filter((a: any) => ids.has(a.listingId)).reduce((s: number, a: any) => s + (a.viewedBy?.filter((v: any) => v.timestamp >= ago7).length || 0), 0);
    const dls = downloads.filter((d: any) => ids.has(d.listingId) && d.timestamp >= ago7).length;
    const pending = leads.filter((l: any) => l.providers?.some((p: any) => p.providerEmail === dev.email)).length;
    if (views === 0 && dls === 0 && pending === 0) continue;
    await sendEmail(dev.email, `ORS-ONE Weekly: ${views} views · ${dls} downloads on your listings`,
      wrap('Your Week on ORS-ONE',
        `<table style="width:100%;border-collapse:collapse;margin:16px 0;"><tr style="background:#f4f2fb;"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6141ac;">Listing Views</td><td style="padding:10px 14px;font-size:20px;font-weight:700;color:#1e1537;text-align:right;">${views}</td></tr><tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6141ac;border-top:1px solid #e8e2f5;">Spec Downloads</td><td style="padding:10px 14px;font-size:20px;font-weight:700;color:#1e1537;text-align:right;border-top:1px solid #e8e2f5;">${dls}</td></tr><tr style="background:#f4f2fb;"><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#6141ac;">Active Transactions</td><td style="padding:10px 14px;font-size:20px;font-weight:700;color:#1e1537;text-align:right;">${pending}</td></tr></table>${dls > 0 ? `<p style="color:#555;font-size:13px;line-height:1.7;"><strong>${dls} customer${dls > 1 ? 's' : ''}</strong> downloaded your specs this week — high intent signals. Check your Prospects tab.</p>` : ''}`,
        'View Dashboard', `${BASE}/dashboard?tab=registered-leads`));
    n++;
  }
  return n;
}

// TP5 — Site visit day-before reminder
async function tp5_siteVisit(leads: any[], acts: any[], users: Record<string, any>) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tDate = tomorrow.toISOString().slice(0, 10);
  let n = 0;
  for (const lead of leads) {
    const v = acts.find(a => a.leadId === lead.id && a.activityType === 'Site Visit Request' && a.details?.visitDateTime?.slice(0, 10) === tDate);
    if (!v) continue;
    const dt = v.details?.visitDateTime ? new Date(v.details.visitDateTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Tomorrow';
    for (const email of [lead.customerId, lead.providers?.[0]?.providerEmail].filter(Boolean)) {
      const u = users[email.toLowerCase()];
      if (!canEmail(u)) continue;
      await sendEmail(email, `ORS-ONE: Site Visit Tomorrow — ${dt}`,
        wrap('Site Visit Reminder',
          `<p style="color:#555;font-size:14px;line-height:1.7;">Reminder: a site visit is scheduled for <strong>${dt}</strong>.</p><div style="background:#f4f2fb;border:1px solid #d4c8f0;padding:16px;margin:16px 0;"><p style="color:#1e1537;font-size:14px;margin:0;"><strong>Property:</strong> ${lead.requirementsSummary}</p></div>`,
          'View Transaction', `${BASE}/dashboard/leads/${lead.id}?tab=activity`));
      n++;
    }
  }
  return n;
}

// TP6 — Post-approval onboarding
async function tp6_onboarding(users: Record<string, any>, leads: any[], downloads: any[]) {
  let n = 0;
  for (const u of Object.values(users)) {
    if (u.role !== 'User' || u.status !== 'approved' || !canEmail(u) || !u.approvedAt) continue;
    const days = (Date.now() - new Date(u.approvedAt).getTime()) / 86400000;
    const dls = downloads.filter((d: any) => d.userId === u.email).length;
    const myLeads = leads.filter((l: any) => l.customerId === u.email).length;
    if (days >= 3 && days < 4 && dls === 0) {
      await sendEmail(u.email, `ORS-ONE: 3 steps to find your ideal warehouse`,
        wrap('Ready to Find Your Warehouse?',
          `<p style="color:#555;font-size:14px;line-height:1.7;">Your ORS-ONE account has been active for 3 days. Here's how to get started:</p><ol style="color:#555;font-size:14px;line-height:2;"><li>Browse listings and shortlist properties that match your requirements</li><li>Download technical specs for your team to review</li><li>Send a Request for Quote — get rent and lease terms directly from the developer</li></ol>`,
          'Browse Listings', `${BASE}/listings`));
      n++;
    }
    if (days >= 7 && days < 8 && dls > 0 && myLeads === 0) {
      await sendEmail(u.email, `ORS-ONE: Your downloaded listings are waiting for a quote request`,
        wrap(`You've Downloaded ${dls} Listing${dls > 1 ? 's' : ''} — Ready for Quotes?`,
          `<p style="color:#555;font-size:14px;line-height:1.7;">You've been exploring listings. The next step is a Request for Quote — one click from your shortlist. Customers who send their first RFQ within 7 days are significantly more likely to close a deal.</p>`,
          'Send Request for Quote', `${BASE}/dashboard?tab=my-shortlist`));
      n++;
    }
  }
  return n;
}

// TP7 — Deal milestones
async function tp7_milestones(leads: any[], acts: any[], users: Record<string, any>) {
  let n = 0;
  for (const lead of leads) {
    const la = acts.filter(a => a.leadId === lead.id);
    const mom = la.find(a => a.activityType === 'Lead Acknowledged' && a.details?.message?.includes('Minutes of Meeting'));
    if (!mom) continue;
    const alreadySent = la.some(a => a.details?.message?.includes('milestone-mom-email'));
    if (alreadySent) continue;
    for (const email of [lead.customerId, lead.providers?.[0]?.providerEmail].filter(Boolean)) {
      const u = users[email.toLowerCase()];
      if (!canEmail(u)) continue;
      await sendEmail(email, `ORS-ONE: Minutes of Meeting Finalised — ${lead.id}`,
        wrap('Minutes of Meeting Finalised',
          `<p style="color:#555;font-size:14px;line-height:1.7;">The Minutes of Meeting for transaction <strong>${lead.id}</strong> have been finalised. Next step: review the Term Sheet and proceed to MoU when both parties are aligned.</p>`,
          'View Transaction', `${BASE}/dashboard/leads/${lead.id}?tab=negotiation-board`));
      n++;
    }
  }
  return n;
}

// TP9 — Re-engagement
async function tp9_reEngagement(leads: any[], acts: any[], users: Record<string, any>) {
  let n = 0;
  const ago7 = Date.now() - 7 * 86400000;
  const custLeads: Record<string, any[]> = {};
  for (const l of leads) { if (!custLeads[l.customerId]) custLeads[l.customerId] = []; custLeads[l.customerId].push(l); }
  for (const [cid, cls] of Object.entries(custLeads)) {
    const u = users[cid.toLowerCase()];
    if (!canEmail(u)) continue;
    const lastAct = Math.max(...acts.filter(a => cls.some(l => l.id === a.leadId) && a.createdBy === cid).map(a => new Date(a.createdAt).getTime()), 0);
    if (!lastAct || lastAct > ago7) continue;
    const summaries = cls.map(lead => {
      const la = acts.filter(a => a.leadId === lead.id);
      if (la.some(a => a.activityType === 'Proposal Submitted')) return `• ${lead.requirementsSummary} — <strong>Developer submitted a quote, awaiting your review</strong>`;
      if (la.some(a => a.activityType === 'Quote Requested')) return `• ${lead.requirementsSummary} — Quote requested, awaiting developer response`;
      return null;
    }).filter(Boolean);
    if (!summaries.length) continue;
    await sendEmail(cid, `ORS-ONE: ${summaries.length} transaction${summaries.length > 1 ? 's' : ''} awaiting your attention`,
      wrap('Your Transactions Need Attention',
        `<p style="color:#555;font-size:14px;line-height:1.7;">You have <strong>${summaries.length} active transaction${summaries.length > 1 ? 's' : ''}</strong> on ORS-ONE:</p><div style="background:#f4f2fb;border:1px solid #d4c8f0;padding:16px;margin:16px 0;">${summaries.map((s: any) => `<p style="color:#1e1537;font-size:13px;margin:0 0 8px;line-height:1.6;">${s}</p>`).join('')}</div>`,
        'View My Transactions', `${BASE}/dashboard?tab=my-transactions`));
    n++;
  }
  return n;
}

// TP10/11 — Expiry nudges
async function tp10_expiry(listings: any[], demands: any[], users: Record<string, any>) {
  let n = 0;
  const now = new Date(); const p30 = new Date(now.getTime() + 30 * 86400000);
  for (const l of listings) {
    if (l.status !== 'approved' || !l.availabilityDate) continue;
    const av = new Date(l.availabilityDate);
    if (av < now || av > p30) continue;
    const dev = l.developerId ? users[l.developerId.toLowerCase()] : null;
    if (!canEmail(dev)) continue;
    const days = Math.round((av.getTime() - now.getTime()) / 86400000);
    await sendEmail(l.developerId, `ORS-ONE: Update availability date for ${l.listingId} — ${days} days remaining`,
      wrap(`Listing Availability Date Approaching`,
        `<p style="color:#555;font-size:14px;line-height:1.7;">Your listing <strong>${l.listingId}</strong> shows availability in <strong>${days} days</strong>. Please update the date if the timeline has changed.</p>`,
        'Update Listing', `${BASE}/dashboard?tab=my-listings`));
    n++;
  }
  for (const d of demands) {
    if (!d.createdAt || !d.userEmail) continue;
    const age = (now.getTime() - new Date(d.createdAt).getTime()) / 86400000;
    if (age < 28 || age > 32) continue;
    const u = users[d.userEmail?.toLowerCase()];
    if (!canEmail(u)) continue;
    await sendEmail(d.userEmail, `ORS-ONE: Your warehouse requirement — 30-day update`,
      wrap('Your Demand Has Been Active 30 Days',
        `<p style="color:#555;font-size:14px;line-height:1.7;">Your requirement for <strong>${d.size?.toLocaleString()} sft near ${d.locationName || d.location}</strong> has been live for 30 days. Would you like ORS-ONE to proactively reach out to developers? Add ORS-ONE as Transaction Partner to activate our network.</p>`,
        'Update My Demand', `${BASE}/dashboard?tab=my-demands`));
    n++;
  }
  return n;
}

export async function GET(req: NextRequest) { return run(req.nextUrl.searchParams.get('job') || 'all'); }
export async function POST(req: NextRequest) { const b = await req.json().catch(() => ({})); return run(b.job || 'all'); }

async function run(job: string) {
  try {
    const [leads, acts, usersArr, listings, analytics, downloads, demands] = await Promise.all([
      getAll('registered-leads'), getAll('transaction-activities'), getAll('users'),
      getAll('listings'), getAll('listing-analytics'), getAll('download-history'), getAll('demands'),
    ]);
    const users: Record<string, any> = {};
    usersArr.forEach((u: any) => { if (u.email) users[u.email.toLowerCase()] = u; });
    const r: Record<string, number> = {};
    if (job === 'all' || job === 'rfq_nudge') r.rfq_nudge = await tp2_rfqNudge(leads, acts, users);
    if (job === 'all' || job === 'demand_match') r.demand_match = await tp3_demandMatch(demands, listings, users, leads);
    if (job === 'all' || job === 'weekly_digest') r.weekly_digest = await tp1_weeklyDigest(listings, analytics, leads, downloads, users);
    if (job === 'all' || job === 'site_visit') r.site_visit = await tp5_siteVisit(leads, acts, users);
    if (job === 'all' || job === 'onboarding') r.onboarding = await tp6_onboarding(users, leads, downloads);
    if (job === 'all' || job === 'milestones') r.milestones = await tp7_milestones(leads, acts, users);
    if (job === 'all' || job === 'reengagement') r.reengagement = await tp9_reEngagement(leads, acts, users);
    if (job === 'all' || job === 'expiry') r.expiry = await tp10_expiry(listings, demands, users);
    return NextResponse.json({ success: true, results: r, timestamp: new Date().toISOString() });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
