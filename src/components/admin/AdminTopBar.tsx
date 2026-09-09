'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdminTopBarProps {
  title?: string;
}

export default function AdminTopBar({ title = 'Dashboard' }: AdminTopBarProps) {
  return (
    <header className="h-16 bg-[#14161a]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-zinc-100">{title}</h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/80 text-[11px] font-medium text-zinc-300">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Centralized Dynamic Engine
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/arun.kumar"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-300 hover:text-white transition-all active:scale-95"
        >
          <span>View Sample Card</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </Link>
      </div>
    </header>
  );
}
