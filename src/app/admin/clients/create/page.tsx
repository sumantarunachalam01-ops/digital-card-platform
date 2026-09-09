'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import ClientForm from '@/components/admin/ClientForm';
import LivePreviewFrame from '@/components/admin/LivePreviewFrame';
import { useToast } from '@/components/ui/Toast';
import { ClientData } from '@/types';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateClientPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Live state that syncs form to live preview
  const [liveData, setLiveData] = useState<ClientData>({
    slug: 'new.card',
    fullName: 'Alex Morgan',
    designation: 'Vice President of Growth',
    companyName: 'Apex Innovations',
    bio: 'Guiding global enterprise partnerships, cross-border digital transformations, and scalable business strategy with precision and vision.',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    companyLogo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80',
    coverPhotos: '[]',
    phone: '+1 (555) 924-8172',
    whatsapp: '+15559248172',
    email: 'alex.morgan@apexinnovate.com',
    website: 'https://apexinnovate-demo.com',
    address: 'One World Trade Center, 42nd Floor, New York, NY 10007',
    googleMapsUrl: 'https://maps.google.com/?q=One+World+Trade+Center+New+York',
    instagram: 'https://instagram.com/alex_growth',
    linkedin: 'https://linkedin.com/in/alex-morgan-apex',
    twitter: 'https://twitter.com/alex_apex',
    companyDescription: 'Next-generation digital transformation and enterprise investment consultancy.',
    businessCategory: 'Strategic Advisory & Venture',
    status: 'ACTIVE',
  });

  const handleFormChange = useCallback((updated: ClientData) => {
    setLiveData(updated);
  }, []);

  const handleCreateSubmit = async (data: ClientData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        showToast('Digital card created successfully!');
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore confetti error if canvas not available
        }
        router.push('/admin/clients');
      } else {
        showToast(resData.error || 'Failed to create digital card', 'error');
      }
    } catch {
      showToast('Network error while saving card', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar title="Create Digital Card Studio" />

      <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Breadcrumb & Intro Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/clients"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                <span>Create Digital Visiting Card</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/80 font-normal">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Configure client information on the left; see the identical centralized card update in real-time on the right.
              </p>
            </div>
          </div>
        </div>

        {/* Split Screen Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE: Client Form (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ClientForm
              initialData={liveData}
              onChange={handleFormChange}
              onSubmit={handleCreateSubmit}
              loading={loading}
            />
          </div>

          {/* RIGHT SIDE: Live Digital Card Preview (5 Columns) */}
          <div className="lg:col-span-5 sticky top-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
            <LivePreviewFrame client={liveData} />
          </div>
        </div>
      </div>
    </div>
  );
}
