
import { NextResponse } from 'next/server';
import chatMessages from '@/data/chat-messages.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/chat-messages.json');

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
  return NextResponse.json(chatMessages, { headers });
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Chat messages updated successfully' }, { headers });
    } catch (error) {
        console.error('Failed to write chat messages data:', error);
        return NextResponse.json({ message: 'Failed to update chat messages' }, { status: 500, headers });
    }
}
