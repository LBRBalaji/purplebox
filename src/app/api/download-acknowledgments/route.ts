
import { NextResponse } from 'next/server';
import acknowledgments from '@/data/download-acknowledgments.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/download-acknowledgments.json');

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
  return NextResponse.json(acknowledgments, { headers });
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Acknowledgments updated successfully' }, { headers });
    } catch (error) {
        console.error('Failed to write acknowledgments data:', error);
        return NextResponse.json({ message: 'Failed to update acknowledgments' }, { status: 500, headers });
    }
}
