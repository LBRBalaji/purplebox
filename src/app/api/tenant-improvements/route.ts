
import { NextResponse } from 'next/server';
import tenantImprovements from '@/data/tenant-improvements.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/tenant-improvements.json');

export async function GET() {
  return NextResponse.json(tenantImprovements);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Tenant improvements updated successfully' });
    } catch (error) {
        console.error('Failed to write tenant improvements data:', error);
        return NextResponse.json({ message: 'Failed to update tenant improvements' }, { status: 500 });
    }
}
