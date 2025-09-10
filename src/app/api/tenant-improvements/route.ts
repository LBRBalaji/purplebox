
import { NextResponse } from 'next/server';
import tenantImprovements from '@/data/tenant-improvements.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/tenant-improvements.json');

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
  return NextResponse.json(tenantImprovements, { headers });
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Tenant improvements updated successfully' }, { headers });
    } catch (error) {
        console.error('Failed to write tenant improvements data:', error);
        return NextResponse.json({ message: 'Failed to update tenant improvements' }, { status: 500, headers });
    }
}
