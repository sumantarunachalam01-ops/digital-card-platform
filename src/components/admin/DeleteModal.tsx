'use client';

import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { ClientData } from '@/types';

interface DeleteModalProps {
  client: ClientData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function DeleteModal({
  client,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteModalProps) {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">Delete Digital Visiting Card</h3>
        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
          Are you sure you want to permanently delete the digital card for{' '}
          <span className="font-semibold text-zinc-200">{client.fullName}</span> (
          <span className="font-mono text-zinc-300">/{client.slug}</span>)?
        </p>

        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6 text-xs text-rose-300">
          This action is permanent. Any physical NFC cards or printed QR codes pointing to this URL will immediately stop loading client data.
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
