'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { useToast } from '@/components/ui/Toast';
import { Settings, Shield, Lock, Globe, Sparkles, Check, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [brandName, setBrandName] = useState('DigitalCard');
  const [supportEmail, setSupportEmail] = useState('support@digitalcard.com');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setBrandName(data.settings.brandName || 'DigitalCard');
          setSupportEmail(data.settings.supportEmail || 'support@digitalcard.com');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { brandName, supportEmail };
      if (newPassword) {
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Settings saved successfully');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      } else {
        showToast(data.error || 'Failed to update settings', 'error');
      }
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar title="Platform Settings" />

      <div className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto flex flex-col gap-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Settings & Branding Configuration
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize platform white-label branding, administrative email, and update admin credentials.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          {/* Brand Customization */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              Brand & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Platform Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="DigitalCard"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
                <span className="block text-[11px] text-zinc-500 mt-1">
                  Shown in page headers and footer credits on public cards.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@digitalcard.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Admin Credentials */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Security & Password
            </h3>
            <p className="text-xs text-zinc-400 -mt-2">
              Leave these fields blank if you do not wish to change your admin password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-800" /> : <Check className="w-4 h-4 text-zinc-800" />}
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
