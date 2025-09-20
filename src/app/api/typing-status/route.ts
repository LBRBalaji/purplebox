
import { NextResponse } from 'next/server';
import typingStatus from '@/data/typing-status.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/typing-status.json');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return NextResponse.json(JSON.parse(data), { headers });
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty object
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({}, { headers });
    }
    console.error('Failed to read typing status data:', error);
    return NextResponse.json({ message: 'Failed to read typing status' }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Typing status updated successfully' }, { headers });
    } catch (error) {
        console.error('Failed to write typing status data:', error);
        return NextResponse.json({ message: 'Failed to update typing status' }, { status: 500, headers });
    }
}
