'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@digitalcard.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace('/admin');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Login successful. Welcome back!');
        router.push('/admin');
        router.refresh();
      } else {
        showToast(data.error || 'Invalid credentials.', 'error');
      }
    } catch {
      showToast('Network error during login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#111317] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 shadow-xs mb-3">
            <Sparkles className="w-6 h-6 text-zinc-300" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">DigitalCard Admin</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sign in to manage digital visiting cards and NFC card profiles
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@digitalcard.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 font-semibold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 text-zinc-800" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-300 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Default Admin Credentials</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">
            admin@digitalcard.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
