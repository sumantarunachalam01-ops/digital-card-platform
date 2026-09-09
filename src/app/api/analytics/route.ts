import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const baseWhere: any = {};
    if (clientId) {
      baseWhere.clientId = clientId;
    }

    const [totalViews, viewsToday, viewsThisWeek, viewsThisMonth, allViews] = await Promise.all([
      prisma.profileAnalytics.count({ where: baseWhere }),
      prisma.profileAnalytics.count({
        where: { ...baseWhere, viewedAt: { gte: startOfToday } },
      }),
      prisma.profileAnalytics.count({
        where: { ...baseWhere, viewedAt: { gte: sevenDaysAgo } },
      }),
      prisma.profileAnalytics.count({
        where: { ...baseWhere, viewedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.profileAnalytics.findMany({
        where: baseWhere,
        select: {
          deviceType: true,
          viewedAt: true,
        },
        take: 1000,
      }),
    ]);

    // Device breakdown
    const devices = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };

    allViews.forEach((v) => {
      const dt = (v.deviceType || '').toLowerCase();
      if (dt.includes('mobile')) devices.mobile++;
      else if (dt.includes('tablet')) devices.tablet++;
      else devices.desktop++;
    });

    // Per-client statistics if querying global analytics
    let clientStats: any[] = [];
    if (!clientId) {
      const clients = await prisma.client.findMany({
        select: {
          id: true,
          slug: true,
          fullName: true,
          companyName: true,
          status: true,
          _count: {
            select: { analytics: true },
          },
        },
        orderBy: {
          analytics: {
            _count: 'desc',
          },
        },
        take: 10,
      });

      clientStats = clients.map((c) => ({
        id: c.id,
        slug: c.slug,
        fullName: c.fullName,
        companyName: c.companyName,
        status: c.status,
        views: c._count.analytics,
      }));
    }

    return NextResponse.json({
      totalViews,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      devices,
      clientStats,
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics' }, { status: 500 });
  }
}
