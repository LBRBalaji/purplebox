import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
export const runtime = 'nodejs';

const COLLECTION = 'ors-transact-enquiries';
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

export async function GET() {
  try {
    const snap = await getDb().collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await getDb().collection(COLLECTION).doc(body.id).set(body);

    const ORS_ADMIN = 'balaji@lakshmibalajio2o.com';

    // Email admin — full customer details
    await sendEmail(ORS_ADMIN,
      `ORS Transact Availability Request — ${body.orsPropertyId}`,
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f4f2fb;">
        <div style="background:linear-gradient(135deg,#1e1537,#3b2870);padding:20px;text-align:center;margin-bottom:24px;">
          <h1 style="color:#fff;margin:0;font-size:18px;">ORS Transact — Availability Request</h1>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e8e2f5;">
          <h2 style="color:#6141ac;font-size:15px;margin:0 0 16px;">New request received — please verify availability</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr style="background:#f4f2fb;"><td style="padding:8px 12px;font-weight:600;color:#6141ac;width:40%">ORS Property ID</td><td style="padding:8px 12px;color:#1e1537;">${body.orsPropertyId}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6141ac;border-top:1px solid #e8e2f5">Facility Type</td><td style="padding:8px 12px;color:#1e1537;border-top:1px solid #e8e2f5">${body.facilityType}</td></tr>
            <tr style="background:#f4f2fb;"><td style="padding:8px 12px;font-weight:600;color:#6141ac;">Location</td><td style="padding:8px 12px;color:#1e1537;">${body.location}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6141ac;border-top:1px solid #e8e2f5">Size</td><td style="padding:8px 12px;color:#1e1537;border-top:1px solid #e8e2f5">${body.size}</td></tr>
            <tr style="background:#f4f2fb;"><td style="padding:8px 12px;font-weight:600;color:#6141ac;">Customer</td><td style="padding:8px 12px;color:#1e1537;">${body.customerName}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6141ac;border-top:1px solid #e8e2f5">Email</td><td style="padding:8px 12px;color:#1e1537;border-top:1px solid #e8e2f5">${body.customerEmail}</td></tr>
            <tr style="background:#f4f2fb;"><td style="padding:8px 12px;font-weight:600;color:#6141ac;">Phone</td><td style="padding:8px 12px;color:#1e1537;">${body.customerPhone || '—'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6141ac;border-top:1px solid #e8e2f5">Enquiry ID</td><td style="padding:8px 12px;color:#1e1537;border-top:1px solid #e8e2f5">${body.id}</td></tr>
          </table>
          <div style="margin-top:20px;padding:12px;background:#fff8f0;border:1px solid #fde68a;">
            <p style="color:#92400e;font-size:12px;margin:0;">Action required: Call or email customer to confirm availability, then update the ORS Transact record.</p>
          </div>
        </div>
        <p style="color:#bbb;font-size:11px;text-align:center;margin-top:16px;">Lakshmi Balaji ORS Private Limited · lease.orsone.app</p>
      </div>`
    );

    // Email tele-caller — ORS ID, location, size ONLY (no customer details)
    await sendEmail(ORS_ADMIN,
      `Availability Check — ${body.orsPropertyId} · ${body.location}`,
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f4f2fb;">
        <div style="background:#1e1537;padding:16px;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;font-size:16px;">Tele-Calling Task — Verify Availability</h1>
        </div>
        <div style="background:#fff;padding:20px;border:1px solid #e8e2f5;">
          <p style="color:#1e1537;font-size:14px;font-weight:600;margin:0 0 12px;">Please verify current availability for the following property:</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr style="background:#f4f2fb;"><td style="padding:8px 12px;font-weight:600;color:#6141ac;">ORS Property ID</td><td style="padding:8px 12px;color:#1e1537;">${body.orsPropertyId}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600;color:#6141ac;border-top:1px solid #e8e2f5">Location</td><td style="padding:8px 12px;color:#1e1537;border-top:1px solid #e8e2f5">${body.location}</td></tr>
            <tr style="background:#f4f2fb;"><td style="padding:8px 12px;font-weight:600;color:#6141ac;">Size</td><td style="padding:8px 12px;color:#1e1537;">${body.size}</td></tr>
          </table>
          <p style="color:#555;font-size:12px;margin-top:12px;">Update the ORS Transact record once availability is confirmed.</p>
        </div>
      </div>`
    );

    return NextResponse.json({ success: true, id: body.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
