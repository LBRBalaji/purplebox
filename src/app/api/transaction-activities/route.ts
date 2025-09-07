
import { NextResponse } from 'next/server';
import activities from '@/data/transaction-activities.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/transaction-activities.json');

export async function GET() {
  return NextResponse.json(activities);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Transaction activities updated successfully' });
    } catch (error) {
        console.error('Failed to write transaction activities data:', error);
        return NextResponse.json({ message: 'Failed to update transaction activities' }, { status: 500 });
    }
}
