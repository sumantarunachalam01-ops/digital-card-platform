import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, context: Context) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const newStatus = body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const client = await prisma.client.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, slug: true, status: true },
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
