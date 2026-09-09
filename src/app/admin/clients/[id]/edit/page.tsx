'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import ClientForm from '@/components/admin/ClientForm';
import LivePreviewFrame from '@/components/admin/LivePreviewFrame';
import { useToast } from '@/components/ui/Toast';
import { ClientData } from '@/types';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EditClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  const router = useRouter();
  const { showToast } = useToast();

  const [client, setClient] = useState<ClientData | null>(null);
  const [liveData, setLiveData] = useState<ClientData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        const data = await res.json();
        if (res.ok && data.client) {
          setClient(data.client);
          setLiveData(data.client);
        } else {
          showToast('Client not found', 'error');
        }
      } catch (err) {
        console.error('Error loading client:', err);
        showToast('Error loading client details', 'error');
      } finally {
        setFetching(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleFormChange = useCallback((updated: ClientData) => {
    setLiveData(updated);
  }, []);

  const handleEditSubmit = async (data: ClientData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        showToast('Profile updated successfully.');
        router.push('/admin/clients');
      } else {
        showToast(resData.error || 'Failed to update client', 'error');
      }
    } catch {
      showToast('Network error while updating card', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar title="Edit Digital Card Studio" />

      <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Header Breadcrumbs */}
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
                <span>Edit Digital Visiting Card</span>
                {client && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/80 font-mono">
                    /{client.slug}
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                Updating contact, company, or social details preserves the permanent URL for physical NFC cards.
              </p>
            </div>
          </div>
        </div>

        {/* Loading or Error */}
        {fetching ? (
          <div className="p-16 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
            <span className="text-xs">Loading client information...</span>
          </div>
        ) : !client || !liveData ? (
          <div className="p-12 text-center text-rose-400 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">Client could not be found or has been removed.</p>
            <Link href="/admin/clients" className="text-xs text-zinc-300 underline mt-2">
              Return to clients list
            </Link>
          </div>
        ) : (
          /* Split Screen Studio Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT SIDE: Form */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <ClientForm
                initialData={client}
                isEditing={true}
                clientId={clientId}
                onChange={handleFormChange}
                onSubmit={handleEditSubmit}
                loading={saving}
              />
            </div>

            {/* RIGHT SIDE: Live Preview */}
            <div className="lg:col-span-5 sticky top-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
              <LivePreviewFrame client={liveData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
