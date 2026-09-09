'use client';

import React, { useState, useEffect } from 'react';
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
  Link as LinkIcon,
} from 'lucide-react';
import {
  LinkedInIcon,
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  TwitterXIcon,
} from '@/components/icons/BrandIcons';

interface DigitalCardProps {
  client: ClientData;
  baseUrl?: string;
  isPreview?: boolean;
}

export default function DigitalCard({ client, baseUrl = '', isPreview = false }: DigitalCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [vcardAdded, setVcardAdded] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // QR Code state
  const [qrPng, setQrPng] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [copiedNfcPayload, setCopiedNfcPayload] = useState(false);

  // Compute profile URL
  const profileUrl = typeof window !== 'undefined'
    ? (baseUrl ? `${baseUrl}/${client.slug}` : `${window.location.origin}/${client.slug}`)
    : `https://digitalcard.com/${client.slug}`;

  // Fetch QR Code data for QR Section / Modal
  useEffect(() => {
    let isMounted = true;
    const fetchQr = async () => {
      setQrLoading(true);
      try {
        const res = await fetch(`/api/qr?url=${encodeURIComponent(profileUrl)}`);
        const data = await res.json();
        if (isMounted) {
          if (data.png) setQrPng(data.png);
          if (data.svg) setQrSvg(data.svg);
        }
      } catch (err) {
        console.error('Error fetching QR:', err);
      } finally {
        if (isMounted) setQrLoading(false);
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
        return <Terminal className="w-4 h-4 text-slate-800" />;
      case 'telegram':
        return <Send className="w-4 h-4 text-slate-700" />;
      case 'discord':
        return <MessageSquare className="w-4 h-4 text-slate-700" />;
      case 'tiktok':
        return <Video className="w-4 h-4 text-slate-700" />;
      case 'behance':
        return <Palette className="w-4 h-4 text-slate-700" />;
      case 'medium':
        return <BookOpen className="w-4 h-4 text-slate-800" />;
      case 'calendar':
      case 'calendly':
      case 'booking':
        return <Calendar className="w-4 h-4 text-emerald-700" />;
      default:
        return <Globe className="w-4 h-4 text-slate-700" />;
    }
  };

  // Helper: Get custom icon background style
  const getCustomIconBg = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'github':
        return 'bg-slate-100 text-slate-900';
      case 'calendar':
      case 'calendly':
      case 'booking':
        return 'bg-emerald-50 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-800';
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
  // Filter valid custom links with title & URL
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

  // Compute active quick connect channels (only populated channels, omitting deleted ones)
  const quickChannels = [
    client.phone
      ? {
          id: 'phone',
          label: 'Call',
          href: `tel:${client.phone}`,
          icon: Phone,
          target: '_self',
          iconBg: 'bg-slate-200/70 text-slate-800',
          hoverBg: 'hover:border-slate-400 hover:bg-slate-100',
        }
      : null,
    cleanWhatsappNumber
      ? {
          id: 'whatsapp',
          label: 'WhatsApp',
          href: `https://wa.me/${cleanWhatsappNumber}`,
          icon: MessageCircle,
          target: '_blank',
          iconBg: 'bg-emerald-100/70 text-emerald-700',
          hoverBg: 'hover:border-emerald-500/50 hover:bg-emerald-50/40',
        }
      : null,
    client.email
      ? {
          id: 'email',
          label: 'Email',
          href: `mailto:${client.email}`,
          icon: Mail,
          target: '_self',
          iconBg: 'bg-slate-200/70 text-slate-800',
          hoverBg: 'hover:border-slate-400 hover:bg-slate-100',
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
          iconBg: 'bg-rose-100/70 text-rose-700',
          hoverBg: 'hover:border-rose-400/50 hover:bg-rose-50/30',
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

  // Check if any standard social links exist
  const hasStandardSocials = Boolean(
    client.instagram ||
    client.linkedin ||
    client.facebook ||
    client.youtube ||
    client.twitter ||
    client.website
  );

  // Check if ANY links exist (standard OR custom)
  const hasAnySocialLinks = hasStandardSocials || parsedCustomLinks.length > 0;

  // Check if business information exists
  const hasBusinessInfo = Boolean(
    client.companyLogo ||
    client.companyName ||
    client.companyDescription ||
    client.businessCategory
  );

  return (
    <div className="w-full min-h-screen bg-[#f4f5f7] text-[#1c1e21] font-sans antialiased selection:bg-slate-800 selection:text-white pb-12">
      {/* ------------------------------------------------------------- */}
      {/* Top Navigation Bar - Clean, Subtle, Non-Contrast */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2 sm:py-2.5 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-slate-300" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold tracking-tight text-slate-900 leading-none">
                DigitalCard
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                NFC Profile
              </span>
            </div>
          </div>

          {/* Center: URL Pill (Click to copy) */}
          <button
            onClick={() => copyToClipboard(profileUrl, 'link')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-[11px] font-mono text-slate-600 transition-colors truncate max-w-[170px] sm:max-w-[220px] cursor-pointer"
            title="Click to copy permanent profile link"
          >
            <span className="text-slate-400 font-semibold">/</span>
            <span className="truncate">{client.slug || 'username'}</span>
            {copiedLink ? (
              <Check className="w-3 h-3 text-emerald-600 ml-0.5 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
            )}
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* QR Code Trigger */}
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="View QR Code"
              aria-label="View QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Share Trigger */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Share Profile"
              aria-label="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Save Contact Pill */}
            <button
              onClick={handleAddToContacts}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {vcardAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
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
        {/* CARD 1: Profile Intro / Hero Card (Low-Contrast Harmonious Theme) */}
        {/* ============================================================= */}
        <section className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/90 shadow-sm overflow-hidden mb-3 relative">
          {/* Cover Photo Banner / Photo Slide */}
          <div
            className="relative w-full h-36 sm:h-52 bg-gradient-to-r from-[#29323c] via-[#485563] to-[#2b3a4a] overflow-hidden group select-none transition-all"
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

                {/* Subtle gradient vignettes for optimal contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 z-2 pointer-events-none" />

                {/* Controls & Pagination (Only when 2+ photos) */}
                {parsedCoverPhotos.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={prevCoverSlide}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center transition-all z-10 active:scale-90 cursor-pointer shadow-md opacity-80 sm:opacity-0 group-hover:opacity-100"
                      title="Previous Photo"
                      aria-label="Previous Photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={nextCoverSlide}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md text-white/90 hover:text-white flex items-center justify-center transition-all z-10 active:scale-90 cursor-pointer shadow-md opacity-80 sm:opacity-0 group-hover:opacity-100"
                      title="Next Photo"
                      aria-label="Next Photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Slide Counter & Dots indicator (Bottom Right of Banner) */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10 bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
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
              /* Fallback Slate Texture Banner if no cover photos are uploaded */
              <>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-slate-400/10 blur-2xl pointer-events-none" />
              </>
            )}

            {/* Top Right NFC Chip Active Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium shadow-xs z-10">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>NFC Active</span>
            </div>
          </div>

          {/* Profile Header Inner */}
          <div className="px-5 sm:px-6 pb-6 relative">
            {/* Avatar Row */}
            <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-3">
              {/* Circular Avatar with White Border & Status Dot */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-md overflow-hidden bg-white shrink-0 relative z-10">
                  {client.profilePhoto ? (
                    <img
                      src={client.profilePhoto}
                      alt={client.fullName || 'Profile avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-150 text-slate-700 font-bold text-3xl sm:text-4xl">
                      {(client.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Online Active Status Indicator Dot */}
                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 sm:border-[3px] border-white absolute bottom-1 right-2 sm:right-3 z-20 shadow-xs"
                  title="Active Digital Profile"
                />
              </div>

              {/* Company Logo Widget (Top-Right of Header) */}
              {client.companyName && (
                <div className="hidden sm:flex items-center gap-2 max-w-[190px] pt-4 text-right">
                  <div className="flex flex-col items-end min-w-0">
                    <span className="text-xs font-bold text-slate-800 hover:text-slate-950 truncate cursor-default">
                      {client.companyName}
                    </span>
                    {client.businessCategory && (
                      <span className="text-[11px] text-slate-500 truncate">
                        {client.businessCategory}
                      </span>
                    )}
                  </div>
                  {client.companyLogo ? (
                    <img
                      src={client.companyLogo}
                      alt={client.companyName}
                      className="w-9 h-9 rounded-md object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Name & Verified Badge */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {client.fullName || 'Full Name'}
              </h1>
              {/* Verified Check Badge (Refined Slate/Neutral) */}
              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white shadow-2xs" title="Verified Digital Card">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            {/* Professional Headline */}
            <p className="text-sm sm:text-[15px] text-slate-700 font-normal leading-snug mt-1 max-w-lg">
              {client.designation}
              {client.companyName ? ` at ${client.companyName}` : ''}
            </p>

            {/* Location & Contact Info Row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-2 font-normal">
              {client.address && (
                <span>{client.address.split(',').slice(-2).join(',').trim() || client.address}</span>
              )}
              {client.address && <span>•</span>}
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="text-slate-700 font-semibold hover:text-slate-950 underline decoration-slate-300 underline-offset-2 cursor-pointer inline-flex items-center gap-0.5"
              >
                <span>Contact info</span>
              </button>
            </div>

            {/* NFC Verification Badge */}
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md font-medium text-[11px] border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Permanent NFC Verified
              </span>
            </div>

            {/* --------------------------------------------------------- */}
            {/* Action Pill Buttons - Harmonious Low-Contrast Styling */}
            {/* --------------------------------------------------------- */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              {/* Primary Action: Save Contact (Graphite Pill) */}
              <button
                onClick={handleAddToContacts}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {vcardAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-600/40 text-emerald-750 hover:bg-emerald-50/60 font-semibold text-xs sm:text-sm transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Direct Call */}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>Call</span>
                </a>
              )}

              {/* Share / QR Code */}
              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
                title="View QR Code & NFC Details"
              >
                <QrCode className="w-4 h-4 text-slate-600" />
                <span>QR Code</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* CARD 2: Quick Connect Channels Grid (Filtered to active only) */}
        {/* ============================================================= */}
        {quickChannels.length > 0 && (
          <section className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              <span>Instant Contact Channels</span>
            </h2>

            <div
              className={`grid gap-2 sm:gap-3 ${
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
                    className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-slate-50/80 ${channel.hoverBg} text-slate-800 active:scale-95 transition-all text-center`}
                  >
                    <div className={`p-2 rounded-lg ${channel.iconBg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold mt-1.5">{channel.label}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 3: About Section */}
        {/* ============================================================= */}
        {client.bio && (
          <section className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              About
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {client.bio}
            </p>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 4: Experience Section */}
        {/* ============================================================= */}
        {hasBusinessInfo && (
          <section className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Experience</span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Current Role
              </span>
            </h2>

            <div className="flex items-start gap-3.5">
              {/* Company Logo or Icon */}
              {client.companyLogo ? (
                <img
                  src={client.companyLogo}
                  alt={client.companyName || 'Company Logo'}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
              )}

              {/* Role Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {client.designation || 'Executive'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                  {client.companyName}
                </p>

                {/* Sub-meta: Employment type & category */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-500">
                  <span>Full-time</span>
                  <span>•</span>
                  <span>Present</span>
                  {client.businessCategory && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">
                        {client.businessCategory}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {client.companyDescription && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed font-normal">
                    {client.companyDescription}
                  </p>
                )}

                {/* Website Link */}
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 underline decoration-slate-300 underline-offset-2 mt-3"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Visit Company Website</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 5: Featured & Social Profiles */}
        {/* ============================================================= */}
        {hasAnySocialLinks && (
          <section className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Featured & Social Profiles
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Connect with {client.fullName || 'me'} across professional and social channels
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* LinkedIn (only if populated) */}
              {client.linkedin && (
                <a
                  href={client.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <LinkedInIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-black truncate">
                        LinkedIn
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Professional Profile
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                </a>
              )}

              {/* Twitter / X (only if populated) */}
              {client.twitter && (
                <a
                  href={client.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <TwitterXIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-black truncate">
                        X / Twitter
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Updates & Insights
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                </a>
              )}

              {/* Instagram (only if populated) */}
              {client.instagram && (
                <a
                  href={client.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-black truncate">
                        Instagram
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Visual Stories
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                </a>
              )}

              {/* Facebook (only if populated) */}
              {client.facebook && (
                <a
                  href={client.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-black truncate">
                        Facebook
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Community
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                </a>
              )}

              {/* YouTube (only if populated) */}
              {client.youtube && (
                <a
                  href={client.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <YouTubeIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-black truncate">
                        YouTube Channel
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Videos & Keynotes
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                </a>
              )}

              {/* Official Website (only if populated) */}
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-black truncate">
                        Website
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {client.website.replace(/^https?:\/\//, '')}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                </a>
              )}

              {/* DYNAMIC CUSTOM LINKS & CHANNELS */}
              {parsedCustomLinks.map((custom) => (
                <a
                  key={custom.id}
                  href={custom.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getCustomIconBg(custom.icon)}`}>
                      {renderCustomIcon(custom.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-black truncate">
                        {custom.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {custom.url.replace(/^https?:\/\//, '')}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 6: Location & Office Directions */}
        {/* ============================================================= */}
        {client.address && (
          <section className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-600" />
              <span>Office Location</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mb-3.5">
              {client.address}
            </p>
            <a
              href={client.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(client.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </section>
        )}

        {/* ============================================================= */}
        {/* CARD 7: QR Code & NFC Card */}
        {/* ============================================================= */}
        <section className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-3 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 mb-2.5">
            <QrCode className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Scan to Connect
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 font-normal">
            Point your smartphone camera at the QR code or tap the physical NFC business card to view and save this profile.
          </p>

          {/* QR Container */}
          <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
            {qrPng ? (
              <img
                src={qrPng}
                alt={`${client.fullName} QR Code`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-slate-400 flex items-center justify-center">
                Generating QR...
              </div>
            )}
          </div>

          {/* Download & Copy Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              onClick={handleDownloadQrPng}
              disabled={!qrPng}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleDownloadQrSvg}
              disabled={!qrSvg}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download SVG</span>
            </button>

            <button
              onClick={() => copyToClipboard(profileUrl, 'nfc')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              {copiedNfcPayload ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
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

        {/* Clean Neutral Footer */}
        <footer className="py-6 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-2 font-semibold text-slate-700">
            <div className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[10px]">
              <Sparkles className="w-3 h-3" />
            </div>
            <span>DigitalCard Platform</span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">
            © 2026 DigitalCard Management • Centralized Dynamic Template • NFC Ready
          </p>
        </footer>
      </main>

      {/* ============================================================= */}
      {/* Contact Info Pop-up Modal */}
      {/* ============================================================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {client.fullName || 'Contact Information'}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Permanent Profile URL */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Permanent Profile URL
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-mono text-slate-700 truncate mr-2">
                    {profileUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(profileUrl, 'link')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-[11px] font-semibold text-slate-800 shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Phone */}
              {client.phone && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Phone Number
                  </span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-medium text-slate-800">
                      {client.phone}
                    </span>
                    <a
                      href={`tel:${client.phone}`}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Call
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {client.email && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Email Address
                  </span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-medium text-slate-800 truncate mr-2">
                      {client.email}
                    </span>
                    <a
                      href={`mailto:${client.email}`}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      Mail
                    </a>
                  </div>
                </div>
              )}

              {/* Office Address */}
              {client.address && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Address
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {client.address}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2">
                <button
                  onClick={handleAddToContacts}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
      {/* Fullscreen QR Code & NFC Modal */}
      {/* ============================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-slate-900">QR Code</span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-normal">
              Scan with phone camera or tap physical NFC business card to view this digital profile.
            </p>

            {/* QR Image */}
            <div className="w-52 h-52 mx-auto p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center mb-4">
              {qrPng ? (
                <img
                  src={qrPng}
                  alt={`${client.fullName} QR`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">Generating QR...</span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadQrPng}
                disabled={!qrPng}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Save QR to Device (PNG)</span>
              </button>

              <button
                onClick={() => copyToClipboard(profileUrl, 'nfc')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copiedNfcPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
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
