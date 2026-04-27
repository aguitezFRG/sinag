'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0C0B5D] border-t-transparent" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {user && (
          <Sidebar
            role={user.role}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          {user && (
            <Header
              user={user}
              onMenuClick={() => setMobileOpen(true)}
              onLogout={logout}
            />
          )}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
