
import { NextResponse } from 'next/server';
import activities from '@/data/transaction-activities.json';

export async function GET() {
  return NextResponse.json(activities);
}
