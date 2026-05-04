'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const router = useRouter();

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, loading]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      const dashboardPath = `/${user.role}`;
      router.push(dashboardPath);
    } catch {
      // error handled in hook
    }
  };

  const handleSSOLogin = () => {
    // For demo purposes, navigate to student dashboard
    // In production, this would redirect to UPLB SSO
    router.push('/student');
  };

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  }, [onClose, loading]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md flex max-h-[95vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-1.5 text-white/90 hover:bg-white/20 transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header strip — logo inside card */}
        <div className="flex flex-col items-center bg-[#0C0B5D] px-6 pt-6 pb-5 text-white text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow ring-2 ring-white/20">
            <Image
              src="/images/sesam-logo.png"
              alt="SESAM seal"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
            A SESAM Initiative · UPLB
          </p>
          <h1 className="mt-1 text-xl font-bold">Welcome back to SINAG</h1>
          <p className="mt-0.5 text-xs text-white/80">Sign in to access your SESAM graduate workspace</p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* SSO Button */}
            <button
              onClick={handleSSOLogin}
              disabled={loading}
              className="w-full bg-[#0C0B5D] text-white py-3 rounded-xl hover:bg-[#0a0949] transition-colors mb-4 font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
              Sign in with UPLB SSO
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                    placeholder="your.email@uplb.edu.ph"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message — compact inline */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0C0B5D] focus:ring-[#0C0B5D]" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="#" className="text-sm text-[#0C0B5D] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0C0B5D] text-white py-3 rounded-xl hover:bg-[#0a0949] transition-colors font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner size={20} className="text-white" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer — sticky outside scroll area */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-center text-xs text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" onClick={onClose} className="font-semibold text-[#0C0B5D] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
