
import { NextResponse } from 'next/server';
import warehouses from '@/data/warehouses.json';

export async function GET() {
  return NextResponse.json(warehouses);
}
