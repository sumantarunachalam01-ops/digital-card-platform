import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. If Vercel Blob Storage is connected (BLOB_READ_WRITE_TOKEN configured)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const originalExt = path.extname(file.name) || '.jpg';
      const safeName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${originalExt}`;
      const blob = await put(safeName, file, {
        access: 'public',
      });
      return NextResponse.json({
        success: true,
        url: blob.url,
      });
    }

    // 2. Local fallback storage (for local development)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Clean file extension and create unique filename
    const originalExt = path.extname(file.name) || '.jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${originalExt}`;
    const filePath = path.join(uploadsDir, safeName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
