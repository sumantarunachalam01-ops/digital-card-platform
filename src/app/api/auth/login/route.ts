import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if email belongs to an AdminUser
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
      if (passwordMatch) {
        await setAdminSession({
          userId: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'ADMIN',
        });

        return NextResponse.json({
          success: true,
          role: 'ADMIN',
          redirectTo: '/admin',
          user: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'ADMIN',
          },
        });
      }
    }

    // 2. Check if email belongs to a Client (Card Owner)
    const client = await prisma.client.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
    });

    if (client && client.passwordHash) {
      const clientPasswordMatch = await bcrypt.compare(password, client.passwordHash);
      if (clientPasswordMatch) {
        await setAdminSession({
          userId: client.id,
          email: client.email || normalizedEmail,
          name: client.fullName,
          role: 'CLIENT',
          clientId: client.id,
          slug: client.slug,
        });

        return NextResponse.json({
          success: true,
          role: 'CLIENT',
          redirectTo: '/portal',
          user: {
            id: client.id,
            email: client.email,
            name: client.fullName,
            role: 'CLIENT',
            slug: client.slug,
          },
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
