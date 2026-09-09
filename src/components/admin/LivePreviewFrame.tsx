'use client';

import React from 'react';
import { ClientData } from '@/types';
import DigitalCard from '@/components/card/DigitalCard';
import { Smartphone, ExternalLink } from 'lucide-react';

interface LivePreviewFrameProps {
  client: ClientData;
  baseUrl?: string;
}

export default function LivePreviewFrame({ client, baseUrl }: LivePreviewFrameProps) {
  const previewSlug = client.slug || 'username';

  return (
    <div className="flex flex-col items-center justify-start h-full py-2">
      {/* Top Device Header / Mode Info */}
      <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
          <Smartphone className="w-4 h-4 text-zinc-400" />
          <span>Live Mobile Preview</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[170px]">
          /{previewSlug}
        </span>
      </div>

      {/* Mobile Device Frame Mockup */}
      <div className="relative w-[340px] sm:w-[360px] h-[680px] bg-zinc-900 rounded-[48px] p-3 shadow-xl border-4 border-zinc-800 flex flex-col overflow-hidden">
        {/* Hardware Notch / Dynamic Island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-950 rounded-full z-30 flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900/90 border border-zinc-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600/40" />
        </div>

        {/* Screen Container */}
        <div className="w-full h-full bg-[#f4f5f7] rounded-[38px] overflow-y-auto relative custom-scrollbar">
          {/* Renders the EXACT SAME centralized template */}
          <DigitalCard client={client} baseUrl={baseUrl} isPreview={true} />
        </div>

        {/* Home Bar Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-600/50 rounded-full z-30 pointer-events-none" />
      </div>

      {/* Helper Note */}
      <p className="text-[11px] text-slate-500 mt-3 text-center max-w-[320px]">
        This preview renders the <span className="text-slate-300 font-medium">identical centralized DigitalCard template</span> that visitors see when tapping the physical NFC card or scanning the QR code.
      </p>
    </div>
  );
}
