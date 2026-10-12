/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClientData, CustomLink } from '@/types';
import { downloadVCard } from '@/lib/vcard';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Globe,
  UserPlus,
  Share2,
  Check,
  ExternalLink,
  Building2,
  Sparkles,
  ShieldCheck,
  X,
  Copy,
  QrCode,
  Wifi,
  Download,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Calendar,
  Terminal,
  Send,
  MessageSquare,
  Video,
  Palette,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import {
  LinkedInIcon,
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  TwitterXIcon,
  TikTokIcon,
} from '@/components/icons/BrandIcons';

interface DigitalCardProps {
  client: ClientData;
  baseUrl?: string;
  isPreview?: boolean;
}

export default function DigitalCard({ client, baseUrl = '', isPreview = false }: DigitalCardProps) {
  // -------------------------------------------------------------
  // Greeting Intro Animation Sequence (Apple / Luxury NFC Tap Style)
  // Stage flow: 'hello' (0-1.3s) -> 'name' (1.3-3.0s) -> 'fading_out' (3.0-3.6s) -> 'completed'
  // -------------------------------------------------------------
  const [greetingStage, setGreetingStage] = useState<'hello' | 'name' | 'fading_out' | 'completed'>(
    isPreview ? 'completed' : 'hello'
  );
  const [greetingVisibleText, setGreetingVisibleText] = useState<'hello' | 'name'>('hello');
  const greetingTimerRef = useRef<NodeJS.Timeout[]>([]);

  const clearGreetingTimers = () => {
    greetingTimerRef.current.forEach((t) => clearTimeout(t));
    greetingTimerRef.current = [];
  };

  const startGreetingSequence = useCallback(() => {
    clearGreetingTimers();
    setGreetingStage('hello');
    setGreetingVisibleText('hello');

    // Timer 1: Transition from "Hello" to "I'm {Name}" at ~1.3s
    const t1 = setTimeout(() => {
      setGreetingVisibleText('name');
      setGreetingStage('name');
    }, 1300);

    // Timer 2: Start fading out the greeting screen at ~3.0s
    const t2 = setTimeout(() => {
      setGreetingStage('fading_out');
    }, 3000);

    // Timer 3: Completely complete the greeting overlay at ~3.6s
    const t3 = setTimeout(() => {
      setGreetingStage('completed');
    }, 3600);

    greetingTimerRef.current = [t1, t2, t3];
  }, []);

  const skipGreeting = () => {
    clearGreetingTimers();
    setGreetingStage('fading_out');
    const t = setTimeout(() => {
      setGreetingStage('completed');
    }, 300);
    greetingTimerRef.current = [t];
  };

  const handleReplayGreeting = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    startGreetingSequence();
  };

  // Run greeting on initial mount if not in admin preview
  useEffect(() => {
    if (!isPreview) {
      startGreetingSequence();
    }
    return () => {
      clearGreetingTimers();
    };
  }, [isPreview, startGreetingSequence]);

  // -------------------------------------------------------------
  // Card Interactive States
  // -------------------------------------------------------------
  const [copiedLink, setCopiedLink] = useState(false);
  const [vcardAdded, setVcardAdded] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // QR Code state
  const [qrPng, setQrPng] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedNfcPayload, setCopiedNfcPayload] = useState(false);

  // Compute profile URL
  const profileUrl = typeof window !== 'undefined'
    ? (baseUrl ? `${baseUrl}/${client.slug}` : `${window.location.origin}/${client.slug}`)
    : `https://digitalcard.com/${client.slug}`;

  // Fetch QR Code data for QR Section / Modal
  useEffect(() => {
    let isMounted = true;
    const fetchQr = async () => {
      try {
        const res = await fetch(`/api/qr?url=${encodeURIComponent(profileUrl)}`);
        const data = await res.json();
        if (isMounted) {
          if (data.png) setQrPng(data.png);
          if (data.svg) setQrSvg(data.svg);
        }
      } catch (err) {
        console.error('Error fetching QR:', err);
      }
    };

    if (profileUrl) {
      fetchQr();
    }
    return () => {
      isMounted = false;
    };
  }, [profileUrl]);

  // Handle Add to Contacts (.vcf)
  const handleAddToContacts = () => {
    downloadVCard(client);
    setVcardAdded(true);
    setTimeout(() => setVcardAdded(false), 2500);
  };

  // Handle Share Profile
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${client.fullName} | ${client.designation || 'Digital Profile'}`,
          text: `Connect with ${client.fullName} (${client.companyName || 'Digital Business Card'}):`,
          url: profileUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore
    }
  };

  // Copy URL Helper
  const copyToClipboard = async (text: string, type: 'link' | 'nfc') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        setCopiedNfcPayload(true);
        setTimeout(() => setCopiedNfcPayload(false), 2500);
      }
    } catch {
      // Ignore
    }
  };

  // Download QR PNG
  const handleDownloadQrPng = () => {
    if (!qrPng) return;
    const a = document.createElement('a');
    a.href = qrPng;
    a.download = `${client.slug || 'contact'}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download QR SVG
  const handleDownloadQrSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.slug || 'contact'}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper: Render icon for custom links
  const renderCustomIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'github':
        return <Terminal className="w-4 h-4 text-zinc-300" />;
      case 'telegram':
        return <Send className="w-4 h-4 text-sky-400" />;
      case 'discord':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'tiktok':
        return <TikTokIcon className="w-4 h-4 text-pink-400" />;
      case 'behance':
        return <Palette className="w-4 h-4 text-amber-400" />;
      case 'medium':
        return <BookOpen className="w-4 h-4 text-zinc-200" />;
      case 'calendar':
      case 'calendly':
      case 'booking':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      default:
        return <Globe className="w-4 h-4 text-zinc-300" />;
    }
  };

  // Parse custom links
  let parsedCustomLinks: CustomLink[] = [];
  if (client.customLinks) {
    if (Array.isArray(client.customLinks)) {
      parsedCustomLinks = client.customLinks;
    } else if (typeof client.customLinks === 'string') {
      try {
        parsedCustomLinks = JSON.parse(client.customLinks);
      } catch {
        parsedCustomLinks = [];
      }
    }
  }
  parsedCustomLinks = Array.isArray(parsedCustomLinks)
    ? parsedCustomLinks.filter((item) => item && item.title && item.url)
    : [];

  // Parse cover/work showcase photos for banner slideshow
  let parsedCoverPhotos: string[] = [];
  if (client.coverPhotos) {
    if (Array.isArray(client.coverPhotos)) {
      parsedCoverPhotos = client.coverPhotos;
    } else if (typeof client.coverPhotos === 'string') {
      try {
        const parsed = JSON.parse(client.coverPhotos);
        if (Array.isArray(parsed)) {
          parsedCoverPhotos = parsed.filter(Boolean);
        } else if (typeof parsed === 'string' && parsed.trim()) {
          parsedCoverPhotos = [parsed.trim()];
        }
      } catch {
        if (client.coverPhotos.trim()) {
          parsedCoverPhotos = [client.coverPhotos.trim()];
        }
      }
    }
  }
  parsedCoverPhotos = parsedCoverPhotos.filter((url) => typeof url === 'string' && url.trim().length > 0);

  const [activeCoverSlide, setActiveCoverSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  // Auto-play cover slideshow every 4.5 seconds if 2+ photos exist
  useEffect(() => {
    if (parsedCoverPhotos.length <= 1 || isSlidePaused) return;
    const timer = setInterval(() => {
      setActiveCoverSlide((prev) => (prev + 1) % parsedCoverPhotos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [parsedCoverPhotos.length, isSlidePaused]);

  // Keep activeCoverSlide safely in bounds
  useEffect(() => {
    if (activeCoverSlide >= parsedCoverPhotos.length && parsedCoverPhotos.length > 0) {
      setActiveCoverSlide(0);
    }
  }, [parsedCoverPhotos.length, activeCoverSlide]);

  const nextCoverSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveCoverSlide((prev) => (prev + 1) % parsedCoverPhotos.length);
  };

  const prevCoverSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveCoverSlide((prev) => (prev - 1 + parsedCoverPhotos.length) % parsedCoverPhotos.length);
  };

  // Sanitize phone number for WhatsApp
  const cleanWhatsappNumber = client.whatsapp ? client.whatsapp.replace(/[^\d+]/g, '').replace('+', '') : '';

  // Compute active quick connect channels
  const quickChannels = [
    client.phone
      ? {
          id: 'phone',
          label: 'Call',
          href: `tel:${client.phone}`,
          icon: Phone,
          target: '_self',
          iconBg: 'bg-zinc-800 text-zinc-100',
          hoverBg: 'hover:border-zinc-500 hover:bg-zinc-800/80',
        }
      : null,
    cleanWhatsappNumber
      ? {
          id: 'whatsapp',
          label: 'WhatsApp',
          href: `https://wa.me/${cleanWhatsappNumber}`,
          icon: MessageCircle,
          target: '_blank',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          hoverBg: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
        }
      : null,
    client.email
      ? {
          id: 'email',
          label: 'Email',
          href: `mailto:${client.email}`,
          icon: Mail,
          target: '_self',
          iconBg: 'bg-zinc-800 text-zinc-100',
          hoverBg: 'hover:border-zinc-500 hover:bg-zinc-800/80',
        }
      : null,
    client.googleMapsUrl || client.address
      ? {
          id: 'map',
          label: 'Map',
          href:
            client.googleMapsUrl ||
            `https://maps.google.com/?q=${encodeURIComponent(client.address || '')}`,
          icon: MapPin,
          target: '_blank',
          iconBg: 'bg-rose-500/20 text-rose-400',
          hoverBg: 'hover:border-rose-500/50 hover:bg-rose-500/10',
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    target: string;
    iconBg: string;
    hoverBg: string;
  }[];

  // Grouped social links list (Inspired by the luxury stacked list in the reference)
  const socialList = [
    client.instagram
      ? {
          id: 'instagram',
          title: 'Instagram',
          subtitle: client.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '@').replace(/\/$/, '') || 'Follow on Instagram',
          href: client.instagram,
          icon: <InstagramIcon className="w-4 h-4 text-pink-400" />,
          iconContainerBg: 'bg-pink-500/15 border-pink-500/20',
        }
      : null,
    client.website
      ? {
          id: 'website',
          title: 'Website',
          subtitle: client.website.replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'Official Website',
          href: client.website,
          icon: <Globe className="w-4 h-4 text-cyan-400" />,
          iconContainerBg: 'bg-cyan-500/15 border-cyan-500/20',
        }
      : null,
    client.linkedin
      ? {
          id: 'linkedin',
          title: 'LinkedIn',
          subtitle: client.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'in/').replace(/\/$/, '') || 'Professional Profile',
          href: client.linkedin,
          icon: <LinkedInIcon className="w-4 h-4 text-sky-400" />,
          iconContainerBg: 'bg-sky-500/15 border-sky-500/20',
        }
      : null,
    client.twitter
      ? {
          id: 'twitter',
          title: 'X / Twitter',
          subtitle: client.twitter.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, '@').replace(/\/$/, '') || 'Updates & Insights',
          href: client.twitter,
          icon: <TwitterXIcon className="w-3.5 h-3.5 text-zinc-100" />,
          iconContainerBg: 'bg-white/10 border-white/20',
        }
      : null,
    client.youtube
      ? {
          id: 'youtube',
          title: 'YouTube',
          subtitle: client.youtube.replace(/^https?:\/\/(www\.)?youtube\.com\//i, '@').replace(/\/$/, '') || 'Videos & Media',
          href: client.youtube,
          icon: <YouTubeIcon className="w-4 h-4 text-rose-400" />,
          iconContainerBg: 'bg-rose-500/15 border-rose-500/20',
        }
      : null,
    client.facebook
      ? {
          id: 'facebook',
          title: 'Facebook',
          subtitle: client.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//i, '').replace(/\/$/, '') || 'Community Page',
          href: client.facebook,
          icon: <FacebookIcon className="w-4 h-4 text-blue-400" />,
          iconContainerBg: 'bg-blue-500/15 border-blue-500/20',
        }
      : null,
    ...parsedCustomLinks.map((custom) => ({
      id: custom.id,
      title: custom.title,
      subtitle: custom.url.replace(/^https?:\/\//i, '').replace(/\/$/, ''),
      href: custom.url,
      icon: renderCustomIcon(custom.icon),
      iconContainerBg: 'bg-white/[0.08] border-white/10',
    })),
  ].filter(Boolean) as {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    icon: React.ReactNode;
    iconContainerBg: string;
  }[];

  const hasAnySocialLinks = socialList.length > 0;

  // Check if business information exists
  const hasBusinessInfo = Boolean(
    client.companyLogo ||
    client.companyName ||
    client.companyDescription ||
    client.businessCategory
  );

  return (
    <div className="w-full min-h-screen bg-[#07080B] text-slate-100 font-sans antialiased selection:bg-white selection:text-black pb-14 relative overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* NFC TAP GREETING INTRO OVERLAY ("Hello" -> "I'm {Name}") */}
      {/* ------------------------------------------------------------- */}
      {greetingStage !== 'completed' && (
        <div
          onClick={skipGreeting}
          className={`fixed inset-0 z-50 bg-[#050608] flex flex-col items-center justify-between p-6 sm:p-10 select-none cursor-pointer transition-all duration-700 ease-out ${
            greetingStage === 'fading_out' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          title="Tap anywhere to skip greeting"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />

          {/* Top Indicator */}
          <div className="relative z-10 pt-4 flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-300">
                NFC CONNECTED
              </span>
            </div>
          </div>

          {/* Centralized Typography Sequence */}
          <div className="relative z-10 max-w-lg mx-auto text-center px-4 flex flex-col items-center justify-center my-auto min-h-[180px]">
            {greetingVisibleText === 'hello' ? (
              <div className="animate-in fade-in zoom-in-95 duration-700 ease-out flex flex-col items-center">
                <h1 className="text-5xl sm:text-7xl font-extralight tracking-wider text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]">
                  Hello
                </h1>
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-5 rounded-full" />
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-700 ease-out flex flex-col items-center">
                <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-zinc-400 mb-2">
                  Welcome to profile
                </span>
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                  I&apos;m {client.fullName || 'there'}
                </h1>
                {client.designation && (
                  <p className="text-sm sm:text-base text-zinc-400 mt-2 font-normal max-w-sm">
                    {client.designation} {client.companyName ? `• ${client.companyName}` : ''}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Tap / Skip Bar */}
          <div className="relative z-10 pb-6 flex flex-col items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <span>Tap anywhere to continue</span>
              <span className="text-white/40">›</span>
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Top Navigation Bar - Sleek Dark Obsidian Header */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-[#07080B]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 py-2.5 shadow-xl">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-200 shadow-inner shrink-0">
              <Sparkles className="w-4 h-4 text-zinc-300" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold tracking-tight text-white leading-none">
                DigitalCard
              </span>
              <span className="text-[10px] text-zinc-400 leading-tight">
                NFC Profile
              </span>
            </div>
          </div>

          {/* Center: URL Pill (Click to copy) */}
          <button
            onClick={() => copyToClipboard(profileUrl, 'link')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-mono text-zinc-300 transition-colors truncate max-w-[170px] sm:max-w-[220px] cursor-pointer"
            title="Click to copy permanent profile link"
          >
            <span className="text-zinc-500 font-semibold">/</span>
            <span className="truncate">{client.slug || 'username'}</span>
            {copiedLink ? (
              <Check className="w-3 h-3 text-emerald-400 ml-0.5 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-400 ml-0.5 shrink-0" />
            )}
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Replay Greeting Button */}
            <button
              onClick={handleReplayGreeting}
              className="p-2 rounded-full hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Replay NFC greeting intro"
              aria-label="Replay NFC greeting intro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* QR Code Trigger */}
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-full hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="View QR Code"
              aria-label="View QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Share Trigger */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Share Profile"
              aria-label="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Save Contact Pill */}
            <button
              onClick={handleAddToContacts}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {vcardAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* Main Profile Feed / Cards Container */}
      {/* ------------------------------------------------------------- */}
      <main className="w-full max-w-xl mx-auto px-0 sm:px-4 pt-0 sm:pt-4 flex flex-col">
        {/* ============================================================= */}
        {/* CARD 1: Profile Intro / Hero Card (Subtle Luxury Dark Aesthetics) */}
        {/* ============================================================= */}
        <section className="bg-[#0F1218]/90 backdrop-blur-xl rounded-none sm:rounded-3xl border-y sm:border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden mb-3 relative">
          {/* Cover Photo Banner / Photo Slide */}
          <div
            className="relative w-full h-40 sm:h-56 bg-gradient-to-br from-zinc-900 via-[#141822] to-zinc-950 overflow-hidden group select-none transition-all"
            onMouseEnter={() => setIsSlidePaused(true)}
            onMouseLeave={() => setIsSlidePaused(false)}
            onTouchStart={() => setIsSlidePaused(true)}
            onTouchEnd={() => setIsSlidePaused(false)}
          >
            {/* If photos exist: Render Photo Slide Carousel */}
            {parsedCoverPhotos.length > 0 ? (
              <>
                {/* Photo Slides with smooth crossfade */}
                {parsedCoverPhotos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === activeCoverSlide ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`${client.fullName || 'Work Showcase'} - Slide ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Seamless dark bottom gradient dissolving into the profile body */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1218] via-[#0F1218]/60 to-black/30 z-2 pointer-events-none" />

                {/* Controls & Pagination (Only when 2+ photos) */}
                {parsedCoverPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevCoverSlide}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center transition-all z-10 active:scale-90 cursor-pointer shadow-md opacity-80 sm:opacity-0 group-hover:opacity-100"
                      title="Previous Photo"
                      aria-label="Previous Photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={nextCoverSlide}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center transition-all z-10 active:scale-90 cursor-pointer shadow-md opacity-80 sm:opacity-0 group-hover:opacity-100"
                      title="Next Photo"
                      aria-label="Next Photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Slide Counter & Dots indicator */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-sm">
                      <span className="text-[10px] font-semibold text-white/90 font-mono tracking-tight">
                        {activeCoverSlide + 1} / {parsedCoverPhotos.length}
                      </span>
                      <div className="flex items-center gap-1 ml-1">
                        {parsedCoverPhotos.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCoverSlide(dotIdx);
                            }}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              dotIdx === activeCoverSlide
                                ? 'bg-white w-3.5'
                                : 'bg-white/40 hover:bg-white/80 w-1.5'
                            }`}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Sleek Matte Mesh Fallback Banner */
              <>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1218] via-transparent to-transparent pointer-events-none" />
              </>
            )}

            {/* Top Right NFC Chip Active Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium shadow-md z-10">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>NFC Active</span>
            </div>
          </div>

          {/* Profile Header Inner */}
          <div className="px-5 sm:px-6 pb-6 relative">
            {/* Avatar & Top Identity Row */}
            <div className="flex flex-col items-center -mt-16 sm:-mt-20 mb-3 relative z-10">
              {/* Circular Avatar with Glowing Ring & Status Dot */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full ring-4 ring-[#0F1218] border-2 border-white/20 shadow-2xl overflow-hidden bg-zinc-900 shrink-0 relative z-10">
                  {client.profilePhoto ? (
                    <img
                      src={client.profilePhoto}
                      alt={client.fullName || 'Profile avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-200 font-bold text-3xl sm:text-4xl">
                      {(client.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Online Active Status Indicator Dot */}
                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 sm:border-[3px] border-[#0F1218] absolute bottom-1 right-2 sm:right-3 z-20 shadow-md"
                  title="Active Digital Profile"
                />
              </div>

              {/* Name & Verified Badge */}
              <div className="flex items-center justify-center gap-2 mt-3 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {client.fullName || 'Full Name'}
                </h1>
                {/* Verified Badge */}
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-black shadow-xs shrink-0" title="Verified Digital Profile">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Slug Handle */}
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                @{client.slug || 'profile'}
              </p>

              {/* Professional Headline */}
              <p className="text-sm sm:text-[15px] text-zinc-300 font-medium text-center leading-snug mt-1.5 max-w-md">
                {client.designation}
                {client.companyName ? ` at ${client.companyName}` : ''}
              </p>

              {/* Location & Contact Info Trigger */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-zinc-400 mt-2 font-normal">
                {client.address && (
                  <span>{client.address.split(',').slice(-2).join(',').trim() || client.address}</span>
                )}
                {client.address && <span>•</span>}
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="text-zinc-200 font-semibold hover:text-white underline decoration-zinc-500 underline-offset-2 cursor-pointer inline-flex items-center gap-0.5"
                >
                  <span>Contact info</span>
                </button>
              </div>

              {/* NFC Verification Badge */}
              <div className="mt-2.5 flex items-center justify-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-medium text-[11px] border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Permanent NFC Verified
                </span>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* Action Pill Buttons - Subtle Luxury Styling */}
            {/* --------------------------------------------------------- */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-2.5">
              {/* Primary Action: Save Contact */}
              <button
                onClick={handleAddToContacts}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                {vcardAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Contact Saved (.vcf)</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Save Contact</span>
                  </>
                )}
              </button>

              {/* Message / WhatsApp */}
              {cleanWhatsappNumber && (
                <a
                  href={`https://wa.me/${cleanWhatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25 font-semibold text-xs sm:text-sm transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Direct Call */}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-zinc-200 hover:bg-white/[0.12] hover:text-white font-semibold text-xs sm:text-sm transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4 text-zinc-300" />
                  <span>Call</span>
                </a>
              )}

              {/* Share / QR Code */}
              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-zinc-200 hover:bg-white/[0.12] hover:text-white font-semibold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
                title="View QR Code & NFC Details"
              >
                <QrCode className="w-4 h-4 text-zinc-300" />
                <span>QR Code</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* CARD 2: Quick Connect Channels Grid */}
        {/* ============================================================= */}
        {quickChannels.length > 0 && (
          <section className="bg-[#0F1218]/90 backdrop-blur-xl rounded-none sm:rounded-3xl border-y sm:border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-4 sm:p-5 mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Instant Contact Channels</span>
            </h2>

            <div
              className={`grid gap-2.5 sm:gap-3 ${
                quickChannels.length === 1
                  ? 'grid-cols-1'
                  : quickChannels.length === 2
                  ? 'grid-cols-2'
                  : quickChannels.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {quickChannels.map((channel) => {
                const IconComponent = channel.icon;
                return (
                  <a
                    key={channel.id}
                    href={channel.href}
                    target={channel.target}
                    rel={channel.target === '_blank' ? 'noopener noreferrer' : undefined}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-zinc-200 active:scale-95 transition-all text-center group"
                  >
                    <div className={`p-2.5 rounded-xl ${channel.iconBg} mb-1.5 shadow-sm`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-white">
                      {channel.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 3: Featured & Social Channels (Sleek Grouped List Card like reference) */}
        {/* ============================================================= */}
        {hasAnySocialLinks && (
          <section className="bg-[#0F1218]/90 backdrop-blur-xl rounded-none sm:rounded-3xl border-y sm:border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-5 sm:p-6 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Featured & Social Links
                </h2>
                <p className="text-xs text-zinc-400 font-normal mt-0.5">
                  Connect across official profiles and links
                </p>
              </div>
            </div>

            {/* Stacked Grouped Channels Container */}
            <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06] overflow-hidden">
              {socialList.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 hover:bg-white/[0.06] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.iconContainerBg}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 4: About Section */}
        {/* ============================================================= */}
        {client.bio && (
          <section className="bg-[#0F1218]/90 backdrop-blur-xl rounded-none sm:rounded-3xl border-y sm:border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-5 sm:p-6 mb-3">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2.5">
              About
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
              {client.bio}
            </p>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 5: Experience Section */}
        {/* ============================================================= */}
        {hasBusinessInfo && (
          <section className="bg-[#0F1218]/90 backdrop-blur-xl rounded-none sm:rounded-3xl border-y sm:border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-5 sm:p-6 mb-3">
            <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Experience</span>
              <span className="text-[11px] font-medium text-zinc-300 bg-white/[0.06] border border-white/10 px-3 py-0.5 rounded-full">
                Current Role
              </span>
            </h2>

            <div className="flex items-start gap-3.5">
              {/* Company Logo or Icon */}
              {client.companyLogo ? (
                <img
                  src={client.companyLogo}
                  alt={client.companyName || 'Company Logo'}
                  className="w-12 h-12 rounded-xl object-cover border border-white/15 bg-zinc-900 shrink-0 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
              )}

              {/* Role Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                  {client.designation || 'Executive'}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-0.5">
                  {client.companyName}
                </p>

                {/* Sub-meta: Employment type & category */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-zinc-400">
                  <span>Full-time</span>
                  <span>•</span>
                  <span>Present</span>
                  {client.businessCategory && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-300 font-medium">
                        {client.businessCategory}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {client.companyDescription && (
                  <p className="text-xs sm:text-sm text-zinc-400 mt-3 leading-relaxed font-normal">
                    {client.companyDescription}
                  </p>
                )}

                {/* Website Link */}
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white underline decoration-zinc-500 underline-offset-2 mt-3"
                  >
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Visit Company Website</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 6: Location & Office Directions */}
        {/* ============================================================= */}
        {client.address && (
          <section className="bg-[#0F1218]/90 backdrop-blur-xl rounded-none sm:rounded-3xl border-y sm:border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-5 sm:p-6 mb-3">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Office Location</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal mb-3.5">
              {client.address}
            </p>
            <a
              href={client.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(client.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-semibold transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 7: QR Code & NFC Card */}
        {/* ============================================================= */}
        <section className="bg-[#0F1218]/90 backdrop-blur-xl rounded-none sm:rounded-3xl border-y sm:border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-5 sm:p-6 mb-3 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 text-zinc-300 mb-2.5 shadow-inner">
            <QrCode className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Scan to Connect
          </h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4 font-normal">
            Point your smartphone camera at the QR code or tap the physical NFC card to view and save this profile.
          </p>

          {/* High-contrast QR Container (White surface for optimal camera scanning) */}
          <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border-4 border-zinc-800 shadow-2xl flex items-center justify-center">
            {qrPng ? (
              <img
                src={qrPng}
                alt={`${client.fullName} QR Code`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-zinc-500 flex items-center justify-center">
                Generating QR...
              </div>
            )}
          </div>

          {/* Download & Copy Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              onClick={handleDownloadQrPng}
              disabled={!qrPng}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleDownloadQrSvg}
              disabled={!qrSvg}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Download SVG</span>
            </button>

            <button
              onClick={() => copyToClipboard(profileUrl, 'nfc')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-medium transition-all active:scale-95 shadow-md cursor-pointer"
            >
              {copiedNfcPayload ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>NFC URL Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy NFC URL</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Clean Neutral Luxury Footer */}
        <footer className="py-6 text-center text-xs text-zinc-500">
          <div className="flex items-center justify-center gap-2 mb-2 font-semibold text-zinc-300">
            <div className="w-5 h-5 rounded-md bg-white/[0.08] text-white flex items-center justify-center text-[10px] border border-white/10">
              <Sparkles className="w-3 h-3 text-zinc-300" />
            </div>
            <span>DigitalCard Platform</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-normal">
            © 2026 DigitalCard Management • NFC Ready • Centralized Template
          </p>
        </footer>
      </main>

      {/* ============================================================= */}
      {/* Contact Info Pop-up Modal (Luxury Frosted Dark Styling) */}
      {/* ============================================================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#11141C] w-full max-w-md rounded-3xl shadow-2xl border border-white/15 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {client.fullName || 'Contact Information'}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Permanent Profile URL */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Permanent Profile URL
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <span className="text-xs font-mono text-zinc-300 truncate mr-2">
                    {profileUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(profileUrl, 'link')}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.08] border border-white/15 hover:border-white/30 text-[11px] font-semibold text-white shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Phone */}
              {client.phone && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Phone Number
                  </span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-xs font-medium text-zinc-200">
                      {client.phone}
                    </span>
                    <a
                      href={`tel:${client.phone}`}
                      className="px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Call
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {client.email && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Email Address
                  </span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-xs font-medium text-zinc-200 truncate mr-2">
                      {client.email}
                    </span>
                    <a
                      href={`mailto:${client.email}`}
                      className="px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Mail
                    </a>
                  </div>
                </div>
              )}

              {/* Office Address */}
              {client.address && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Address
                  </span>
                  <p className="text-xs text-zinc-300 bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.08]">
                    {client.address}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2">
                <button
                  onClick={handleAddToContacts}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Download vCard Contact (.vcf)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* Fullscreen QR Code & NFC Modal (Luxury Frosted Dark Styling) */}
      {/* ============================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#11141C] w-full max-w-sm rounded-3xl shadow-2xl border border-white/15 overflow-hidden text-center p-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/[0.08] text-white flex items-center justify-center border border-white/10">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-white">QR Code</span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 font-normal">
              Scan with phone camera or tap physical NFC card to view this digital profile.
            </p>

            {/* QR Image Container (White backdrop for 100% scan reliability) */}
            <div className="w-52 h-52 mx-auto p-3 bg-white rounded-2xl border-4 border-zinc-800 shadow-xl flex items-center justify-center mb-4">
              {qrPng ? (
                <img
                  src={qrPng}
                  alt={`${client.fullName} QR`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-zinc-500">Generating QR...</span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadQrPng}
                disabled={!qrPng}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Save QR to Device (PNG)</span>
              </button>

              <button
                onClick={() => copyToClipboard(profileUrl, 'nfc')}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {copiedNfcPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Permanent URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Permanent URL for NFC Chip</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
