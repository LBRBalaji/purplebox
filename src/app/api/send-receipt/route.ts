import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const { developerEmail, developerName, developerCompany, prospectCompany, listingId, listingLocation, amount, receiptId, confirmedAt } = await req.json();
    const date = new Date(confirmedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [developerEmail],
        subject: 'ORS-ONE Payment Receipt — ' + receiptId,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f4f6f9;border-radius:12px;">
          <div style="background:hsl(259,25%,11%);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;">ORS-ONE</h1>
            <p style="color:#9b7ee0;margin:6px 0 0;font-size:12px;">Building Transaction Ready Assets</p>
          </div>
          <div style="background:#ffffff;padding:28px;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
              <h2 style="color:#6141ac;font-size:18px;margin:0;">Payment Receipt</h2>
              <span style="background:#e8f5e9;color:#2e7d32;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:20px;">CONFIRMED</span>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px 0;color:#888;font-size:13px;">Receipt No.</td>
                <td style="padding:10px 0;font-weight:bold;font-size:13px;text-align:right;">${receiptId}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px 0;color:#888;font-size:13px;">Date</td>
                <td style="padding:10px 0;font-size:13px;text-align:right;">${date}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px 0;color:#888;font-size:13px;">Billed To</td>
                <td style="padding:10px 0;font-size:13px;text-align:right;">${developerCompany || developerName}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px 0;color:#888;font-size:13px;">Service</td>
                <td style="padding:10px 0;font-size:13px;text-align:right;">Pay For Purpose — Prospect Connection</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px 0;color:#888;font-size:13px;">Listing</td>
                <td style="padding:10px 0;font-size:13px;text-align:right;">${listingId} · ${listingLocation}</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px 0;color:#888;font-size:13px;">Prospect Industry</td>
                <td style="padding:10px 0;font-size:13px;text-align:right;">${prospectCompany}</td>
              </tr>
              <tr>
                <td style="padding:16px 0 8px;color:#1a1a1a;font-size:15px;font-weight:bold;">Amount Paid</td>
                <td style="padding:16px 0 8px;font-size:20px;font-weight:900;color:#6141ac;text-align:right;">${amount}</td>
              </tr>
            </table>
            <div style="background:#f4f6f9;border-radius:8px;padding:14px;font-size:12px;color:#888;text-align:center;">
              This is a computer-generated receipt. For queries, contact balaji@lakshmibalajio2o.com
            </div>
          </div>
          <p style="color:#6B7E92;font-size:11px;text-align:center;margin-top:16px;">Lakshmi Balaji ORS Private Limited · ORS-ONE</p>
        </div>`,
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}