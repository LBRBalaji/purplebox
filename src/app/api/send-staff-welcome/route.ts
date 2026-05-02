import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const { email, userName, staffRole, password, privileges } = await req.json();
    if (!email || !userName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const hasPrivilege = (id: string) => (privileges || []).includes(id);
    const canCreateListings = hasPrivilege('create_listings');

    const workflowSection = canCreateListings ? `
      <div style="background:#f8f6ff;border:1px solid #e0d8f8;border-radius:12px;padding:24px;margin:20px 0;">
        <h3 style="color:#6141ac;font-size:16px;font-weight:900;margin:0 0 16px;">Your Assigned Work: Create New Listings</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${[
            ['Step 1', 'Login', 'Go to <a href="https://lakshmibalajio2o.com" style="color:#6141ac;">orsone.app</a> and sign in with your email and temporary password.'],
            ['Step 2', 'Your Dashboard', 'You will land on your Staff Dashboard. Click the <strong>+ Create New Listing</strong> button at the top right.'],
            ['Step 3', 'Select Developer', 'A form will open. At the top select the developer from the dropdown (e.g. Ejaz Nathani — Welspun One).'],
            ['Step 4', 'Fill the Listing', 'Complete all listing details — location, size, specifications, photos, certifications and commercial terms. Be thorough.'],
            ['Step 5', 'Submit', 'Click Submit. The listing is saved as a <strong>Draft</strong> — it is not published yet.'],
            ['Step 6', 'SuperAdmin Reviews', 'The SuperAdmin reviews your draft and either approves it or sends it back for changes.'],
            ['Step 7', 'Developer Consent', 'Once approved, the developer receives a notification to review and authorise the listing for publication.'],
            ['Step 8', 'Goes Live', 'After developer consent, the listing enters the final approval queue and goes live on the platform.'],
          ].map(([step, title, desc]) => `
            <tr>
              <td style="width:70px;padding:10px 12px 10px 0;vertical-align:top;">
                <div style="background:#6141ac;color:#fff;font-size:10px;font-weight:900;padding:4px 10px;border-radius:20px;text-align:center;white-space:nowrap;">${step}</div>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e0d8f8;vertical-align:top;">
                <div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:2px;">${title}</div>
                <div style="font-size:12px;color:#666;line-height:1.6;">${desc}</div>
              </td>
            </tr>`).join('')}
        </table>
        <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:14px;margin-top:16px;">
          <p style="font-size:12px;color:#7a5c00;margin:0;line-height:1.6;">
            <strong>Important:</strong> You can only create draft listings — not approve or publish them.
            Always double-check specifications with the developer before submitting.
          </p>
        </div>
      </div>` : '';

    const privilegesList = (privileges || []).map((p: string) => {
      const labels: Record<string,string> = {
        create_listings: 'Create Listings (Draft)',
        edit_listings: 'Edit Listings',
        view_all_listings: 'View All Listings',
        approve_users: 'Approve / Reject Users',
        view_payments: 'View Payment Requests',
        confirm_payments: 'Confirm Payments',
        view_leads: 'View All Leads',
        view_demands: 'View All Demands',
        view_analytics: 'View Analytics',
        data_governance: 'Data Governance Tools',
        manage_users_readonly: 'View Users (Read Only)',
      };
      return `<span style="display:inline-block;background:#ede9fb;color:#6141ac;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin:3px 4px 3px 0;border:1px solid #c5b8e8;">${labels[p] || p}</span>`;
    }).join('');

    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f4f6f9;border-radius:12px;">
      <div style="background:hsl(259,25%,11%);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;font-family:Georgia,serif;">ORS<span style="color:#9b7ee0;">-ONE</span></h1>
        <p style="color:#9b7ee0;margin:6px 0 0;font-size:12px;">Building Transaction Ready Assets</p>
      </div>
      <div style="background:#ffffff;padding:28px;border-radius:8px;">
        <h2 style="color:#6141ac;font-size:18px;margin-bottom:6px;">Welcome to ORS-ONE, ${userName}!</h2>
        <p style="color:#555;font-size:13px;line-height:1.6;margin-bottom:20px;">Your internal staff account has been created and activated. You are now part of the ORS-ONE team.</p>

        <div style="background:#f8f6ff;border:1px solid #e0d8f8;border-radius:10px;padding:18px;margin-bottom:20px;">
          <p style="font-size:11px;font-weight:700;color:#9b7ee0;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;">Login Credentials</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Platform</td><td style="padding:6px 0;font-size:13px;"><a href="https://lakshmibalajio2o.com" style="color:#6141ac;font-weight:700;">orsone.app</a></td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#1a1a1a;">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:13px;">Temporary Password</td><td style="padding:6px 0;font-size:15px;font-weight:900;color:#6141ac;letter-spacing:2px;">${password}</td></tr>
            <tr><td style="padding:6px 0;color:#888;font-size:13px;">Your Role</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#1a1a1a;">${staffRole}</td></tr>
          </table>
          <p style="font-size:11px;color:#999;margin:12px 0 0;">Please change your password after first login via Settings → Change Password.</p>
        </div>

        <div style="margin-bottom:20px;">
          <p style="font-size:11px;font-weight:700;color:#9b7ee0;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px;">Your Assigned Privileges</p>
          <div>${privilegesList || '<span style="font-size:12px;color:#999;">No privileges assigned yet. Contact SuperAdmin.</span>'}</div>
        </div>

        ${workflowSection}

        <div style="text-align:center;margin:24px 0 16px;">
          <a href="https://lakshmibalajio2o.com" style="background:#6141ac;color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Login to ORS-ONE</a>
        </div>

        <div style="background:#f4f6f9;border-radius:8px;padding:14px;font-size:12px;color:#888;text-align:center;">
          For any queries contact <a href="mailto:balaji@lakshmibalajio2o.com" style="color:#6141ac;">balaji@lakshmibalajio2o.com</a> or +91 98410 98170
        </div>
      </div>
      <p style="color:#6B7E92;font-size:11px;text-align:center;margin-top:16px;">Lakshmi Balaji ORS Private Limited · ORS-ONE · orsone.app</p>
    </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: 'ORS-ONE <noreply@lakshmibalajio2o.com>',
        to: [email],
        subject: 'Welcome to ORS-ONE — Your Staff Account is Ready',
        html,
      }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}