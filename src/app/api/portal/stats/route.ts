import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentClient } from '@/lib/auth';

export async function GET() {
  try {
    const clientSession = await getCurrentClient();
    if (!clientSession || !clientSession.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = clientSession.clientId;

    const totalViews = await prisma.profileAnalytics.count({
      where: { clientId },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const viewsToday = await prisma.profileAnalytics.count({
      where: {
        clientId,
        viewedAt: { gte: startOfToday },
      },
    });

    const viewsThisWeek = await prisma.profileAnalytics.count({
      where: {
        clientId,
        viewedAt: { gte: sevenDaysAgo },
      },
    });

    const devices = await prisma.profileAnalytics.groupBy({
      by: ['deviceType'],
      where: { clientId },
      _count: { deviceType: true },
    });

    let mobileCount = 0;
    let desktopCount = 0;
    let tabletCount = 0;

    devices.forEach((d) => {
      const type = (d.deviceType || '').toLowerCase();
      if (type.includes('mobile')) mobileCount += d._count.deviceType;
      else if (type.includes('desktop')) desktopCount += d._count.deviceType;
      else if (type.includes('tablet')) tabletCount += d._count.deviceType;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalViews,
        viewsToday,
        viewsThisWeek,
        devices: {
          mobile: mobileCount,
          desktop: desktopCount,
          tablet: tabletCount,
        },
      },
    });
  } catch (error) {
    console.error('Portal stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
