import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import DigitalCard from '@/components/card/DigitalCard';
import { headers } from 'next/headers';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { ClientData } from '@/types';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const client = await prisma.client.findUnique({
    where: { slug },
  });

  if (!client || client.status !== 'ACTIVE') {
    return {
      title: 'Digital Visiting Card | DigitalCard',
      description: 'NFC-enabled dynamic digital business card.',
    };
  }

  const title = `${client.fullName} | ${client.designation || 'Business Card'} | ${client.companyName || 'DigitalCard'}`;
  const description = client.bio || `Official digital visiting card of ${client.fullName}, ${client.designation} at ${client.companyName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: client.profilePhoto ? [client.profilePhoto] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: client.profilePhoto ? [client.profilePhoto] : [],
    },
  };
}

export default async function ClientProfilePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Retrieve client from database
  const client = await prisma.client.findUnique({
    where: { slug },
  });

  // 2. Error handling: Nonexistent card
  if (!client) {
    return (
      <div className="min-h-screen bg-[#07080B] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#0F1218] rounded-3xl border border-white/10 shadow-2xl p-8 max-w-sm w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Digital Card Not Found</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The requested digital business card (<span className="text-white font-mono font-medium">/{slug}</span>) does not exist or may have been moved.
          </p>
        </div>
      </div>
    );
  }

  // 3. Status handling: Inactive card
  if (client.status === 'INACTIVE') {
    return (
      <div className="min-h-screen bg-[#07080B] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#0F1218] rounded-3xl border border-white/10 shadow-2xl p-8 max-w-sm w-full flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Card Currently Unavailable</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            This digital business card is temporarily inactive. Please contact the card owner directly or try again later.
          </p>
        </div>
      </div>
    );
  }

  // 4. Log privacy-conscious view analytics
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || 'direct';

    let deviceType = 'Desktop';
    if (/android|iphone|ipod|mobile/i.test(userAgent)) {
      deviceType = 'Mobile';
    } else if (/ipad|tablet/i.test(userAgent)) {
      deviceType = 'Tablet';
    }

    await prisma.profileAnalytics.create({
      data: {
        clientId: client.id,
        deviceType,
        referrer: referrer.substring(0, 150),
      },
    });
  } catch (error) {
    // Non-blocking analytics logging
    console.error('Analytics log error:', error);
  }

  // 5. Render Centralized Digital Visiting Card Component
  return <DigitalCard client={client as unknown as ClientData} />;
}
