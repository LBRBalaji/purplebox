import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

function getStorageBucket() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('Storage bucket not configured. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET env var is missing.');
  }

  // Use a dedicated app instance for storage to avoid bucket conflicts
  const appName = 'upload-app';
  let app: admin.app.App;
  try {
    app = admin.app(appName);
  } catch {
    app = admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: bucketName,
      },
      appName
    );
  }
  return admin.storage(app).bucket(bucketName);
}

export async function POST(request: NextRequest) {
  try {
    let data: FormData;
    try {
      data = await request.formData();
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: `Could not read uploaded file: ${e.message}. Try a smaller file or a different format.` },
        { status: 400 }
      );
    }

    const file = data.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file received. Please select a file and try again.' }, { status: 400 });
    }

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `File "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed is 20MB. Please compress the file and retry.` },
        { status: 413 }
      );
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf'];
    if (!allowed.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { success: false, error: `File type "${file.type}" is not supported. Please upload images (JPG, PNG, WEBP), videos (MP4), or PDF files.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let bucket;
    try {
      bucket = getStorageBucket();
    } catch (e: any) {
      console.error('Storage init error:', e);
      return NextResponse.json(
        { success: false, error: `Storage not ready: ${e.message}` },
        { status: 500 }
      );
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `listings/${Date.now()}-${sanitizedName}`;
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: any) {
    console.error('Upload error:', error);
    const msg = error.code === 'storage/unauthorized'
      ? 'Storage permission denied. Please contact support.'
      : error.message || 'Upload failed. Please try again.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
