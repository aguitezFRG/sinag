'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth, UserRole } from '@/app/hooks/useAuth';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';

const ROLE_PATHS: Record<string, UserRole[]> = {
  '/student': ['student'],
  '/adviser': ['adviser', 'coordinator', 'admin'],
  '/coordinator': ['coordinator', 'admin'],
  '/admin': ['admin'],
};

function getAllowedRoles(pathname: string): UserRole[] | undefined {
  for (const [prefix, roles] of Object.entries(ROLE_PATHS)) {
    if (pathname.startsWith(prefix)) return roles;
  }
  return undefined;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const allowedRoles = getAllowedRoles(pathname);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0C0B5D] border-t-transparent" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-gray-50">
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
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
