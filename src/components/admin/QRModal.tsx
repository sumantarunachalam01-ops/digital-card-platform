'use client';

import React, { useEffect, useState } from 'react';
import { ClientData } from '@/types';
import { X, Download, Copy, Check, QrCode, Wifi, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface QRModalProps {
  client: ClientData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRModal({ client, isOpen, onClose }: QRModalProps) {
  const { showToast } = useToast();
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedNfc, setCopiedNfc] = useState(false);

  // Compute profile URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const profileUrl = client ? `${origin}/${client.slug}` : '';

  useEffect(() => {
    if (!isOpen || !client) return;

    const fetchQr = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/qr?url=${encodeURIComponent(profileUrl)}`);
        const data = await res.json();
        if (data.png) setPngDataUrl(data.png);
        if (data.svg) setSvgString(data.svg);
      } catch (err) {
        console.error('Error fetching QR:', err);
        showToast('Failed to generate QR code', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, [isOpen, client, profileUrl]);

  if (!isOpen || !client) return null;

  // Copy Profile URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedUrl(true);
      showToast('Permanent profile URL copied!');
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      showToast('Could not copy URL', 'error');
    }
  };

  // Copy NFC Payload
  const handleCopyNfc = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedNfc(true);
      showToast('NFC write payload URL copied to clipboard!');
      setTimeout(() => setCopiedNfc(false), 2500);
    } catch {
      showToast('Could not copy NFC payload', 'error');
    }
  };

  // Download PNG
  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    const link = document.createElement('a');
    link.href = pngDataUrl;
    link.download = `${client.slug}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR code PNG downloaded successfully');
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${client.slug}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Vector QR code SVG downloaded');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700/80 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">QR Code & NFC Payload</h3>
            <p className="text-xs text-zinc-400">
              For {client.fullName} ({client.companyName})
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-2xl border border-zinc-800/80 mb-5 relative">
          {loading ? (
            <div className="w-48 h-48 flex flex-col items-center justify-center text-zinc-500 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
              <span className="text-xs">Generating QR...</span>
            </div>
          ) : pngDataUrl ? (
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              <img
                src={pngDataUrl}
                alt={`QR code for ${client.fullName}`}
                className="w-48 h-48 object-contain"
              />
            </div>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-rose-400 text-xs">
              Failed to load QR
            </div>
          )}

          {/* Permanent URL reminder */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-zinc-300 font-mono bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 truncate max-w-xs sm:max-w-sm">
              {profileUrl}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Encodes URL ONLY. Updating client info in dashboard never breaks this QR.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleDownloadPng}
            disabled={!pngDataUrl}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-zinc-800" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            disabled={!svgString}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 disabled:opacity-50 border border-zinc-700/80 text-zinc-200 hover:text-white text-xs font-semibold active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download SVG</span>
          </button>
        </div>

        {/* NFC Card Payload Helper */}
        <div className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>NFC Card Programmer Payload</span>
            </div>
            <button
              onClick={handleCopyNfc}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-all"
            >
              {copiedNfc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNfc ? 'Copied' : 'Copy for NFC'}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Write this URL to any standard NTAG213/215/216 physical NFC chip using NFC Tools or equivalent card encoder software.
          </p>
        </div>

        {/* Copy Profile Link & Open Link */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-800/80">
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'URL Copied' : 'Copy Profile URL'}</span>
          </button>

          <a
            href={`/${client.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <span>Open Public Card</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
