
import { NextResponse } from 'next/server';
import registeredLeads from '@/data/registered-leads.json';

export async function GET() {
  return NextResponse.json(registeredLeads);
}
