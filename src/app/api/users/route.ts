
// This is a new file

import { NextResponse } from 'next/server';
import users from '@/data/users.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/users.json');

export async function GET() {
  return NextResponse.json(users);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Users updated successfully' });
    } catch (error) {
        console.error('Failed to write users data:', error);
        return NextResponse.json({ message: 'Failed to update users' }, { status: 500 });
    }
}
