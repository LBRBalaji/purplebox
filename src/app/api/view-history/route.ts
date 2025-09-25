
// This is a new file

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/view-history.json');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return new NextResponse('[]', { status: 200, headers });
    }
    const readStream = fs.createReadStream(dataFilePath, { encoding: 'utf8' });
    const webStream = new ReadableStream({
      start(controller) {
        readStream.on('data', (chunk) => controller.enqueue(chunk));
        readStream.on('end', () => controller.close());
        readStream.on('error', (err) => controller.error(err));
      },
    });
    return new NextResponse(webStream, { status: 200, headers });
  } catch (error) {
     console.error('Failed to read view history data:', error);
     return NextResponse.json({ message: 'Failed to read view history' }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'View history updated successfully' }, { headers });
    } catch (error) {
        console.error('Failed to write view history data:', error);
        return NextResponse.json({ message: 'Failed to update view history' }, { status: 500, headers });
    }
}
