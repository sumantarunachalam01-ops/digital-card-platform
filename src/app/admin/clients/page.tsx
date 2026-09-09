'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminTopBar from '@/components/admin/AdminTopBar';
import QRModal from '@/components/admin/QRModal';
import DeleteModal from '@/components/admin/DeleteModal';
import { useToast } from '@/components/ui/Toast';
import { ClientData } from '@/types';
import {
  Search,
  Plus,
  QrCode,
  Edit,
  ExternalLink,
  Copy,
  Trash2,
  CopyPlus,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
} from 'lucide-react';

export default function ClientsManagementPage() {
  const { showToast } = useToast();

  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals
  const [selectedForQr, setSelectedForQr] = useState<ClientData | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<ClientData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Duplication Modal state
  const [duplicateClient, setDuplicateClient] = useState<ClientData | null>(null);
  const [newDuplicateSlug, setNewDuplicateSlug] = useState('');
  const [duplicateLoading, setDuplicateLoading] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      let url = '/api/clients';
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('Fetch clients error:', err);
      showToast('Error loading clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toggle active/inactive
  const handleToggleStatus = async (client: ClientData) => {
    const nextStatus = client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/clients/${client.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(`${client.fullName} is now ${nextStatus.toLowerCase()}`);
        fetchClients();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  // Copy URL
  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    showToast(`Copied profile link: ${url}`);
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!selectedForDelete?.id) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/clients/${selectedForDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Digital card deleted successfully');
        setSelectedForDelete(null);
        fetchClients();
      } else {
        showToast('Failed to delete digital card', 'error');
      }
    } catch {
      showToast('Error deleting card', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open Duplicate Dialog
  const handleOpenDuplicate = (client: ClientData) => {
    setDuplicateClient(client);
    setNewDuplicateSlug(`${client.slug}-copy`);
  };

  // Execute Duplicate
  const handleExecuteDuplicate = async () => {
    if (!duplicateClient?.id || !newDuplicateSlug.trim()) return;
    setDuplicateLoading(true);
    try {
      const res = await fetch(`/api/clients/${duplicateClient.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newSlug: newDuplicateSlug.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Client duplicated as /${data.client.slug}`);
        setDuplicateClient(null);
        fetchClients();
      } else {
        showToast(data.error || 'Failed to duplicate client', 'error');
      }
    } catch {
      showToast('Error duplicating client', 'error');
    } finally {
      setDuplicateLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar title="Client Management" />

      <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Header with Search and Create button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              All Digital Visiting Cards
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Manage client details, activate/deactivate cards, export QR codes, and copy permanent URLs.
            </p>
          </div>

          <Link
            href="/admin/clients/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-zinc-800" />
            <span>Create Digital Card</span>
          </Link>
        </div>

        {/* Filter Bar: Search + Status Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, or slug..."
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs text-zinc-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Filter:
            </span>
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-xs'
                    : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Table Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Client Profile</th>
                  <th className="py-3.5 px-4">Designation & Company</th>
                  <th className="py-3.5 px-4">Permanent Profile URL</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                      Loading clients from database...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No matching clients found. Try adjusting your search or filter.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => {
                    const formattedDate = client.createdAt
                      ? new Date(client.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—';

                    return (
                      <tr key={client.id} className="hover:bg-slate-850/40 transition-colors">
                        {/* Profile Photo & Name */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                              {client.profilePhoto ? (
                                <img
                                  src={client.profilePhoto}
                                  alt={client.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                                  {client.fullName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{client.fullName}</div>
                              <div className="text-[11px] text-slate-400">{client.email || 'No email provided'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Designation & Company */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-zinc-200">{client.designation}</div>
                          <div className="text-[11px] text-zinc-400">{client.companyName}</div>
                        </td>

                        {/* Unique Profile URL */}
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-300 font-semibold">/{client.slug}</span>
                            <button
                              onClick={() => handleCopyUrl(client.slug)}
                              title="Copy Full URL"
                              className="p-1 text-zinc-500 hover:text-zinc-300"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Status Toggle */}
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

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-zinc-400">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        {/* Views */}
                        <td className="py-3.5 px-4 font-semibold text-zinc-200">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-zinc-400" />
                            <span>{client._count?.analytics || 0}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Public Card */}
                            <Link
                              href={`/${client.slug}`}
                              target="_blank"
                              title="Open Public Card"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* QR Code */}
                            <button
                              onClick={() => setSelectedForQr(client)}
                              title="Generate / Download QR Code"
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

                            {/* Duplicate */}
                            <button
                              onClick={() => handleOpenDuplicate(client)}
                              title="Duplicate Client"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <CopyPlus className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setSelectedForDelete(client)}
                              title="Delete Client"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <QRModal
        isOpen={Boolean(selectedForQr)}
        client={selectedForQr}
        onClose={() => setSelectedForQr(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(selectedForDelete)}
        client={selectedForDelete}
        loading={deleteLoading}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Duplicate Dialog Modal */}
      {duplicateClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <h3 className="text-lg font-bold text-white mb-2">Duplicate Client Card</h3>
            <p className="text-xs text-slate-400 mb-4">
              Clone information from <span className="text-slate-200 font-semibold">{duplicateClient.fullName}</span>. Please assign a new unique slug.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Unique Profile Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-xl text-xs font-mono">
                  /
                </span>
                <input
                  type="text"
                  value={newDuplicateSlug}
                  onChange={(e) => setNewDuplicateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                  placeholder="e.g. raghupathy.g88"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDuplicateClient(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-750"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDuplicate}
                disabled={duplicateLoading || !newDuplicateSlug.trim()}
                className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-50 text-xs font-semibold shadow-sm"
              >
                {duplicateLoading ? 'Duplicating...' : 'Confirm & Clone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
