'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle, X } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [program, setProgram] = useState('');
  const { register, loading, error } = useAuth();
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
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const payload: Parameters<typeof register>[0] = {
        email,
        password,
        firstName,
        lastName,
        role: 'student',
      };
      payload.studentNumber = studentNumber;
      payload.program = program;
      const user = await register(payload);
      router.push(`/${user.role}`);
    } catch {
      // error handled in hook
    }
  };

  const handleSSORegister = () => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg flex flex-col rounded-2xl shadow-xl overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Fixed Header */}
        <div className="bg-[#0C0B5D] px-8 pt-6 pb-5 border-b border-[#0C0B5D] flex-shrink-0 relative text-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow ring-2 ring-white/30 flex-shrink-0">
              <Image
                src="/images/sesam-logo.png"
                alt="SESAM seal"
                width={40}
                height={40}
                className="object-contain"
              />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                A SESAM Initiative · UPLB
              </p>
              <h1 className="text-xl font-bold">Join SINAG</h1>
              <p className="text-xs text-white/70">
                Get cited answers to SESAM workflow & JESAM research questions.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="bg-white overflow-y-auto flex-1 px-8 py-6">
          {/* SSO Button */}
          <button
            onClick={handleSSORegister}
            disabled={loading}
            className="w-full bg-[#0C0B5D] text-white py-3.5 rounded-xl hover:bg-[#0a0949] transition-colors mb-6 font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
            </svg>
            Sign up with UPLB SSO
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="register-firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="register-firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                    placeholder="Juan"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="register-lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="register-lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                  placeholder="Dela Cruz"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 mb-2">
                UPLB Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                  placeholder="your.email@uplb.edu.ph"
                />
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
              Self-registration is for graduate students only. Adviser, coordinator, and admin
              accounts are created by system administrators.
            </div>
            <div>
              <label htmlFor="register-studentNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Student Number
              </label>
              <input
                id="register-studentNumber"
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                placeholder="e.g., 2024-12345"
              />
            </div>
            <div>
              <label htmlFor="register-program" className="block text-sm font-semibold text-gray-700 mb-2">
                Graduate Program
              </label>
              <select
                id="register-program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors appearance-none bg-white"
              >
                <option value="">Select your program</option>
                <option value="M.S. in Environmental Science">M.S. in Environmental Science</option>
                <option value="Ph.D. in Environmental Science">Ph.D. in Environmental Science</option>
                <option value="Ph.D. in Environmental Diplomacy and Negotiations">Ph.D. in Environmental Diplomacy and Negotiations</option>
                <option value="PM-TMEM">Professional Masters in Tropical Marine Ecosystems Management</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                  placeholder="Minimum 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="register-confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                  placeholder="Re-enter your password"
                />
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

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="register-terms"
                required
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#0C0B5D] focus:ring-[#0C0B5D]"
              />
              <label htmlFor="register-terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="#" className="text-[#0C0B5D] hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-[#0C0B5D] hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0C0B5D] text-white py-3.5 rounded-xl hover:bg-[#0a0949] transition-colors font-semibold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size={20} className="text-white" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex-shrink-0">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/" onClick={onClose} className="font-semibold text-[#0C0B5D] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
