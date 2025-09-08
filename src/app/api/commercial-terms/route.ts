
import { NextResponse } from 'next/server';
import commercialTerms from '@/data/commercial-terms.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/commercial-terms.json');

export async function GET() {
  return NextResponse.json(commercialTerms);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Commercial terms updated successfully' });
    } catch (error) {
        console.error('Failed to write commercial terms data:', error);
        return NextResponse.json({ message: 'Failed to update commercial terms' }, { status: 500 });
    }
}
