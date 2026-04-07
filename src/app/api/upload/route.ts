import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getAccessToken(): Promise<string> {
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/devstorage.read_write'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token as string;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file received.' }, { status: 400 });
    }

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return NextResponse.json({ success: false, error: `"${file.name}" is ${sizeMB}MB. Maximum is 20MB. Please compress and retry.` }, { status: 413 });
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return NextResponse.json({ success: false, error: 'Storage not configured. Contact platform admin.' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `listings/${Date.now()}-${sanitized}`;

    let accessToken: string;
    try {
      accessToken = await getAccessToken();
    } catch (e: any) {
      console.error('Auth error:', e);
      return NextResponse.json({ success: false, error: `Authentication failed: ${e.message}` }, { status: 500 });
    }

    const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucketName)}/o?uploadType=media&name=${encodeURIComponent(filename)}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': String(bytes.byteLength),
      },
      body: bytes,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('GCS upload error:', errText);
      return NextResponse.json({ success: false, error: `Storage upload failed (${uploadRes.status}): ${errText.substring(0, 200)}` }, { status: 500 });
    }

    // Make public
    const aclUrl = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(filename)}/acl`;
    await fetch(aclUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity: 'allUsers', role: 'READER' }),
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed. Please try again.' }, { status: 500 });
  }
}
