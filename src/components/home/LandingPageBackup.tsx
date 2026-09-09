import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wifi,
  QrCode,
  Smartphone,
  ExternalLink,
  Lock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default async function LandingPageBackup() {
  const clients = await prisma.client.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return (
    <div className="min-h-screen bg-[#111317] text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-700 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting - soft, harmonious, low contrast */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-zinc-700/10 via-zinc-800/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-zinc-800/10 blur-3xl pointer-events-none" />

      {/* Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-zinc-300" />
          </div>
          <span className="text-base font-bold text-zinc-200 tracking-tight">DigitalCard</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Admin Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center z-10 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-xs font-medium text-zinc-300 mb-6 shadow-xs">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>NFC Card & Digital Business Card Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-zinc-100 tracking-tight leading-[1.15] max-w-3xl">
          One Centralized Template.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400">
            Infinite Digital Cards.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed font-normal">
          The refined enterprise platform for physical NFC visiting cards and permanent QR profiles. Update client contacts anytime without breaking printed codes or reprogrammed NFC chips.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
          >
            <span>Enter Admin Studio</span>
            <ArrowRight className="w-4 h-4 text-zinc-800" />
          </Link>

          <Link
            href="/arun.kumar"
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold active:scale-95 transition-all"
          >
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>Sample Card: Arun Kumar</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </Link>
        </div>

        {/* Live Seeded Cards Gallery */}
        <div className="mt-16 w-full text-left">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-200">Live Centralized Digital Cards</h2>
              <p className="text-xs text-zinc-400">
                All client profiles dynamically render from the single centralized <code className="text-zinc-300 font-mono">/[slug]</code> template
              </p>
            </div>
            <Link
              href="/admin/clients"
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              <span>Manage in Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/${client.slug}`}
                target="_blank"
                className="p-4 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850/80 border border-zinc-800/90 hover:border-zinc-700 transition-all flex items-center gap-3.5 group shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60 group-hover:border-zinc-600 transition-colors">
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
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors truncate">
                    {client.fullName}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">{client.designation}</div>
                  <div className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 mt-0.5">
                    /{client.slug}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-3 border border-zinc-700/60">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200 mb-1">One Centralized Template</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              No individual static pages. Every URL loads dynamically from the database through the same high-performance component.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-3 border border-zinc-700/60">
              <Wifi className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200 mb-1">Permanent NFC Payload</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Updating client phone, company, or socials never changes the URL. Physical NFC cards and printed QRs work forever.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-3 border border-zinc-700/60">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200 mb-1">Instant QR & vCard (.vcf)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Automatic vector SVG and high-res PNG generation, plus RFC 3.0 vCard download for 1-tap contact saving to iOS & Android.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500 z-10">
        <p>© 2026 DigitalCard Management Platform • Designed for NFC Business Cards</p>
      </footer>
    </div>
  );
}
