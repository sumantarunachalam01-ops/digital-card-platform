'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ClientData, CustomLink } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building2,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  Shield,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  LinkedInIcon,
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  TwitterXIcon,
} from '@/components/icons/BrandIcons';

interface ClientFormProps {
  initialData?: Partial<ClientData>;
  isEditing?: boolean;
  clientId?: string;
  onChange: (data: ClientData) => void;
  onSubmit: (data: ClientData) => Promise<void>;
  loading?: boolean;
}

export default function ClientForm({
  initialData,
  isEditing = false,
  clientId,
  onChange,
  onSubmit,
  loading = false,
}: ClientFormProps) {
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ClientData>({
    slug: initialData?.slug || '',
    fullName: initialData?.fullName || '',
    designation: initialData?.designation || '',
    companyName: initialData?.companyName || '',
    bio: initialData?.bio || '',
    profilePhoto: initialData?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    companyLogo: initialData?.companyLogo || '',
    coverPhotos: initialData?.coverPhotos || '[]',
    phone: initialData?.phone || '',
    whatsapp: initialData?.whatsapp || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    googleMapsUrl: initialData?.googleMapsUrl || '',
    instagram: initialData?.instagram || '',
    facebook: initialData?.facebook || '',
    linkedin: initialData?.linkedin || '',
    youtube: initialData?.youtube || '',
    twitter: initialData?.twitter || '',
    companyDescription: initialData?.companyDescription || '',
    businessCategory: initialData?.businessCategory || '',
    customLinks: initialData?.customLinks || '[]',
    status: (initialData?.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
  });

  const [coverPhotosList, setCoverPhotosList] = useState<string[]>(() => {
    if (!initialData?.coverPhotos) return [];
    if (Array.isArray(initialData.coverPhotos)) return initialData.coverPhotos;
    try {
      const parsed = JSON.parse(initialData.coverPhotos);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return typeof initialData.coverPhotos === 'string' && initialData.coverPhotos.trim()
        ? [initialData.coverPhotos.trim()]
        : [];
    }
  });
  const [newCoverPhotoInput, setNewCoverPhotoInput] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);

  const [customLinksList, setCustomLinksList] = useState<CustomLink[]>(() => {
    if (!initialData?.customLinks) return [];
    if (Array.isArray(initialData.customLinks)) return initialData.customLinks;
    try {
      return JSON.parse(initialData.customLinks);
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'location' | 'social' | 'business' | 'url'>('personal');
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Sync state upward to parent live preview on change
  const updateField = (field: keyof ClientData, value: any) => {
    const updated = { ...formDataRef.current, [field]: value };
    formDataRef.current = updated;
    setFormData(updated);
    onChange(updated);
  };

  // Helper functions for Cover / Work Showcase Photos Slide
  const updateCoverPhotos = (newList: string[]) => {
    setCoverPhotosList(newList);
    const jsonString = JSON.stringify(newList);
    updateField('coverPhotos', jsonString);
  };

  const addCoverPhoto = (url: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    const updated = [...coverPhotosList, cleanUrl];
    updateCoverPhotos(updated);
    setNewCoverPhotoInput('');
    showToast('Photo added to banner slide');
  };

  const removeCoverPhoto = (index: number) => {
    const updated = coverPhotosList.filter((_, idx) => idx !== index);
    updateCoverPhotos(updated);
    showToast('Photo removed from banner');
  };

  const moveCoverPhoto = (from: number, to: number) => {
    if (to < 0 || to >= coverPhotosList.length) return;
    const copy = [...coverPhotosList];
    const item = copy.splice(from, 1)[0];
    copy.splice(to, 0, item);
    updateCoverPhotos(copy);
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (data.url) {
        addCoverPhoto(data.url);
      } else {
        showToast('Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  // Helper functions for Custom Links & Channels
  const updateCustomLinks = (newList: CustomLink[]) => {
    setCustomLinksList(newList);
    const jsonString = JSON.stringify(newList);
    updateField('customLinks', jsonString);
  };

  const addCustomLink = () => {
    const newItem: CustomLink = {
      id: 'custom-' + Date.now(),
      title: '',
      url: '',
      icon: 'globe',
    };
    updateCustomLinks([...customLinksList, newItem]);
  };

  const removeCustomLink = (id: string) => {
    const itemToDelete = customLinksList.find((item) => item.id === id);
    updateCustomLinks(customLinksList.filter((item) => item.id !== id));
    showToast(`${itemToDelete?.title || 'Custom link'} deleted`);
  };

  const updateCustomLinkItem = (id: string, field: keyof CustomLink, val: string) => {
    updateCustomLinks(
      customLinksList.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Check slug availability in real time
  const checkSlug = async (slugToTest: string) => {
    const clean = slugToTest.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!clean) {
      setSlugStatus({ checking: false });
      return;
    }

    setSlugStatus({ checking: true });
    try {
      const url = `/api/clients/check-slug?slug=${encodeURIComponent(clean)}${
        clientId ? `&excludeId=${clientId}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();
      setSlugStatus({
        checking: false,
        available: data.available,
        message: data.message,
      });
    } catch {
      setSlugStatus({ checking: false, available: false, message: 'Could not verify slug.' });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    updateField('slug', rawVal);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      checkSlug(rawVal);
    }, 400);
  };

  // Initial slug check if editing
  useEffect(() => {
    if (initialData?.slug) {
      checkSlug(initialData.slug);
    }
  }, []);

  // Image Upload handler
  const handleFileUpload = async (file: File, target: 'profilePhoto' | 'companyLogo') => {
    const isPhoto = target === 'profilePhoto';
    if (isPhoto) setUploadingPhoto(true);
    else setUploadingLogo(true);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();

      if (data.url) {
        updateField(target, data.url);
        showToast(`${isPhoto ? 'Profile photo' : 'Company logo'} uploaded successfully`);
      } else {
        showToast('Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      if (isPhoto) setUploadingPhoto(false);
      else setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      showToast('Full name is required', 'error');
      setActiveTab('personal');
      return;
    }

    if (!formData.slug.trim()) {
      showToast('Unique profile slug is required', 'error');
      setActiveTab('url');
      return;
    }

    if (slugStatus.available === false) {
      showToast('Please fix the username slug before saving', 'error');
      setActiveTab('url');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-slate-100">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
        {[
          { id: 'personal', label: 'Personal', icon: User },
          { id: 'contact', label: 'Contact', icon: Phone },
          { id: 'location', label: 'Location', icon: MapPin },
          { id: 'social', label: 'Socials', icon: Globe },
          { id: 'business', label: 'Business', icon: Building2 },
          { id: 'url', label: 'URL & Status', icon: LinkIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Personal Information */}
      {activeTab === 'personal' && (
        <div className="flex flex-col gap-4 p-5 bg-zinc-900/60 rounded-3xl border border-zinc-800/80">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-400" />
            Personal Information
          </h3>

          {/* Profile Photo */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Profile Photo URL or Upload
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.profilePhoto || ''}
                onChange={(e) => updateField('profilePhoto', e.target.value)}
                placeholder="https://... or upload below"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-all active:scale-95 shrink-0">
                {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'profilePhoto');
                  }}
                />
              </label>
              {formData.profilePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    updateField('profilePhoto', '');
                    showToast('Profile photo removed');
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all active:scale-95 shrink-0 cursor-pointer"
                  title="Delete Profile Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Quick Preset Avatars */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500">Presets:</span>
              {[
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
              ].map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateField('profilePhoto', presetUrl)}
                  className="w-7 h-7 rounded-full overflow-hidden border border-zinc-700 hover:border-zinc-400 transition-all hover:scale-110 shrink-0"
                >
                  <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Work Showcase & Cover Photos (Photo Slide) */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-200">
                  Job & Work Showcase Photos (Banner Slide)
                </label>
                <p className="text-[11px] text-zinc-400">
                  Add 1 or more photos describing your job, projects, or work portfolio. If 2 or more photos are added, they form an interactive photo slide carousel in the header banner.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                {coverPhotosList.length} {coverPhotosList.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {/* Input & Upload Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
              <input
                type="text"
                value={newCoverPhotoInput}
                onChange={(e) => setNewCoverPhotoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCoverPhoto(newCoverPhotoInput);
                  }
                }}
                placeholder="Paste photo URL (https://...) to describe job/work..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => addCoverPhoto(newCoverPhotoInput)}
                  disabled={!newCoverPhotoInput.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-750 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none border border-zinc-600/80 text-xs font-semibold text-zinc-100 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-all active:scale-95 shrink-0">
                  {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Quick Presets based on industries */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[11px] text-zinc-500 font-medium mr-1">Job Presets:</span>
              {[
                { label: 'Logistics & Cargo', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80' },
                { label: 'Freight Fleet', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1000&auto=format&fit=crop&q=80' },
                { label: 'Port & Shipping', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1000&auto=format&fit=crop&q=80' },
                { label: 'Modern Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80' },
                { label: 'Tech & Architecture', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addCoverPhoto(preset.url)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 transition-all active:scale-95"
                >
                  + {preset.label}
                </button>
              ))}
            </div>

            {/* Slide List / Thumbnails */}
            {coverPhotosList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
                {coverPhotosList.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col"
                  >
                    <div className="h-24 w-full relative overflow-hidden bg-zinc-900">
                      <img
                        src={photoUrl}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold border border-white/10">
                        Slide {idx + 1} {idx === 0 ? '(Cover)' : ''}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCoverPhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                        title="Delete photo from slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-zinc-900/90 border-t border-zinc-800 text-[11px] text-zinc-400">
                      <span className="truncate max-w-[120px] font-mono text-[10px]" title={photoUrl}>
                        {photoUrl.startsWith('data:') ? 'Uploaded base64' : photoUrl.split('/').pop()?.split('?')[0] || photoUrl}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveCoverPhoto(idx, idx - 1)}
                          className="p-1 rounded hover:bg-zinc-800 disabled:opacity-20 text-zinc-300 transition-colors"
                          title="Move earlier"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === coverPhotosList.length - 1}
                          onClick={() => moveCoverPhoto(idx, idx + 1)}
                          className="p-1 rounded hover:bg-zinc-800 disabled:opacity-20 text-zinc-300 transition-colors"
                          title="Move later"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2.5 p-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 text-center">
                <p className="text-[11px] text-zinc-400">
                  No cover photos added yet. A minimal slate pattern is currently shown. Add 1 or more photos above to describe the user's job and work!
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="e.g. Raghupathy G"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Designation & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Designation / Job Title
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => updateField('designation', e.target.value)}
                placeholder="e.g. Senior Operations Manager"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="e.g. ABC Logistics"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Bio / About */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Bio / About
            </label>
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Brief professional background, leadership highlights, or services offered..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Tab: Contact Information */}
      {activeTab === 'contact' && (
        <div className="flex flex-col gap-4 p-5 bg-zinc-900/60 rounded-3xl border border-zinc-800/80">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Phone Number (Calls)
                </label>
                {formData.phone && (
                  <button
                    type="button"
                    onClick={() => {
                      updateField('phone', '');
                      showToast('Phone number deleted');
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 349-8821"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  WhatsApp Number
                </label>
                {formData.whatsapp && (
                  <button
                    type="button"
                    onClick={() => {
                      updateField('whatsapp', '');
                      showToast('WhatsApp number deleted');
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder="+15553498821 (with country code)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Email Address
                </label>
                {formData.email && (
                  <button
                    type="button"
                    onClick={() => {
                      updateField('email', '');
                      showToast('Email address deleted');
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="contact@company.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Website URL</span>
                  {formData.website ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">Active</span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-medium">Deleted / Not on card</span>
                  )}
                </label>
                {formData.website && (
                  <button
                    type="button"
                    onClick={() => {
                      updateField('website', '');
                      showToast('Website URL deleted from profile');
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-semibold transition-all cursor-pointer"
                    title="Delete Website URL"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete URL</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://company.com"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
                {formData.website && (
                  <a
                    href={formData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors shrink-0"
                    title="Test Website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Location */}
      {activeTab === 'location' && (
        <div className="flex flex-col gap-4 p-5 bg-zinc-900/60 rounded-3xl border border-zinc-800/80">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            Physical Address & Navigation
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Office / Business Address
              </label>
              {formData.address && (
                <button
                  type="button"
                  onClick={() => {
                    updateField('address', '');
                    showToast('Address cleared');
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={formData.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Suite 400, 100 Main Street, Metropolis, NY 10001"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Google Maps Link</span>
                {formData.googleMapsUrl ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">Active</span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-medium">Deleted / Fallback to address</span>
                )}
              </label>
              {formData.googleMapsUrl && (
                <button
                  type="button"
                  onClick={() => {
                    updateField('googleMapsUrl', '');
                    showToast('Google Maps URL deleted from profile');
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-semibold transition-all cursor-pointer"
                  title="Delete Google Maps Link"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete URL</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={formData.googleMapsUrl || ''}
                onChange={(e) => updateField('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
              {formData.googleMapsUrl && (
                <a
                  href={formData.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors shrink-0"
                  title="Test Maps Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <span className="block text-[11px] text-zinc-500 mt-1">
              If deleted or left blank, Google Maps will automatically search using the address text above.
            </span>
          </div>
        </div>
      )}

      {/* Tab: Social Media */}
      {activeTab === 'social' && (
        <div className="flex flex-col gap-4 p-5 bg-zinc-900/60 rounded-3xl border border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-400" />
                Social Media Profiles & Channels
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                If the client does not have a URL, click <span className="text-rose-400 font-semibold">Delete URL</span> to completely remove it from the digital card.
              </p>
            </div>
          </div>

          {/* Standard Social Platforms with Delete Options */}
          <div className="flex flex-col gap-3">
            {[
              {
                field: 'linkedin' as const,
                label: 'LinkedIn Profile',
                icon: LinkedInIcon,
                iconColor: 'text-zinc-400',
                placeholder: 'https://linkedin.com/in/username',
              },
              {
                field: 'instagram' as const,
                label: 'Instagram Profile',
                icon: InstagramIcon,
                iconColor: 'text-pink-400',
                placeholder: 'https://instagram.com/username',
              },
              {
                field: 'twitter' as const,
                label: 'X / Twitter Profile',
                icon: TwitterXIcon,
                iconColor: 'text-zinc-400',
                placeholder: 'https://x.com/username',
              },
              {
                field: 'facebook' as const,
                label: 'Facebook Profile',
                icon: FacebookIcon,
                iconColor: 'text-zinc-400',
                placeholder: 'https://facebook.com/username',
              },
              {
                field: 'youtube' as const,
                label: 'YouTube Channel',
                icon: YouTubeIcon,
                iconColor: 'text-red-500',
                placeholder: 'https://youtube.com/@channel',
              },
            ].map((platform) => {
              const hasUrl = Boolean(formData[platform.field]);
              return (
                <div
                  key={platform.field}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    hasUrl
                      ? 'bg-zinc-950 border-zinc-800'
                      : 'bg-zinc-950/40 border-dashed border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <platform.icon className={`w-4 h-4 ${platform.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-200 truncate">
                            {platform.label}
                          </span>
                          {hasUrl ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium shrink-0">
                              Active on Card
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 font-medium shrink-0">
                              Deleted / Not on Card
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          updateField(platform.field, '');
                          showToast(`${platform.label} deleted from card`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
                        title={`Delete ${platform.label}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete URL</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          updateField(platform.field, platform.placeholder.split('username')[0].split('@')[0]);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-medium transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add URL</span>
                      </button>
                    )}
                  </div>

                  {hasUrl && (
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-zinc-900">
                      <input
                        type="url"
                        value={formData[platform.field] || ''}
                        onChange={(e) => updateField(platform.field, e.target.value)}
                        placeholder={platform.placeholder}
                        className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                      />
                      <a
                        href={formData[platform.field] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors shrink-0"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ----------------------------------------------------------- */}
          {/* Dynamic Custom Links & Channels Builder */}
          {/* ----------------------------------------------------------- */}
          <div className="pt-4 mt-2 border-t border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Custom Links & Channels</span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Add any other platform: GitHub, Discord, Telegram, TikTok, Behance, Medium, Calendly, Portfolio, etc.
                </p>
              </div>
              <button
                type="button"
                onClick={addCustomLink}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/80 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Link</span>
              </button>
            </div>

            {/* Empty State */}
            {customLinksList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center">
                <p className="text-xs text-zinc-400">
                  No custom channels added. Click <span className="text-zinc-200 font-medium">+ Add Custom Link</span> to add GitHub, Discord, Telegram, or appointment links.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {customLinksList.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                  >
                    {/* Icon Selection */}
                    <div className="sm:w-36 shrink-0">
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                        Platform / Icon
                      </label>
                      <select
                        value={item.icon || 'globe'}
                        onChange={(e) => updateCustomLinkItem(item.id, 'icon', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
                      >
                        <option value="globe">Globe / Web</option>
                        <option value="github">GitHub</option>
                        <option value="telegram">Telegram</option>
                        <option value="discord">Discord</option>
                        <option value="tiktok">TikTok</option>
                        <option value="behance">Behance</option>
                        <option value="medium">Medium</option>
                        <option value="calendar">Calendly / Booking</option>
                      </select>
                    </div>

                    {/* Label / Column Name */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                        Label / Column Name
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => updateCustomLinkItem(item.id, 'title', e.target.value)}
                        placeholder="e.g., GitHub Portfolio, Book a Call"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                      />
                    </div>

                    {/* URL */}
                    <div className="flex-[1.5] min-w-0">
                      <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                        Destination URL
                      </label>
                      <input
                        type="url"
                        value={item.url || ''}
                        onChange={(e) => updateCustomLinkItem(item.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                      />
                    </div>

                    {/* Remove button */}
                    <div className="self-end sm:self-center sm:pt-4">
                      <button
                        type="button"
                        onClick={() => removeCustomLink(item.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
                        title="Delete Link"
                        aria-label="Delete Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Business Information */}
      {activeTab === 'business' && (
        <div className="flex flex-col gap-4 p-5 bg-slate-900/60 rounded-3xl border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Optional Business Information
          </h3>

          {/* Company Logo */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Company Logo URL or Upload
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.companyLogo || ''}
                onChange={(e) => updateField('companyLogo', e.target.value)}
                placeholder="https://... or upload"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-all active:scale-95 shrink-0">
                {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'companyLogo');
                  }}
                />
              </label>
              {formData.companyLogo && (
                <button
                  type="button"
                  onClick={() => {
                    updateField('companyLogo', '');
                    showToast('Company logo removed');
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all active:scale-95 shrink-0 cursor-pointer"
                  title="Delete Company Logo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Business Category
            </label>
            <input
              type="text"
              value={formData.businessCategory || ''}
              onChange={(e) => updateField('businessCategory', e.target.value)}
              placeholder="e.g. Logistics & Supply Chain, Real Estate, Legal Advisory"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Company Description
            </label>
            <textarea
              rows={2}
              value={formData.companyDescription || ''}
              onChange={(e) => updateField('companyDescription', e.target.value)}
              placeholder="Short description of the company operations, products, or vision..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>
      )}

      {/* Tab: URL & Status */}
      {activeTab === 'url' && (
        <div className="flex flex-col gap-4 p-5 bg-zinc-900/60 rounded-3xl border border-zinc-800/80">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-zinc-400" />
            Profile URL Slug & Status
          </h3>

          {/* Unique Slug */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Unique Profile Slug <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-mono select-none">
                mydomain.com/
              </span>
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="e.g. raghupathy.g87"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-500 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {slugStatus.checking && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  {!slugStatus.checking && slugStatus.available === true && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {!slugStatus.checking && slugStatus.available === false && (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Availability feedback message as specified in requirement 4 */}
            {slugStatus.message && (
              <div
                className={`mt-1.5 text-xs font-medium flex items-center gap-1.5 ${
                  slugStatus.available ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span>{slugStatus.message}</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              This permanent slug will be encoded in the QR code and programmed into the physical NFC card.
            </p>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Card Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateField('status', 'ACTIVE')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  formData.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active (Publicly Visible)</span>
              </button>

              <button
                type="button"
                onClick={() => updateField('status', 'INACTIVE')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  formData.status === 'INACTIVE'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Inactive (Unavailable)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit / Save Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400">
          Changes reflect in real time on the live preview frame.
        </div>
        <button
          type="submit"
          disabled={loading || slugStatus.available === false}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 text-xs font-semibold shadow-sm active:scale-95 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-zinc-800" />
              <span>{isEditing ? 'Save Changes' : 'Create Digital Card'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
