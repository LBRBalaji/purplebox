import { NextRequest, NextResponse } from 'next/server';

const KV_URL = process.env.KV_REST_API_URL || process.env.BLOB_READ_WRITE_TOKEN ? null : null;

// Store invite tokens in the registered-leads API data
// Token → { leadId, inviteeEmail, inviteeRole, createdAt }
// We persist these alongside registered leads in a separate key

async function getInvites() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://orsone.app'}/api/registered-leads`);
    // We store invites embedded in the leads themselves — just verify token
    return {};
  } catch { return {}; }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  try {
    // Fetch all leads and find the one with this token
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://orsone.app'}/api/registered-leads`);
    const leads = await res.json();
    const leadsArr = Array.isArray(leads) ? leads : Object.values(leads);
    
    const lead = leadsArr.find((l: any) =>
      l.invitees?.some((inv: any) => inv.token === token)
    );
    
    if (!lead) return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 404 });
    
    const invitee = lead.invitees.find((inv: any) => inv.token === token);
    
    // Update lastAccessedAt
    invitee.lastAccessedAt = new Date().toISOString();
    const updatedLeads = leadsArr.map((l: any) => l.id === lead.id ? lead : l);
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://orsone.app'}/api/registered-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLeads),
    });
    
    return NextResponse.json({ 
      leadId: lead.id, 
      invitee, 
      lead: { ...lead, invitees: undefined } // don't expose all tokens
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Mark invitee as registered
  const { token, registered } = await req.json();
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://orsone.app'}/api/registered-leads`);
    const leads = await res.json();
    const leadsArr = Array.isArray(leads) ? leads : Object.values(leads);
    
    const lead = leadsArr.find((l: any) => l.invitees?.some((inv: any) => inv.token === token));
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    lead.invitees = lead.invitees.map((inv: any) =>
      inv.token === token ? { ...inv, registered: true } : inv
    );
    
    const updatedLeads = leadsArr.map((l: any) => l.id === lead.id ? lead : l);
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://orsone.app'}/api/registered-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLeads),
    });
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
