import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { stakeholderName, stakeholderEmail, roleDescription, inviterName, inviterRole, dealId, propertyBrief, viewUrl } = await req.json();
    if (!stakeholderEmail || !viewUrl) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE Transactions <noreply@lakshmibalajio2o.com>',
        to: [stakeholderEmail],
        subject: `You have been invited to view a Commercial Term Sheet — ORS-ONE`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f4f2fb;">
  <div style="background:linear-gradient(135deg,#1e1537,#3b2870);padding:24px;text-align:center;margin-bottom:24px;">
    <h1 style="color:#fff;margin:0;font-size:20px;">ORS-ONE</h1>
    <p style="color:#9b7ee0;margin:6px 0 0;font-size:12px;">Building Transaction Ready Assets</p>
  </div>
  <div style="background:#fff;padding:28px;border:1px solid #e8e2f5;">
    <h2 style="color:#1e1537;font-size:16px;margin:0 0 12px;">Hello ${stakeholderName || 'there'},</h2>
    <p style="color:#555;font-size:14px;line-height:1.7;margin-bottom:16px;">
      <strong style="color:#1e1537">${inviterName}</strong> (${inviterRole}) has invited you as <strong>${roleDescription || 'Stakeholder'}</strong> to view the Commercial Term Sheet for a property transaction on ORS-ONE.
    </p>
    <div style="background:#f4f2fb;border:1px solid #d4c8f0;padding:16px;margin:16px 0;">
      <p style="color:#6141ac;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin:0 0 6px;">Transaction</p>
      <p style="color:#1e1537;font-size:14px;font-weight:600;margin:0 0 4px;">${propertyBrief || 'Commercial Warehouse Transaction'}</p>
      <p style="color:#888;font-size:12px;margin:0;">Deal ID: ${dealId}</p>
    </div>
    <div style="background:#fffbeb;border:1px solid #fde68a;padding:12px;margin:16px 0;">
      <p style="color:#92400e;font-size:12px;margin:0;font-weight:600;">Read-only access — for review and print only</p>
      <p style="color:#92400e;font-size:12px;margin:4px 0 0;">You can view and print the Term Sheet and MoU Draft. Editing is not permitted for stakeholders.</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${viewUrl}" style="background:#6141ac;color:#fff;padding:14px 36px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
        View Term Sheet →
      </a>
    </div>
    <p style="color:#aaa;font-size:11px;text-align:center;margin:0;">This link provides read-only access. The transaction is managed on the ORS-ONE platform.</p>
  </div>
  <p style="color:#bbb;font-size:11px;text-align:center;margin-top:16px;">Lakshmi Balaji ORS Private Limited · lease.orsone.app</p>
</div>`,
      }),
    });
    if (!res.ok) throw new Error('Email failed');
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Stakeholder invite error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
