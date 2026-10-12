'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Lock, Mail, Loader2, ArrowRight, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(`Welcome back, ${data.user.name || 'User'}! Redirecting...`);
        const targetUrl = data.redirectTo || (data.role === 'ADMIN' ? '/admin' : '/portal');
        setTimeout(() => {
          router.push(targetUrl);
          router.refresh();
        }, 600);
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch {
      setError('Network error during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#07080B] text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          Unified Access
        </span>
      </div>

      <div className="w-full max-w-md bg-[#0F1218]/90 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white shadow-inner mb-3">
            <Sparkles className="w-6 h-6 text-zinc-200" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign In</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Sign in with your email to manage your digital card profile or access admin controls
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-medium">
            {success}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-zinc-400 hover:text-white transition-colors underline decoration-zinc-600"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Fast Credentials Helper Card */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-300 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <span>Default Access Credentials (Click to fill)</span>
          </div>
          <div className="flex flex-col gap-1.5 text-[11px] font-mono text-zinc-400">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@digitalcard.com');
                setPassword('admin123');
              }}
              className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors text-left flex justify-between items-center cursor-pointer"
            >
              <span><span className="text-zinc-500 font-sans">Admin: </span>admin@digitalcard.com</span>
              <span className="text-zinc-500 text-[10px]">fill</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('sumantarunachalam@gmail.com');
                setPassword('card123');
              }}
              className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors text-left flex justify-between items-center cursor-pointer"
            >
              <span><span className="text-zinc-500 font-sans">Card Owner: </span>sumantarunachalam@gmail.com</span>
              <span className="text-zinc-500 text-[10px]">fill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
