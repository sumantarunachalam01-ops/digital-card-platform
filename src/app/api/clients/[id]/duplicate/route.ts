import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: Context) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const original = await prisma.client.findUnique({
      where: { id },
    });

    if (!original) {
      return NextResponse.json({ error: 'Original client not found' }, { status: 404 });
    }

    const rawSlug = body.newSlug || `${original.slug}-copy`;
    const newSlug = rawSlug.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

    // Check if newSlug is taken
    const existing = await prisma.client.findUnique({
      where: { slug: newSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Slug "${newSlug}" is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    // Duplicate client record
    const duplicated = await prisma.client.create({
      data: {
        slug: newSlug,
        fullName: `${original.fullName} (Copy)`,
        designation: original.designation,
        companyName: original.companyName,
        bio: original.bio,
        profilePhoto: original.profilePhoto,
        companyLogo: original.companyLogo,
        phone: original.phone,
        whatsapp: original.whatsapp,
        email: original.email,
        website: original.website,
        address: original.address,
        googleMapsUrl: original.googleMapsUrl,
        instagram: original.instagram,
        facebook: original.facebook,
        linkedin: original.linkedin,
        youtube: original.youtube,
        twitter: original.twitter,
        companyDescription: original.companyDescription,
        businessCategory: original.businessCategory,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, client: duplicated });
  } catch (error) {
    console.error('Duplicate client error:', error);
    return NextResponse.json({ error: 'Failed to duplicate client' }, { status: 500 });
  }
}
