import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, reset code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();
    const now = new Date();
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 1. Check AdminUser
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (admin) {
      if (
        admin.resetToken === cleanCode &&
        admin.resetTokenExpiry &&
        admin.resetTokenExpiry > now
      ) {
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: {
            passwordHash: newPasswordHash,
            resetToken: null,
            resetTokenExpiry: null,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Password reset successfully. You can now sign in.',
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired reset code.' },
          { status: 400 }
        );
      }
    }

    // 2. Check Client
    const client = await prisma.client.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
    });

    if (client) {
      if (
        client.resetToken === cleanCode &&
        client.resetTokenExpiry &&
        client.resetTokenExpiry > now
      ) {
        await prisma.client.update({
          where: { id: client.id },
          data: {
            passwordHash: newPasswordHash,
            resetToken: null,
            resetTokenExpiry: null,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Password reset successfully. You can now sign in.',
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired reset code.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Account not found.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
