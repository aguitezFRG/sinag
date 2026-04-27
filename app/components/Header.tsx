'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User } from '@/app/hooks/useAuth';
import { Bell } from 'lucide-react';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  user: User | null;
  onMenuClick: () => void;
  onLogout: () => void;
}

export default function Header({ user, onMenuClick, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const initials = user
    ? `${user.profile.firstName?.[0] ?? ''}${user.profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  const fullName = user
    ? `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim()
    : 'User';

  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';

  // Get notifications path based on role
  const getNotificationsPath = () => {
    switch (user?.role) {
      case 'student':
        return '/notifications';
      case 'adviser':
        return '/adviser/notifications';
      case 'coordinator':
        return '/coordinator/notifications';
      case 'admin':
        return '/admin/notifications';
      default:
        return '/notifications';
    }
  };

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  /* Close dropdown on Escape */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [menuOpen]);

  const handleLogout = useCallback(() => {
    setMenuOpen(false);
    onLogout();
  }, [onLogout]);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
      {/* Left: Menu button (mobile) + SINAG branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          aria-label="Open navigation menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* SINAG Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#0C0B5D] rounded-lg overflow-hidden p-1.5 flex items-center justify-center">
            <Image src="/images/logo.png" alt="SINAG" width={40} height={40} style={{ width: '40px', height: '40px' }} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-[#0C0B5D]">SINAG</h1>
            <p className="text-xs text-gray-500">SESAM Intelligent Natural-language Advising Guide</p>
          </div>
        </div>
      </div>

      {/* Right: notifications + user dropdown */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notification Bell */}
        <div className="relative">
          <Link
            href={getNotificationsPath()}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors block"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {/* Notification badge - static for now, can be dynamic */}
            <span className="absolute top-1 right-1 bg-[#DC2626] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Link>
        </div>

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-lg p-1 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            <div className="hidden sm:block text-right">
              <div className="text-sm text-gray-900 font-medium">{fullName}</div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-0.5">
                {roleLabel}
              </div>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0C0B5D] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <span className="mt-1 inline-block text-xs bg-[#0C0B5D]/10 text-[#0C0B5D] px-2 py-0.5 rounded font-medium">
                  {roleLabel}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
