
import { NextResponse } from 'next/server';
import listings from '@/data/listings.json';

export async function GET() {
  return NextResponse.json(listings);
}
