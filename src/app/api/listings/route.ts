
import { NextResponse } from 'next/server';
import listings from '@/data/listings.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/listings.json');

export async function GET() {
  return NextResponse.json(listings);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Listings updated successfully' });
    } catch (error) {
        console.error('Failed to write listings data:', error);
        return NextResponse.json({ message: 'Failed to update listings' }, { status: 500 });
    }
}
