import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const { agentEmail, agentName, inviteCode, customerName, leadId, expiry } = await req.json();
    if (!agentEmail || !inviteCode) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const expiryDate = new Date(expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [agentEmail],
        subject: 'You have been invited to join ORS-ONE as an Agent',
        html: '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f4f6f9;border-radius:12px;"><div style="background:hsl(259,25%,11%);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;"><h1 style="color:#ffffff;margin:0;font-size:24px;">ORS-ONE</h1><p style="color:#9b7ee0;margin:8px 0 0;font-size:13px;">Building Transaction Ready Assets</p></div><div style="background:#ffffff;padding:24px;border-radius:8px;"><h2 style="color:#6141ac;font-size:18px;margin-bottom:12px;">Hello ' + (agentName || 'there') + ',</h2><p style="color:#1A2B3C;font-size:14px;line-height:1.6;margin-bottom:16px;"><strong>' + (customerName || 'A client') + '</strong> has invited you to represent them on ORS-ONE for a warehouse transaction.</p><div style="background:#f4f6f9;border:2px dashed #6141ac;border-radius:8px;padding:20px;margin:16px 0;text-align:center;"><p style="color:#6141ac;font-size:13px;font-weight:bold;margin:0 0 8px;">Your Agent Invite Code</p><span style="font-size:28px;font-weight:900;letter-spacing:6px;color:#3C3489;">' + inviteCode + '</span><p style="color:#888;font-size:12px;margin:8px 0 0;">Valid until ' + expiryDate + '</p></div><p style="color:#1A2B3C;font-size:13px;line-height:1.6;">To get started:<br/>1. Visit <a href="https://orsone.app/signup" style="color:#6141ac;">orsone.app/signup</a><br/>2. Select Agent as your role<br/>3. Enter your invite code: <strong>' + inviteCode + '</strong><br/>4. Complete your registration</p><div style="text-align:center;margin:24px 0;"><a href="https://orsone.app/signup" style="background:#6141ac;color:#ffffff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px;">Register as Agent</a></div></div><p style="color:#6B7E92;font-size:11px;text-align:center;margin-top:16px;">ORS-ONE — orsone.app</p></div>',
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to send email'); }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Agent invite error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send invite' }, { status: 500 });
  }
}