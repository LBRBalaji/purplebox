import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { inviteeName, inviteeEmail, inviteeRole, initiatorName, initiatorRole, propertyBrief, dealId, magicLink } = await req.json();
    if (!inviteeEmail || !magicLink) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const roleLabel = inviteeRole === 'Developer' ? 'Property Developer' : inviteeRole === 'Agent' ? 'Transaction Agent' : 'Customer';
    const initiatorRoleLabel = initiatorRole === 'Developer' ? 'Property Developer' : initiatorRole === 'Agent' ? 'Agent' : 'Customer';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE Transactions <noreply@lakshmibalajio2o.com>',
        to: [inviteeEmail],
        subject: `${initiatorName} has invited you to collaborate on a transaction — ORS-ONE`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f4f2fb;border-radius:12px;">
  <div style="background:linear-gradient(135deg,#1e1537,#3b2870);padding:24px;border-radius:10px;text-align:center;margin-bottom:24px;">
    <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.3px">ORS-ONE</h1>
    <p style="color:#9b7ee0;margin:6px 0 0;font-size:12px;">Building Transaction Ready Assets</p>
  </div>
  <div style="background:#fff;padding:28px;border-radius:10px;border:1px solid #e8e2f5;">
    <h2 style="color:#1e1537;font-size:17px;margin:0 0 12px;">Hello ${inviteeName || 'there'},</h2>
    <p style="color:#555;font-size:14px;line-height:1.7;margin-bottom:16px;">
      <strong style="color:#1e1537">${initiatorName}</strong> (${initiatorRoleLabel}) has registered a commercial property transaction on ORS-ONE and invited you as <strong>${roleLabel}</strong> to collaborate.
    </p>
    <div style="background:#f4f2fb;border:1px solid #d4c8f0;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:#6141ac;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;margin:0 0 8px;">Property Brief</p>
      <p style="color:#1e1537;font-size:14px;font-weight:600;margin:0 0 4px;">${propertyBrief || 'Commercial Warehouse Transaction'}</p>
      <p style="color:#888;font-size:12px;margin:0;">Deal ID: ${dealId}</p>
    </div>
    <p style="color:#555;font-size:13px;line-height:1.7;margin-bottom:20px;">
      You can view and edit the Commercial Term Sheet, track the transaction, and collaborate — all within ORS-ONE's secure transaction platform. No account needed to access the workspace.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${magicLink}" style="background:#6141ac;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
        Open Transaction Workspace →
      </a>
    </div>
    <div style="border-top:1px solid #e8e2f5;padding-top:16px;margin-top:8px;">
      <p style="color:#aaa;font-size:11px;text-align:center;margin:0;">
        To download the Term Sheet or Draft MoU, you will need to create a free ORS-ONE account.<br/>
        Your edits and activity are already saved against your invite link.
      </p>
    </div>
  </div>
  <p style="color:#bbb;font-size:11px;text-align:center;margin-top:16px;">Lakshmi Balaji ORS Private Limited · orsone.app</p>
</div>`,
      }),
    });

    if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Deal invite email error:', e);
    return NextResponse.json({ error: e.message || 'Email failed' }, { status: 500 });
  }
}
