'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { ToastProvider } from '@/components/ui/Toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#111317] text-zinc-100 flex font-sans antialiased selection:bg-zinc-750 selection:text-white">
        {!isLoginPage && <AdminSidebar />}
        <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
