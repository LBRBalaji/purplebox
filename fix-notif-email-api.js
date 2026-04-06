const fs = require('fs');
const content = `import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const { email, userName, title, message, href } = await req.json();
    if (!email || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const link = href ? 'https://lease.orsone.app' + href : 'https://lease.orsone.app/dashboard';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [email],
        subject: 'ORS-ONE: ' + title,
        html: '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f4f6f9;border-radius:12px;"><div style="background:hsl(259,25%,11%);padding:20px;border-radius:8px;text-align:center;margin-bottom:24px;"><h1 style="color:#ffffff;margin:0;font-size:22px;">ORS-ONE</h1><p style="color:#9b7ee0;margin:6px 0 0;font-size:12px;">Building Transaction Ready Assets</p></div><div style="background:#ffffff;padding:24px;border-radius:8px;"><h2 style="color:#6141ac;font-size:17px;margin-bottom:10px;">' + title + '</h2><p style="color:#1A2B3C;font-size:14px;line-height:1.6;margin-bottom:20px;">' + (message || '') + '</p><div style="text-align:center;margin:20px 0;"><a href="' + link + '" style="background:#6141ac;color:#ffffff;padding:10px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">View on ORS-ONE</a></div><p style="color:#888;font-size:12px;text-align:center;margin-top:16px;">You are receiving this because you enabled email notifications. You can turn this off in your Settings.</p></div><p style="color:#6B7E92;font-size:11px;text-align:center;margin-top:16px;">ORS-ONE — lease.orsone.app</p></div>',
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`;
fs.writeFileSync('src/app/api/send-notification-email/route.ts', content);
console.log('Done!');
