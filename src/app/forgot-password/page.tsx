'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, KeyRound, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receivedCode, setReceivedCode] = useState('');

  // Step 1: Request Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReceivedCode(data.code || '');
        setCode(data.code || '');
        setStep('reset');
        setSuccess('Reset code generated successfully! Enter your new password below.');
      } else {
        setError(data.error || 'Could not find an account with this email.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(data.error || 'Failed to reset password. Please check your code.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#07080B] text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Back to Login Link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          Security
        </span>
      </div>

      <div className="w-full max-w-md bg-[#0F1218]/90 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white shadow-inner mb-3">
            <KeyRound className="w-6 h-6 text-zinc-200" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {step === 'request' ? 'Reset Password' : 'Set New Password'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            {step === 'request'
              ? 'Enter your registered email address to receive a secure reset code'
              : 'Enter the verification code and choose a new password'}
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

        {/* Code Banner */}
        {receivedCode && (
          <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.05] border border-emerald-500/30 text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Your 6-Digit Reset Code:
            </span>
            <span className="text-xl font-mono font-bold text-emerald-400 tracking-widest">
              {receivedCode}
            </span>
          </div>
        )}

        {step === 'request' ? (
          /* Step 1 Form */
          <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Registered Email
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2 Form */
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                6-Digit Reset Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                New Password (Min 6 chars)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#07080B] border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Update Password & Login</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
