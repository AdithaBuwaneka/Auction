'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BackendStatusBanner from '@/components/BackendStatusBanner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <BackendStatusBanner />
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
