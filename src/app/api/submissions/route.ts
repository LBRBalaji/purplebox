
import { NextResponse } from 'next/server';
import submissions from '@/data/submissions.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/submissions.json');

export async function GET() {
  return NextResponse.json(submissions);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Submissions updated successfully' });
    } catch (error) {
        console.error('Failed to write submissions data:', error);
        return NextResponse.json({ message: 'Failed to update submissions' }, { status: 500 });
    }
}
