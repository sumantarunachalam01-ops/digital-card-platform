'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast('Logged out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Create Card', href: '/admin/clients/create', icon: CreditCard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#14161a] border-r border-zinc-800/80 flex flex-col shrink-0 min-h-screen text-zinc-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800/80 gap-3">
        <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 shadow-xs">
          <Sparkles className="w-4 h-4 text-zinc-300" />
        </div>
        <div>
          <span className="font-bold text-base text-zinc-100 tracking-tight">DigitalCard</span>
          <span className="block text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
            Admin Studio
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Management
        </div>

        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="mt-6 px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Quick Links
        </div>

        <Link
          href="/raghupathy.g87"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40 transition-colors group"
        >
          <span>Sample: Raghupathy</span>
          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
        </Link>

        <Link
          href="/arun.kumar"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40 transition-colors group"
        >
          <span>Sample: Arun Kumar</span>
          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
        </Link>
      </div>

      {/* Footer User & Logout */}
      <div className="p-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-white truncate">Administrator</p>
            <p className="text-[11px] text-slate-400 truncate">admin@digitalcard.com</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
