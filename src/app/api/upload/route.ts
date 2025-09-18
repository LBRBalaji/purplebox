// src/app/api/upload/route.ts
import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define the path to the uploads directory within the public folder
  const uploadsDir = path.join(process.cwd(), 'public/uploads');

  try {
    // Ensure the uploads directory exists
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    return NextResponse.json({ success: false, error: 'Could not create uploads directory' }, { status: 500 });
  }
  
  // Create a unique filename
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const filePath = path.join(uploadsDir, filename);

  try {
    await writeFile(filePath, buffer);
    // The URL should be a public path that Next.js can serve
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file' }, { status: 500 });
  }
}
