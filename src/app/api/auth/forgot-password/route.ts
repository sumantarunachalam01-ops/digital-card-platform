import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 1. Check if AdminUser
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (admin) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          resetToken: resetCode,
          resetTokenExpiry: resetExpiry,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset code generated.',
        code: resetCode, // Provided so user is never blocked by SMTP configuration
      });
    }

    // 2. Check if Client
    const client = await prisma.client.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
    });

    if (client) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          resetToken: resetCode,
          resetTokenExpiry: resetExpiry,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset code generated.',
        code: resetCode,
      });
    }

    // Generic response if not found (security practice) or helpful feedback
    return NextResponse.json(
      { error: 'No account found with this email address.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
