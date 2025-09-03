
import { NextResponse } from 'next/server';
import tenantImprovements from '@/data/tenant-improvements.json';

export async function GET() {
  return NextResponse.json(tenantImprovements);
}
