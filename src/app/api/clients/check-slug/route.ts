import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get('slug') || '';
  const excludeId = searchParams.get('excludeId') || '';

  // Clean slug format
  const slug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

  if (!slug) {
    return NextResponse.json({ available: false, message: 'Slug cannot be empty.' });
  }

  // Reserved slugs that clash with system routes
  const reserved = ['admin', 'api', 'login', 'dashboard', 'settings', 'clients', 'profile'];
  if (reserved.includes(slug)) {
    return NextResponse.json({
      available: false,
      message: 'This slug is reserved for system routes.',
    });
  }

  const existing = await prisma.client.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing && existing.id !== excludeId) {
    return NextResponse.json({
      available: false,
      message: 'Username already taken.',
    });
  }

  return NextResponse.json({
    available: true,
    message: 'Username available.',
    slug,
  });
}
