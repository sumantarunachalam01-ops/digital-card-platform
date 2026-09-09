import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    });

    return NextResponse.json({
      settings: settings || { brandName: 'DigitalCard', supportEmail: 'admin@digitalcard.com' },
    });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // 1. Update platform settings
    if (body.brandName) {
      await prisma.platformSettings.upsert({
        where: { id: 'default' },
        update: {
          brandName: body.brandName.trim(),
          supportEmail: body.supportEmail?.trim() || null,
        },
        create: {
          id: 'default',
          brandName: body.brandName.trim(),
          supportEmail: body.supportEmail?.trim() || null,
        },
      });
    }

    // 2. Update password if requested
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }
      const newHash = await bcrypt.hash(body.newPassword, 10);
      await prisma.adminUser.update({
        where: { id: admin.userId },
        data: { passwordHash: newHash },
      });
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
