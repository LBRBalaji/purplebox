const fs = require('fs');
const content = `import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const { email, userName } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [email],
        subject: 'Your ORS-ONE Account is Now Active',
        html: '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f4f6f9;border-radius:12px;"><div style="background:hsl(259,25%,11%);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;"><h1 style="color:#ffffff;margin:0;font-size:24px;">ORS-ONE</h1><p style="color:#9b7ee0;margin:8px 0 0;font-size:13px;">Building Transaction Ready Assets</p></div><div style="background:#ffffff;padding:24px;border-radius:8px;"><h2 style="color:#6141ac;font-size:20px;margin-bottom:12px;">Welcome, ' + (userName || 'there') + '!</h2><p style="color:#1A2B3C;font-size:15px;line-height:1.6;margin-bottom:16px;">Your ORS-ONE account has been verified and is now active. You can now log in and start exploring warehouse listings across India.</p><div style="text-align:center;margin:24px 0;"><a href="https://lease.orsone.app" style="background:#6141ac;color:#ffffff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">Login to ORS-ONE</a></div><p style="color:#6B7E92;font-size:13px;line-height:1.6;">If you have any questions, feel free to reach out to our team.</p></div><p style="color:#6B7E92;font-size:11px;text-align:center;margin-top:16px;">ORS-ONE — lease.orsone.app</p></div>',
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to send email'); }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Approval email error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}`;
fs.writeFileSync('src/app/api/send-approval-email/route.ts', content);
console.log('Done!');
