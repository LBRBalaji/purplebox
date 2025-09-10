
import { NextResponse } from 'next/server';
import commercialTerms from '@/data/commercial-terms.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/commercial-terms.json');

// Set up CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET() {
  return NextResponse.json(commercialTerms, { headers });
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Commercial terms updated successfully' }, { headers });
    } catch (error) {
        console.error('Failed to write commercial terms data:', error);
        return NextResponse.json({ message: 'Failed to update commercial terms' }, { status: 500, headers });
    }
}
