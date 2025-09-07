
import { NextResponse } from 'next/server';
import demands from '@/data/demands.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/demands.json');

export async function GET() {
  return NextResponse.json(demands);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Demands updated successfully' });
    } catch (error) {
        console.error('Failed to write demands data:', error);
        return NextResponse.json({ message: 'Failed to update demands' }, { status: 500 });
    }
}
