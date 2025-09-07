
import { NextResponse } from 'next/server';
import analytics from '@/data/listing-analytics.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/listing-analytics.json');


export async function GET() {
  return NextResponse.json(analytics);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Analytics updated successfully' });
    } catch (error) {
        console.error('Failed to write analytics data:', error);
        return NextResponse.json({ message: 'Failed to update analytics' }, { status: 500 });
    }
}
