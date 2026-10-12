'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClientData, CustomLink } from '@/types';
import LivePreviewFrame from '@/components/admin/LivePreviewFrame';
import {
  Sparkles,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building2,
  Upload,
  Lock,
  LogOut,
  ExternalLink,
  Save,
  Loader2,
  Eye,
  Smartphone,
  QrCode,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import {
  LinkedInIcon,
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  TwitterXIcon,
} from '@/components/icons/BrandIcons';

export default function ClientPortalPage() {
  const router = useRouter();

  const [client, setClient] = useState<ClientData | null>(null);
  const [liveData, setLiveData] = useState<ClientData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Stats
  const [stats, setStats] = useState<{
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    devices: { mobile: number; desktop: number; tablet: number };
  }>({
    totalViews: 0,
    viewsToday: 0,
    viewsThisWeek: 0,
    devices: { mobile: 0, desktop: 0, tablet: 0 },
  });

  // Editor Tabs
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'contact' | 'social' | 'security'>('info');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [companyName, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [coverPhotos, setCoverPhotos] = useState<string[]>([]);
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // QR & Copy link
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrPng, setQrPng] = useState('');
  const [qrSvg, setQrSvg] = useState('');

  // Check Auth & Fetch Profile
  useEffect(() => {
    const init = async () => {
      setFetching(true);
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();

        if (!authRes.ok || !authData.authenticated) {
          router.replace('/login');
          return;
        }

        if (authData.user.role === 'ADMIN') {
          router.replace('/admin');
          return;
        }

        // Fetch client profile
        const profRes = await fetch('/api/portal/profile');
        const profData = await profRes.json();

        if (profRes.ok && profData.client) {
          const c: ClientData = profData.client;
          setClient(c);
          setLiveData(c);

          setFullName(c.fullName || '');
          setDesignation(c.designation || '');
          setCompany(c.companyName || '');
          setBio(c.bio || '');
          setCategory(c.businessCategory || '');
          setProfilePhoto(c.profilePhoto || '');
          setCompanyLogo(c.companyLogo || '');
          setPhone(c.phone || '');
          setWhatsapp(c.whatsapp || '');
          setEmail(c.email || '');
          setWebsite(c.website || '');
          setAddress(c.address || '');
          setGoogleMapsUrl(c.googleMapsUrl || '');
          setInstagram(c.instagram || '');
          setLinkedin(c.linkedin || '');
          setTwitter(c.twitter || '');
          setFacebook(c.facebook || '');
          setYoutube(c.youtube || '');

          // Cover photos
          if (c.coverPhotos) {
            try {
              const parsed = typeof c.coverPhotos === 'string' ? JSON.parse(c.coverPhotos) : c.coverPhotos;
              setCoverPhotos(Array.isArray(parsed) ? parsed : []);
            } catch {
              setCoverPhotos([]);
            }
          }

          // Custom links
          if (c.customLinks) {
            try {
              const parsed = typeof c.customLinks === 'string' ? JSON.parse(c.customLinks) : c.customLinks;
              setCustomLinks(Array.isArray(parsed) ? parsed : []);
            } catch {
              setCustomLinks([]);
            }
          }

          // Fetch QR
          const qrRes = await fetch(`/api/qr?url=${encodeURIComponent(`${window.location.origin}/${c.slug}`)}`);
          const qrData = await qrRes.json();
          if (qrData.png) setQrPng(qrData.png);
          if (qrData.svg) setQrSvg(qrData.svg);
        }

        // Fetch stats
        const statsRes = await fetch('/api/portal/stats');
        const statsData = await statsRes.json();
        if (statsRes.ok && statsData.stats) {
          setStats(statsData.stats);
        }
      } catch (err) {
        console.error('Portal init error:', err);
      } finally {
        setFetching(false);
      }
    };

    init();
  }, [router]);

  // Sync to Live Preview
  useEffect(() => {
    if (!client) return;
    setLiveData({
      ...client,
      fullName,
      designation,
      companyName,
      bio,
      businessCategory: category,
      profilePhoto,
      companyLogo,
      coverPhotos: JSON.stringify(coverPhotos),
      phone,
      whatsapp,
      email,
      website,
      address,
      googleMapsUrl,
      instagram,
      linkedin,
      twitter,
      facebook,
      youtube,
      customLinks: JSON.stringify(customLinks),
    });
  }, [
    client,
    fullName,
    designation,
    companyName,
    bio,
    category,
    profilePhoto,
    companyLogo,
    coverPhotos,
    phone,
    whatsapp,
    email,
    website,
    address,
    googleMapsUrl,
    instagram,
    linkedin,
    twitter,
    facebook,
    youtube,
    customLinks,
  ]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const copyNfcLink = async () => {
    if (!client) return;
    const url = `${window.location.origin}/${client.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (newPassword && newPassword.length < 6) {
      setSaveError('New password must be at least 6 characters.');
      setActiveTab('security');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSaveError('Passwords do not match.');
      setActiveTab('security');
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, any> = {
        fullName,
        designation,
        companyName,
        bio,
        businessCategory: category,
        profilePhoto,
        companyLogo,
        coverPhotos,
        phone,
        whatsapp,
        email,
        website,
        address,
        googleMapsUrl,
        instagram,
        linkedin,
        twitter,
        facebook,
        youtube,
        customLinks,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setClient(data.client);
        setSaveSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to update profile.');
      }
    } catch {
      setSaveError('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const addCustomLink = () => {
    setCustomLinks((prev) => [
      ...prev,
      { id: 'custom-' + Date.now(), title: '', url: '', icon: 'globe' },
    ]);
  };

  const updateCustomLinkItem = (id: string, field: keyof CustomLink, val: string) => {
    setCustomLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const removeCustomLink = (id: string) => {
    setCustomLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const addCoverPhoto = () => {
    if (!newCoverUrl.trim()) return;
    setCoverPhotos((prev) => [...prev, newCoverUrl.trim()]);
    setNewCoverUrl('');
  };

  const removeCoverPhoto = (idx: number) => {
    setCoverPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#07080B] text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        <span className="text-xs text-zinc-400 font-mono">Loading your card portal...</span>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#07080B] text-slate-100 font-sans antialiased selection:bg-white selection:text-black flex flex-col">
      {/* ------------------------------------------------------------- */}
      {/* Top Header */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#07080B]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white shadow-inner">
            <Sparkles className="w-4 h-4 text-zinc-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {client.fullName}&apos;s Card
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                Active Card Owner
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              /{client.slug}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={copyNfcLink}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-200 transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy NFC Link</span>
              </>
            )}
          </button>

          <Link
            href={`/${client.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <span>View Live Card</span>
            <ExternalLink className="w-3.5 h-3.5 text-black" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* Stats Bar */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b border-white/[0.06] bg-[#0A0C11] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 sm:gap-10">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                Total Card Taps
              </span>
              <span className="text-xl font-bold text-white font-mono">
                {stats.totalViews}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                Taps Today
              </span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {stats.viewsToday}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                This Week
              </span>
              <span className="text-xl font-bold text-zinc-200 font-mono">
                {stats.viewsThisWeek}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {qrPng && (
              <a
                href={qrPng}
                download={`${client.slug}-qr.png`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-300 transition-colors"
              >
                <Download className="w-3 h-3 text-zinc-400" />
                <span>Save QR Code</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Main Studio Body (Split Screen: Form + Live Device Preview) */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Status Banners */}
          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Your profile changes are now saved and live on your NFC card!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {saveError}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#0F1218] rounded-2xl border border-white/10">
            {[
              { id: 'info', label: 'Identity & Bio', icon: User },
              { id: 'photos', label: 'Showcase Photos', icon: ImageIcon },
              { id: 'contact', label: 'Contact & Map', icon: Phone },
              { id: 'social', label: 'Links & Socials', icon: Globe },
              { id: 'security', label: 'Change Password', icon: Lock },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            {/* TAB: Identity & Bio */}
            {activeTab === 'info' && (
              <div className="bg-[#0F1218]/90 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Personal Identity</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Job Designation</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Managing Director"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Seven Stars Logistics"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Business Industry / Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Global Freight & Logistics"
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">About Me / Bio</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a brief intro that visitors see on your card..."
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            )}

            {/* TAB: Photos & Slideshow */}
            {activeTab === 'photos' && (
              <div className="bg-[#0F1218]/90 border border-white/10 rounded-3xl p-6 flex flex-col gap-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-zinc-400" />
                  <span>Profile Photo & Cover Banner Slideshow</span>
                </h3>

                {/* Profile Photo */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Profile Avatar Image URL</label>
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="https://... (Direct image link)"
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Company Logo */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Company Logo URL</label>
                  <input
                    type="text"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    placeholder="https://... (Square or transparent PNG)"
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Cover Photos Slide */}
                <div className="pt-3 border-t border-white/[0.08]">
                  <label className="block text-xs font-semibold text-white mb-1">
                    Work Showcase & Banner Photos (Auto-Slideshow)
                  </label>
                  <p className="text-[11px] text-zinc-400 mb-3">
                    Add 2 or more landscape photos to enable an auto-play crossfade banner carousel on your card.
                  </p>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCoverUrl}
                      onChange={(e) => setNewCoverUrl(e.target.value)}
                      placeholder="Paste image URL (e.g. Unsplash or direct link)"
                      className="flex-1 bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={addCoverPhoto}
                      className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
                    >
                      Add Photo
                    </button>
                  </div>

                  {coverPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {coverPhotos.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-zinc-900"
                        >
                          <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeCoverPhoto(idx)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Contact & Map */}
            {activeTab === 'contact' && (
              <div className="bg-[#0F1218]/90 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>Contact Channels & Office Location</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Website URL</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Office Physical Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Floor, Building, Street, City, Country"
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Google Maps Direct Link</label>
                  <input
                    type="text"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            )}

            {/* TAB: Social & Custom Links */}
            {activeTab === 'social' && (
              <div className="bg-[#0F1218]/90 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <span>Social Media & Custom Links</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                      <span>Instagram URL</span>
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/username"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <LinkedInIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>LinkedIn URL</span>
                    </label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <TwitterXIcon className="w-3.5 h-3.5 text-zinc-100" />
                      <span>X / Twitter URL</span>
                    </label>
                    <input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://x.com/username"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <YouTubeIcon className="w-3.5 h-3.5 text-rose-400" />
                      <span>YouTube Channel URL</span>
                    </label>
                    <input
                      type="text"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      placeholder="https://youtube.com/@channel"
                      className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                {/* Custom Dynamic Links */}
                <div className="pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white">Custom Portfolio & Action Links</span>
                    <button
                      type="button"
                      onClick={addCustomLink}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Link</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {customLinks.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-[#07080B] border border-white/10 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateCustomLinkItem(item.id, 'title', e.target.value)}
                          placeholder="Title (e.g. Booking Calendly)"
                          className="w-1/3 bg-transparent border-b border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                        />
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => updateCustomLinkItem(item.id, 'url', e.target.value)}
                          placeholder="URL (https://...)"
                          className="flex-1 bg-transparent border-b border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomLink(item.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Change Password */}
            {activeTab === 'security' && (
              <div className="bg-[#0F1218]/90 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zinc-400" />
                  <span>Update Portal Login Password</span>
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  You use your registered email (<strong className="text-white">{client.email}</strong>) and password
                  to log in and make changes to this card. Enter a new password below if you wish to change it.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="sticky bottom-4 z-20">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <Save className="w-4 h-4 text-black" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Mobile Preview Frame */}
        <div className="lg:col-span-5 sticky top-24 bg-[#0F1218]/50 p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
          <div className="mb-3 text-center">
            <span className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time NFC Card Preview</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Changes reflect immediately on your live visiting card
            </span>
          </div>

          {liveData && <LivePreviewFrame client={liveData} />}
        </div>
      </main>
    </div>
  );
}
