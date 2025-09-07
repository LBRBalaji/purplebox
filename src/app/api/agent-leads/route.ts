
import { NextResponse } from 'next/server';
import agentLeads from '@/data/agent-leads.json';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/agent-leads.json');

export async function GET() {
  return NextResponse.json(agentLeads);
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
        return NextResponse.json({ message: 'Agent leads updated successfully' });
    } catch (error) {
        console.error('Failed to write agent leads data:', error);
        return NextResponse.json({ message: 'Failed to update agent leads' }, { status: 500 });
    }
}
