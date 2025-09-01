
import { NextResponse } from 'next/server';
import agentLeads from '@/data/agent-leads.json';

export async function GET() {
  return NextResponse.json(agentLeads);
}
