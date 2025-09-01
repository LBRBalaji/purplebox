
import { NextResponse } from 'next/server';
import demands from '@/data/demands.json';

export async function GET() {
  return NextResponse.json(demands);
}
