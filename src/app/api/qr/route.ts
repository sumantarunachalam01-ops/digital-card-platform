import { NextResponse } from 'next/server';
import { generateQrPngDataUrl, generateQrSvgString } from '@/lib/qr';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
    }

    const [png, svg] = await Promise.all([
      generateQrPngDataUrl(url),
      generateQrSvgString(url),
    ]);

    return NextResponse.json({
      url,
      png,
      svg,
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
