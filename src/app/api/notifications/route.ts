import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
export const runtime = 'nodejs';

const COLLECTION = 'notifications';
const USERS_COLLECTION = 'users';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET() {
  try {
    const docSnap = await getDb().collection(COLLECTION).doc('0').get();
    if (docSnap.exists) {
      const data = docSnap.data();
      return NextResponse.json(Array.isArray(data?.data) ? data.data : Object.values(data || {}), { headers });
    }
    return NextResponse.json([], { headers });
  } catch (error) {
    console.error('Failed to read ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500, headers });
  }
}

async function sendEmail(to: string, subject: string, title: string, message: string, href: string) {
  if (!process.env.RESEND_API_KEY) return;
  const link = href?.startsWith('http') ? href : 'https://lease.orsone.app' + (href || '/dashboard');
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [to],
        subject,
        html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f4f2fb;">
  <div style="background:linear-gradient(135deg,#1e1537,#3b2870);padding:20px;text-align:center;margin-bottom:24px;">
    <h1 style="color:#fff;margin:0;font-size:20px;">ORS-ONE</h1>
    <p style="color:#9b7ee0;margin:6px 0 0;font-size:12px;">Building Transaction Ready Assets</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e8e2f5;">
    <h2 style="color:#6141ac;font-size:16px;margin:0 0 10px;">${title}</h2>
    <p style="color:#1A2B3C;font-size:14px;line-height:1.6;margin-bottom:20px;">${message || ''}</p>
    <div style="text-align:center;margin:20px 0;">
      <a href="${link}" style="background:#6141ac;color:#fff;padding:12px 28px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">
        View on ORS-ONE →
      </a>
    </div>
    <p style="color:#888;font-size:11px;text-align:center;margin-top:16px;">You are receiving this because you are a participant in this transaction on ORS-ONE.</p>
  </div>
  <p style="color:#bbb;font-size:11px;text-align:center;margin-top:16px;">Lakshmi Balaji ORS Private Limited · lease.orsone.app</p>
</div>`,
      }),
    });
  } catch (e) {
    console.error('Email send error:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const newData = await request.json();

    // ── Fire emails for any NEW notifications in the payload ──────────────
    const newNotifs = Array.isArray(newData) ? newData : [];
    
    // Fetch current notifications to find which ones are new
    let existingIds = new Set<string>();
    try {
      const existing = await getDb().collection(COLLECTION).doc('0').get();
      if (existing.exists) {
        const data = existing.data();
        const arr = Array.isArray(data?.data) ? data.data : Object.values(data || {});
        existingIds = new Set(arr.map((n: any) => n.id).filter(Boolean));
      }
    } catch {}

    // Send emails for new notifications only
    // Fetch user preferences individually (targeted) instead of full collection read
    for (const notif of newNotifs) {
      if (!notif?.id || existingIds.has(notif.id)) continue;
      if (!notif.recipientEmail || notif.isRead) continue;

      // Targeted single-doc read instead of fetching all users
      let emailNotificationsEnabled = true;
      try {
        const userDocs = await getDb().collection(USERS_COLLECTION)
          .where('email', '==', notif.recipientEmail.toLowerCase()).limit(1).get();
        if (!userDocs.empty) {
          const userData = userDocs.docs[0].data();
          emailNotificationsEnabled = userData.emailNotifications !== false;
        }
      } catch {}
      if (!emailNotificationsEnabled) continue;

      // Build subject from type
      const subject = buildSubject(notif);
      await sendEmail(notif.recipientEmail, subject, notif.title || 'Update on ORS-ONE', notif.message || '', notif.href || '/dashboard');
    }

    // ── Persist notifications ─────────────────────────────────────────────
    const colRef = getDb().collection(COLLECTION);
    const snapshot = await colRef.get();
    await Promise.all(snapshot.docs.map(d => d.ref.delete()));
    if (Array.isArray(newData)) {
      await Promise.all(newData.map((item, i) => colRef.doc(String(i)).set(item)));
    } else {
      await Promise.all(Object.entries(newData).map(([key, value]) =>
        colRef.doc(key).set(typeof value === 'object' ? value as object : { value })
      ));
    }
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}

function buildSubject(notif: any): string {
  const type = notif.type || '';
  const title = notif.title || '';
  if (type === 'new_lead_for_provider') return `ORS-ONE: New Lead — ${title}`;
  if (type === 'new_activity') {
    if (title.includes('Quote') || title.includes('RFQ')) return `ORS-ONE: Quote Update — ${title}`;
    if (title.includes('Brokerage')) return `ORS-ONE: Brokerage Acknowledgement — ${title}`;
    if (title.includes('Agent')) return `ORS-ONE: Agent Appointed — ${title}`;
    if (title.includes('Site Visit')) return `ORS-ONE: Site Visit Update — ${title}`;
    if (title.includes('Proposal')) return `ORS-ONE: Proposal Submitted — ${title}`;
    return `ORS-ONE: Transaction Update — ${title}`;
  }
  if (type === 'new_demand') return `ORS-ONE: New Demand — ${title}`;
  if (type === 'new_chat_message') return `ORS-ONE: New Message — ${title}`;
  return `ORS-ONE: ${title}`;
}
