import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userEmail, userName, downloadCount, shortlistUrl } = await req.json();
    if (!userEmail) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const firstName = userName?.split(' ')[0] || 'there';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [userEmail],
        subject: `You downloaded ${downloadCount} warehouse listing${downloadCount > 1 ? 's' : ''} — ready to request quotes?`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f4f2fb;">
  <div style="background:linear-gradient(135deg,#1e1537,#3b2870);padding:24px;text-align:center;margin-bottom:24px;">
    <h1 style="color:#fff;margin:0;font-size:20px;">ORS-ONE</h1>
    <p style="color:#9b7ee0;margin:6px 0 0;font-size:12px;">Building Transaction Ready Assets</p>
  </div>
  <div style="background:#fff;padding:28px;border:1px solid #e8e2f5;">
    <h2 style="color:#1e1537;font-size:16px;margin:0 0 12px;">Hello ${firstName},</h2>
    <p style="color:#555;font-size:14px;line-height:1.7;margin-bottom:16px;">
      You recently downloaded <strong>${downloadCount} warehouse listing${downloadCount > 1 ? 's' : ''}</strong> on ORS-ONE but haven't sent a Request for Quote yet.
    </p>
    <p style="color:#555;font-size:14px;line-height:1.7;margin-bottom:20px;">
      Sending a Request for Quote takes one click — the developer receives your request and responds with current rent, deposit and lease terms directly in your Transaction Workspace.
    </p>
    <div style="background:#f4f2fb;border:1px solid #d4c8f0;padding:16px;margin:16px 0;">
      <p style="color:#6141ac;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin:0 0 6px;">Your shortlist is ready</p>
      <p style="color:#555;font-size:13px;margin:0;">Select listings individually or all at once — each developer is notified separately and does not see your other requests.</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${shortlistUrl}" style="background:#6141ac;color:#fff;padding:14px 36px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
        View My Shortlist & Request Quotes →
      </a>
    </div>
    <p style="color:#aaa;font-size:11px;text-align:center;margin:0;">No cost to you. Brokerage is always on the developer's side.</p>
  </div>
  <p style="color:#bbb;font-size:11px;text-align:center;margin-top:16px;">Lakshmi Balaji ORS Private Limited · lease.orsone.app</p>
</div>`,
      }),
    });

    if (!res.ok) throw new Error('Email failed');
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('RFQ reminder email error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
