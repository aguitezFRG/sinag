'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/app/hooks/useAuth';
import {
  Home,
  MessageSquare,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  /* Student */
  { label: 'Dashboard', href: '/student', icon: <Home className="w-5 h-5" />, roles: ['student'] },
  { label: 'AI Consultation', href: '/student/ai-chat', icon: <MessageSquare className="w-5 h-5" />, roles: ['student'] },

  /* Adviser */
  { label: 'Dashboard', href: '/adviser', icon: <Home className="w-5 h-5" />, roles: ['adviser'] },
  { label: 'AI Consultation', href: '/adviser/ai-chat', icon: <MessageSquare className="w-5 h-5" />, roles: ['adviser'] },

  /* Coordinator */
  { label: 'Dashboard', href: '/coordinator', icon: <Home className="w-5 h-5" />, roles: ['coordinator'] },

  /* Admin */
  { label: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" />, roles: ['admin'] },
];

interface SidebarProps {
  role: UserRole;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ role, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#0C0B5D] text-white flex-col sticky top-0 h-screen">
        {/* SINAG Logo */}
        <div className="p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 overflow-hidden bg-white relative ring-2 ring-white/20">
              <Image src="/images/sesam-logo.png" alt="SESAM seal" fill style={{ objectFit: 'contain' }} sizes="56px" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl text-white font-bold leading-tight">SINAG</h1>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/60">A SESAM Initiative</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <ul className="space-y-1">
            {(() => {
              const activeHref = items.reduce<string | null>((best, it) => {
                if (pathname === it.href || pathname.startsWith(`${it.href}/`)) {
                  if (!best || it.href.length > best.length) return it.href;
                }
                return best;
              }, null);
              return items.map((item) => {
              const isActive = item.href === activeHref;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                      isActive
                        ? 'bg-white text-[#0C0B5D] font-semibold'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            });
            })()}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCloseMobile}
          />
          
          {/* Mobile Sidebar */}
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#0C0B5D] text-white flex flex-col shadow-2xl">
            {/* SINAG Logo + Close Button */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white relative ring-2 ring-white/20">
                  <Image src="/images/sesam-logo.png" alt="SESAM seal" fill style={{ objectFit: 'contain' }} sizes="48px" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg text-white font-bold leading-tight">SINAG</h1>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">A SESAM Initiative</p>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
              <ul className="space-y-1">
                {(() => {
                  const activeHref = items.reduce<string | null>((best, it) => {
                    if (pathname === it.href || pathname.startsWith(`${it.href}/`)) {
                      if (!best || it.href.length > best.length) return it.href;
                    }
                    return best;
                  }, null);
                  return items.map((item) => {
                  const isActive = item.href === activeHref;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                          isActive
                            ? 'bg-white text-[#0C0B5D] font-semibold'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                  });
                })()}
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
