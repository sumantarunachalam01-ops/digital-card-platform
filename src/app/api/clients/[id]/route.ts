import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

// GET single client
export async function GET(request: Request, context: Context) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { analytics: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    return NextResponse.json({ error: 'Failed to retrieve client' }, { status: 500 });
  }
}

// PUT update client
export async function PUT(request: Request, context: Context) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check slug uniqueness if slug is being changed
    let updatedSlug = existing.slug;
    if (body.slug && body.slug.trim().toLowerCase() !== existing.slug) {
      const cleanSlug = body.slug.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
      const slugClash = await prisma.client.findUnique({
        where: { slug: cleanSlug },
      });
      if (slugClash && slugClash.id !== id) {
        return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
      }
      updatedSlug = cleanSlug;
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        slug: updatedSlug,
        fullName: body.fullName?.trim() || existing.fullName,
        designation: body.designation?.trim() || existing.designation,
        companyName: body.companyName?.trim() || existing.companyName,
        bio: body.bio !== undefined ? body.bio : existing.bio,
        profilePhoto: body.profilePhoto !== undefined ? body.profilePhoto : existing.profilePhoto,
        companyLogo: body.companyLogo !== undefined ? body.companyLogo : existing.companyLogo,
        coverPhotos: body.coverPhotos !== undefined ? (typeof body.coverPhotos === 'object' ? JSON.stringify(body.coverPhotos) : body.coverPhotos) : existing.coverPhotos,
        phone: body.phone !== undefined ? body.phone : existing.phone,
        whatsapp: body.whatsapp !== undefined ? body.whatsapp : existing.whatsapp,
        email: body.email !== undefined ? body.email : existing.email,
        website: body.website !== undefined ? body.website : existing.website,
        address: body.address !== undefined ? body.address : existing.address,
        googleMapsUrl: body.googleMapsUrl !== undefined ? body.googleMapsUrl : existing.googleMapsUrl,
        instagram: body.instagram !== undefined ? body.instagram : existing.instagram,
        facebook: body.facebook !== undefined ? body.facebook : existing.facebook,
        linkedin: body.linkedin !== undefined ? body.linkedin : existing.linkedin,
        youtube: body.youtube !== undefined ? body.youtube : existing.youtube,
        twitter: body.twitter !== undefined ? body.twitter : existing.twitter,
        companyDescription: body.companyDescription !== undefined ? body.companyDescription : existing.companyDescription,
        businessCategory: body.businessCategory !== undefined ? body.businessCategory : existing.businessCategory,
        customLinks: body.customLinks !== undefined ? (typeof body.customLinks === 'object' ? JSON.stringify(body.customLinks) : body.customLinks) : existing.customLinks,
        status: body.status !== undefined ? (body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') : existing.status,
      },
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE client
export async function DELETE(request: Request, context: Context) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
