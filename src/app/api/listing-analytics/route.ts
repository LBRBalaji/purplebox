
import { NextResponse } from 'next/server';
import analytics from '@/data/listing-analytics.json';

export async function GET() {
  return NextResponse.json(analytics);
}
