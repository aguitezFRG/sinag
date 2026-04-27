'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/app/hooks/useAuth';
import {
  Home,
  FileText,
  MessageSquare,
  Bell,
  GraduationCap,
  Users,
  Settings,
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
  { label: 'My Advising Plan', href: '/student/workflow', icon: <FileText className="w-5 h-5" />, roles: ['student'] },
  { label: 'AI Consultation', href: '/student/ai-chat', icon: <MessageSquare className="w-5 h-5" />, roles: ['student'] },
  { label: 'Documents', href: '/student/documents', icon: <GraduationCap className="w-5 h-5" />, roles: ['student'] },

  /* Adviser */
  { label: 'Dashboard', href: '/adviser', icon: <Home className="w-5 h-5" />, roles: ['adviser'] },
  { label: 'Advisees', href: '/adviser/students', icon: <Users className="w-5 h-5" />, roles: ['adviser'] },
  { label: 'Reviews', href: '/adviser/reviews', icon: <FileText className="w-5 h-5" />, roles: ['adviser'] },

  /* Coordinator */
  { label: 'Dashboard', href: '/coordinator', icon: <Home className="w-5 h-5" />, roles: ['coordinator'] },
  { label: 'Students', href: '/coordinator/workflows', icon: <Users className="w-5 h-5" />, roles: ['coordinator'] },
  { label: 'Analytics', href: '/coordinator/analytics', icon: <Bell className="w-5 h-5" />, roles: ['coordinator'] },

  /* Admin */
  { label: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" />, roles: ['admin'] },
  { label: 'User Management', href: '/admin/users', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: <FileText className="w-5 h-5" />, roles: ['admin'] },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" />, roles: ['admin'] },
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
      <aside className="hidden md:flex fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-[#0C0B5D] text-white flex-col">
        {/* SINAG Logo */}
        <div className="p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex-shrink-0 overflow-hidden bg-white flex items-center justify-center">
              <Image src="/images/logo.png" alt="SINAG" width={40} height={40} style={{ width: '40px', height: '40px' }} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl text-white font-bold">SINAG</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            })}
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
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <Image src="/images/logo.png" alt="SINAG" width={40} height={40} style={{ width: '40px', height: '40px' }} />
                </div>
                <h1 className="text-lg text-white font-bold">SINAG</h1>
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
                {items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                })}
              </ul>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
