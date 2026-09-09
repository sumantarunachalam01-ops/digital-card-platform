import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

// GET all clients
export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const status = searchParams.get('status')?.toUpperCase() || '';

    // Build Prisma query filter
    const where: any = {};

    if (status === 'ACTIVE' || status === 'INACTIVE') {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { companyName: { contains: q } },
        { designation: { contains: q } },
        { slug: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { analytics: true },
        },
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Fetch clients error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve clients.' },
      { status: 500 }
    );
  }
}

// POST create client
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Required fields check
    if (!body.fullName?.trim() || !body.slug?.trim()) {
      return NextResponse.json(
        { error: 'Full name and unique profile slug are required.' },
        { status: 400 }
      );
    }

    // Clean and validate slug
    const cleanSlug = body.slug.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

    // Check slug uniqueness
    const existing = await prisma.client.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username already taken.' },
        { status: 409 }
      );
    }

    const newClient = await prisma.client.create({
      data: {
        slug: cleanSlug,
        fullName: body.fullName.trim(),
        designation: body.designation?.trim() || 'Professional',
        companyName: body.companyName?.trim() || 'Enterprise',
        bio: body.bio?.trim() || null,
        profilePhoto: body.profilePhoto?.trim() || null,
        companyLogo: body.companyLogo?.trim() || null,
        coverPhotos: typeof body.coverPhotos === 'object' ? JSON.stringify(body.coverPhotos) : (body.coverPhotos || null),
        phone: body.phone?.trim() || null,
        whatsapp: body.whatsapp?.trim() || null,
        email: body.email?.trim() || null,
        website: body.website?.trim() || null,
        address: body.address?.trim() || null,
        googleMapsUrl: body.googleMapsUrl?.trim() || null,
        instagram: body.instagram?.trim() || null,
        facebook: body.facebook?.trim() || null,
        linkedin: body.linkedin?.trim() || null,
        youtube: body.youtube?.trim() || null,
        twitter: body.twitter?.trim() || null,
        companyDescription: body.companyDescription?.trim() || null,
        businessCategory: body.businessCategory?.trim() || null,
        customLinks: typeof body.customLinks === 'object' ? JSON.stringify(body.customLinks) : (body.customLinks || null),
        status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: 'Failed to create client card.' },
      { status: 500 }
    );
  }
}
