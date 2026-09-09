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

    // 1. If Vercel Blob Storage is connected (BLOB_READ_WRITE_TOKEN configured in Vercel)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const originalExt = path.extname(file.name) || '.jpg';
        const safeName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${originalExt}`;
        const blob = await put(safeName, file, {
          access: 'public',
        });
        return NextResponse.json({
          success: true,
          url: blob.url,
        });
      } catch (blobErr) {
        console.warn('Vercel Blob upload failed, falling back to Data URL:', blobErr);
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. On Vercel / Serverless (where filesystem is read-only), return optimized Data URL
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
      });
    }

    // 3. Local disk storage (for local development on your machine)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const originalExt = path.extname(file.name) || '.jpg';
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${originalExt}`;
      const filePath = path.join(uploadsDir, safeName);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${safeName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
      });
    } catch (fsErr) {
      console.warn('Local disk write failed, falling back to Data URL:', fsErr);
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
