/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  Sparkles,
  Wifi,
  QrCode,
  Smartphone,
  ExternalLink,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  UserCheck,
  Layers,
  Zap,
  Globe,
  PhoneCall,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export const metadata = {
  title: 'DigitalCard | Next-Gen NFC Digital Visiting Cards',
  description:
    'The modern digital visiting card platform. Tap to connect with high-frequency NFC, save contacts in one click, and update your profile in real-time.',
};

export default async function HomePage() {
  const sampleClients = await prisma.client.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: {
      id: true,
      slug: true,
      fullName: true,
      designation: true,
      companyName: true,
      profilePhoto: true,
      businessCategory: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#07080B] text-slate-100 font-sans antialiased selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,119,198,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* ------------------------------------------------------------- */}
      {/* Sticky Navigation Bar */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#07080B]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-100 shadow-inner group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-zinc-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight">DigitalCard</span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                NFC & Digital Platform
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#nfc-tech" className="hover:text-white transition-colors">
              NFC Technology
            </a>
            <a href="#live-cards" className="hover:text-white transition-colors">
              Live Showcase
            </a>
          </nav>

          {/* Right Action: Unified Login Portal */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-lg active:scale-95 transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-black" />
              <span>Sign In / Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* Hero Section */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center flex flex-col items-center z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-zinc-300 mb-6 backdrop-blur-md shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium">The Next-Generation Visiting Card</span>
          <span className="text-white/20">•</span>
          <span className="text-zinc-400 font-mono text-[11px]">NFC + QR Enabled</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] max-w-4xl">
          One Tap to Connect.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-500">
            Never Run Out of Cards Again.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed font-normal">
          Hand over a physical card that wirelessly launches your digital profile with a signature
          animated greeting. Save contacts in 1 click, showcase portfolio galleries, and update details
          anytime from your personal portal.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/login"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-sm shadow-xl active:scale-95 transition-all"
          >
            <span>Login to Your Profile</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>

          <Link
            href="/sammple"
            target="_blank"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-zinc-200 hover:text-white font-semibold text-sm backdrop-blur-md active:scale-95 transition-all"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Experience Sample Card</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </Link>
        </div>

        {/* Visual Product Mockup Frame */}
        <div className="mt-16 w-full max-w-3xl rounded-3xl bg-[#0F1218]/90 border border-white/10 p-3 sm:p-5 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
          <div className="flex items-center justify-between pb-3 px-3 border-b border-white/[0.06] text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-400">
                https://digitalcard.com/sammple
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <Wifi className="w-3.5 h-3.5" />
              <span>NFC Active</span>
            </div>
          </div>

          {/* Interactive Screen Preview */}
          <div className="mt-4 rounded-2xl bg-[#07080B] p-6 sm:p-10 text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400 mb-2">
                Animated Tap Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-wider mb-2">
                Hello ➔ I&apos;m Sumant A
              </h2>
              <p className="text-xs text-zinc-400 max-w-md">
                Director at SEVEN STARS LOGISTICS • Seamlessly cross-dissolves into the digital card
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold shadow-md">
                  Save Contact (.vcf)
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  WhatsApp Direct
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs font-semibold">
                  Scan QR Fallback
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* How It Works Section */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Frictionless Connectivity
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
            How The NFC Card Works
          </h2>
          <p className="text-sm text-zinc-400 mt-3">
            No special apps required. Works instantly on any modern smartphone via wireless NFC or
            high-contrast QR code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Step 1 */}
          <div className="bg-[#0F1218]/80 border border-white/[0.08] rounded-3xl p-6 flex flex-col relative group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-4">
              <Wifi className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Step 01
            </span>
            <h3 className="text-base font-bold text-white mb-2">Tap Physical Card</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Tap your physical NFC business card against any smartphone. The embedded chip wirelessly
              triggers the browser URL in milliseconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0F1218]/80 border border-white/[0.08] rounded-3xl p-6 flex flex-col relative group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Step 02
            </span>
            <h3 className="text-base font-bold text-white mb-2">Signature Greeting</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              A cinematic fullscreen animation welcomes the recipient with &ldquo;Hello&rdquo; followed by
              &ldquo;I&apos;m [Your Name]&rdquo; before revealing your card.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0F1218]/80 border border-white/[0.08] rounded-3xl p-6 flex flex-col relative group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-4">
              <UserCheck className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Step 03
            </span>
            <h3 className="text-base font-bold text-white mb-2">1-Click Contact Save</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Recipients tap &ldquo;Save Contact&rdquo; to download your full vCard (.vcf) with phone,
              email, WhatsApp, and social links straight into their address book.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#0F1218]/80 border border-white/[0.08] rounded-3xl p-6 flex flex-col relative group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-4">
              <Sliders className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
              Step 04
            </span>
            <h3 className="text-base font-bold text-white mb-2">Update in Real-Time</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Got a new phone number or role? Sign into your user portal and update your profile
              instantly without ever reprinting your card!
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Key Features Section */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
            Engineered for Modern Professionals
          </h2>
          <p className="text-sm text-zinc-400 mt-3">
            Every feature designed to make networking elegant, memorable, and permanent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0F1218]/90 border border-white/[0.08] rounded-3xl p-7 flex flex-col">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-5">
              <QrCode className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">QR Code Fallback</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              In addition to NFC, every profile includes a permanent, high-contrast dynamic QR code.
              Download in PNG or SVG for print materials, resumes, or email signatures.
            </p>
          </div>

          <div className="bg-[#0F1218]/90 border border-white/[0.08] rounded-3xl p-7 flex flex-col">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-5">
              <Layers className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Work Showcase Slideshow</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Upload multiple banner and project showcase photos. Your card displays an automatic
              crossfade carousel with interactive slide counters and indicators.
            </p>
          </div>

          <div className="bg-[#0F1218]/90 border border-white/[0.08] rounded-3xl p-7 flex flex-col">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-5">
              <Zap className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Self-Service User Portal</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Card owners log in with their email to edit their bio, contact channels, social links,
              and passwords with a live mobile preview frame.
            </p>
          </div>

          <div className="bg-[#0F1218]/90 border border-white/[0.08] rounded-3xl p-7 flex flex-col">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Permanent NFC Verified</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Every card carries a cryptographic permanent NFC badge, assuring clients of your
              verified authenticity and direct connection.
            </p>
          </div>

          <div className="bg-[#0F1218]/90 border border-white/[0.08] rounded-3xl p-7 flex flex-col">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-5">
              <PhoneCall className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Channels</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Quick tap channels for direct phone calls, WhatsApp messages, emails, and office
              directions via Google Maps integration.
            </p>
          </div>

          <div className="bg-[#0F1218]/90 border border-white/[0.08] rounded-3xl p-7 flex flex-col">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-5">
              <Globe className="w-5 h-5 text-zinc-200" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Centralized Admin Oversight</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              As admin, manage all client accounts from the master studio: create cards, inspect views,
              update passwords, and manage platform settings.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Live Sample Cards Showcase */}
      {/* ------------------------------------------------------------- */}
      <section id="live-cards" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Live Profiles
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
              Sample Digital Visiting Cards
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Click any profile to test the public NFC greeting and live digital card experience
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <span>Login to Manage Your Card</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleClients.map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              target="_blank"
              className="bg-[#0F1218]/90 border border-white/[0.08] hover:border-white/20 rounded-3xl p-5 flex flex-col group transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full ring-2 ring-white/10 overflow-hidden bg-zinc-800 shrink-0">
                  {c.profilePhoto ? (
                    <img
                      src={c.profilePhoto}
                      alt={c.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-base">
                      {c.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {c.fullName}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">
                    /{c.slug}
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 font-medium truncate">
                {c.designation}
              </p>
              <p className="text-[11px] text-zinc-500 truncate mb-4">
                {c.companyName}
              </p>

              <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400 group-hover:text-white">
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Tap Link Active</span>
                </span>
                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Bottom CTA Banner */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl bg-gradient-to-b from-[#12151D] to-[#0A0C10] border border-white/10 p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white mb-4">
              <Sparkles className="w-6 h-6 text-zinc-200" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to Control Your Digital Profile?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-3 leading-relaxed">
              Log in with your registered email ID to update your visiting card information in real-time,
              change your password, or review who tapped your card.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="px-7 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-semibold shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-black" />
                <span>Sign In to Portal</span>
              </Link>

              <Link
                href="/sammple"
                target="_blank"
                className="px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-zinc-200 text-xs sm:text-sm font-semibold transition-all active:scale-95"
              >
                <span>View Tap Link Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Footer */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-white/[0.08] py-10 px-4 sm:px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span className="font-semibold text-white">DigitalCard Platform</span>
            <span>•</span>
            <span>NFC & Visiting Card Infrastructure</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/login" className="hover:text-white transition-colors">
              User & Admin Login
            </Link>
            <Link href="/forgot-password" className="hover:text-white transition-colors">
              Forgot Password
            </Link>
            <Link href="/sammple" className="hover:text-white transition-colors">
              Sample Card
            </Link>
          </div>

          <p className="text-[11px] text-zinc-500 font-normal">
            © 2026 DigitalCard Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
