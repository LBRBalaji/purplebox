
import { NextResponse } from 'next/server';
import submissions from '@/data/submissions.json';

export async function GET() {
  return NextResponse.json(submissions);
}
