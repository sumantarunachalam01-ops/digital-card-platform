import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getCurrentClient, getCurrentAdmin } from '@/lib/auth';

// GET logged-in client profile
export async function GET() {
  try {
    const clientSession = await getCurrentClient();
    if (!clientSession || !clientSession.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientSession.clientId },
      include: {
        _count: {
          select: { analytics: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // Do not return passwordHash or resetToken
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, resetToken, resetTokenExpiry, ...safeClient } = client;

    return NextResponse.json({ success: true, client: safeClient });
  } catch (error) {
    console.error('Portal profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update logged-in client profile
export async function PUT(request: Request) {
  try {
    const clientSession = await getCurrentClient();
    if (!clientSession || !clientSession.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      designation,
      companyName,
      bio,
      profilePhoto,
      companyLogo,
      coverPhotos,
      phone,
      whatsapp,
      email,
      website,
      address,
      googleMapsUrl,
      instagram,
      facebook,
      linkedin,
      youtube,
      twitter,
      companyDescription,
      businessCategory,
      customLinks,
      password,
    } = body;

    const updateData: Record<string, unknown> = {
      fullName,
      designation,
      companyName,
      bio: bio || null,
      profilePhoto: profilePhoto || null,
      companyLogo: companyLogo || null,
      coverPhotos: typeof coverPhotos === 'string' ? coverPhotos : JSON.stringify(coverPhotos || []),
      phone: phone || null,
      whatsapp: whatsapp || null,
      website: website || null,
      address: address || null,
      googleMapsUrl: googleMapsUrl || null,
      instagram: instagram || null,
      facebook: facebook || null,
      linkedin: linkedin || null,
      youtube: youtube || null,
      twitter: twitter || null,
      companyDescription: companyDescription || null,
      businessCategory: businessCategory || null,
      customLinks: typeof customLinks === 'string' ? customLinks : JSON.stringify(customLinks || []),
    };

    if (email) {
      updateData.email = email.toLowerCase().trim();
    }

    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.client.update({
      where: { id: clientSession.clientId },
      data: updateData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, resetToken, resetTokenExpiry, ...safeClient } = updated;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      client: safeClient,
    });
  } catch (error) {
    console.error('Portal profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
