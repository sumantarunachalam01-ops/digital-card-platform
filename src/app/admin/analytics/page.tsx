'use client';

import React, { useEffect, useState } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { useToast } from '@/components/ui/Toast';
import {
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Eye,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    devices: { mobile: number; desktop: number; tablet: number };
    clientStats: {
      id: string;
      slug: string;
      fullName: string;
      companyName: string;
      status: string;
      views: number;
    }[];
  }>({
    totalViews: 0,
    viewsToday: 0,
    viewsThisWeek: 0,
    viewsThisMonth: 0,
    devices: { mobile: 0, desktop: 0, tablet: 0 },
    clientStats: [],
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch {
      showToast('Error loading analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalDeviceCount = (data.devices.mobile + data.devices.desktop + data.devices.tablet) || 1;
  const mobilePct = Math.round((data.devices.mobile / totalDeviceCount) * 100);
  const desktopPct = Math.round((data.devices.desktop / totalDeviceCount) * 100);
  const tabletPct = Math.round((data.devices.tablet / totalDeviceCount) * 100);

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopBar title="Profile Analytics" />

      <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            NFC & QR Tap Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Privacy-conscious telemetry tracking client visits, temporal trends, and mobile vs. desktop distribution.
          </p>
        </div>

        {/* 4 Periodic View Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold">Total Views (All Time)</span>
              <Eye className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-bold text-zinc-100">
              {loading ? '...' : data.totalViews}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Total visitor interactions</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold">Views Today</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">
              {loading ? '...' : data.viewsToday}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Since 00:00 midnight</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold">Views This Week</span>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-bold text-zinc-100">
              {loading ? '...' : data.viewsThisWeek}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Rolling past 7 days</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold">Views This Month</span>
              <BarChart3 className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-bold text-zinc-100">
              {loading ? '...' : data.viewsThisMonth}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Rolling past 30 days</p>
          </div>
        </div>

        {/* Device Breakdown & Top Performing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Type Distribution */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-5">
            <div>
              <h3 className="text-base font-bold text-zinc-100">Device Breakdown</h3>
              <p className="text-xs text-zinc-400">Platform distribution from scans and taps</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Mobile */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                    Mobile (NFC / QR)
                  </span>
                  <span className="text-zinc-400 font-mono">
                    {data.devices.mobile} ({mobilePct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-400 rounded-full transition-all duration-500"
                    style={{ width: `${mobilePct}%` }}
                  />
                </div>
              </div>

              {/* Desktop */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                    Desktop Browser
                  </span>
                  <span className="text-zinc-400 font-mono">
                    {data.devices.desktop} ({desktopPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-500 rounded-full transition-all duration-500"
                    style={{ width: `${desktopPct}%` }}
                  />
                </div>
              </div>

              {/* Tablet */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Tablet className="w-3.5 h-3.5 text-purple-400" />
                    Tablet Devices
                  </span>
                  <span className="text-slate-400 font-mono">
                    {data.devices.tablet} ({tabletPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${tabletPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 mt-auto">
              Mobile access accounts for majority of traffic, aligning directly with on-the-go physical NFC card tapping and QR scans.
            </div>
          </div>

          {/* Client Performance Leaderboard */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Card Traffic Rankings</h3>
                <p className="text-xs text-slate-400">Total views per client visiting card</p>
              </div>
              <button
                onClick={fetchAnalytics}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh Analytics"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">URL Slug</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Loading card statistics...
                      </td>
                    </tr>
                  ) : data.clientStats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No view records yet.
                      </td>
                    </tr>
                  ) : (
                    data.clientStats.map((client) => (
                      <tr key={client.id} className="hover:bg-zinc-850/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-zinc-100">
                          <Link
                            href={`/${client.slug}`}
                            target="_blank"
                            className="hover:text-white flex items-center gap-1.5"
                          >
                            <span>{client.fullName}</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500" />
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400">{client.companyName}</td>
                        <td className="py-2.5 px-3 font-mono text-zinc-300">/{client.slug}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              client.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {client.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                          {client.views}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
