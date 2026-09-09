'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import QRModal from '@/components/admin/QRModal';
import DeleteModal from '@/components/admin/DeleteModal';
import { useToast } from '@/components/ui/Toast';
import { ClientData } from '@/types';
import {
  Users,
  CreditCard,
  Eye,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  QrCode,
  Edit,
  ExternalLink,
  Copy,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCards: 0,
    inactiveCards: 0,
    totalViews: 0,
  });
  const [recentClients, setRecentClients] = useState<ClientData[]>([]);

  // Modals state
  const [selectedClientForQr, setSelectedClientForQr] = useState<ClientData | null>(null);
  const [selectedClientForDelete, setSelectedClientForDelete] = useState<ClientData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Verify auth
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authData.authenticated) {
        router.replace('/admin/login');
        return;
      }

      // 2. Fetch clients
      const clientsRes = await fetch('/api/clients');
      const clientsData = await clientsRes.json();
      const clients: ClientData[] = clientsData.clients || [];

      // 3. Fetch analytics
      const analyticsRes = await fetch('/api/analytics');
      const analyticsData = await analyticsRes.json();

      const active = clients.filter((c) => c.status === 'ACTIVE').length;
      const inactive = clients.filter((c) => c.status === 'INACTIVE').length;

      setStats({
        totalClients: clients.length,
        activeCards: active,
        inactiveCards: inactive,
        totalViews: analyticsData.totalViews || 0,
      });

      setRecentClients(clients.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard:', err);
      showToast('Error loading dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Toggle status
  const handleToggleStatus = async (client: ClientData) => {
    const nextStatus = client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/clients/${client.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(`Card for ${client.fullName} is now ${nextStatus.toLowerCase()}`);
        fetchDashboardData();
      } else {
        showToast('Failed to update card status', 'error');
      }
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  // Copy URL
  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    showToast(`Copied URL: ${url}`);
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!selectedClientForDelete?.id) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/clients/${selectedClientForDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Digital card deleted successfully');
        setSelectedClientForDelete(null);
        fetchDashboardData();
      } else {
        showToast('Failed to delete digital card', 'error');
      }
    } catch {
      showToast('Error deleting card', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar title="Platform Overview" />

      <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
        {/* Welcome & Quick Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/70 p-6 rounded-3xl border border-zinc-800/90">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              Centralized Architecture Active
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Digital Visiting Card & NFC Hub
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              All client profiles dynamically render through the single centralized <code className="text-zinc-300 font-mono">/[slug]</code> template. Permanent URLs remain stable for physical NFC cards.
            </p>
          </div>

          <Link
            href="/admin/clients/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-zinc-800" />
            <span>Create Digital Card</span>
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Clients */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Total Clients</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">
                {loading ? '...' : stats.totalClients}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">Registered visiting cards</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700/80 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Active Cards */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Active Cards</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
                {loading ? '...' : stats.activeCards}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">Publicly accessible</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Inactive Cards */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Inactive Cards</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">
                {loading ? '...' : stats.inactiveCards}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">Temporarily offline</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Total Profile Views */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Total Profile Views</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">
                {loading ? '...' : stats.totalViews}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">NFC taps & QR scans</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700/80 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recently Created Cards Table Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-100">Recently Created Cards</h3>
              <p className="text-xs text-zinc-400">Latest digital visiting cards deployed on the platform</p>
            </div>
            <Link
              href="/admin/clients"
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View All Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/60 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800/80">
                  <tr>
                    <th className="py-3.5 px-5">Client</th>
                    <th className="py-3.5 px-4">Designation & Company</th>
                    <th className="py-3.5 px-4">Permanent URL</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                        Loading recent cards...
                      </td>
                    </tr>
                  ) : recentClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No clients found. Click "Create Digital Card" to get started.
                      </td>
                    </tr>
                  ) : (
                    recentClients.map((client) => (
                      <tr key={client.id} className="hover:bg-zinc-850/40 transition-colors">
                        {/* Profile Photo & Name */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                              {client.profilePhoto ? (
                                <img
                                  src={client.profilePhoto}
                                  alt={client.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400">
                                  {client.fullName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-100">{client.fullName}</div>
                              <div className="text-[11px] text-zinc-400">{client.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Designation & Company */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-zinc-200">{client.designation}</div>
                          <div className="text-[11px] text-zinc-400">{client.companyName}</div>
                        </td>

                        {/* Permanent URL */}
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-300 font-semibold">/{client.slug}</span>
                            <button
                              onClick={() => handleCopyUrl(client.slug)}
                              title="Copy URL"
                              className="p-1 text-zinc-500 hover:text-zinc-300"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(client)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                              client.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                client.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                            />
                            <span>{client.status}</span>
                          </button>
                        </td>

                        {/* Views */}
                        <td className="py-3.5 px-4 font-semibold text-zinc-200">
                          {client._count?.analytics || 0}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Card */}
                            <Link
                              href={`/${client.slug}`}
                              target="_blank"
                              title="View Public Profile"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* QR Code */}
                            <button
                              onClick={() => setSelectedClientForQr(client)}
                              title="QR Code & NFC Payload"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/admin/clients/${client.id}/edit`}
                              title="Edit Client"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => setSelectedClientForDelete(client)}
                              title="Delete Client"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <QRModal
        isOpen={Boolean(selectedClientForQr)}
        client={selectedClientForQr}
        onClose={() => setSelectedClientForQr(null)}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={Boolean(selectedClientForDelete)}
        client={selectedClientForDelete}
        loading={deleteLoading}
        onClose={() => setSelectedClientForDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
