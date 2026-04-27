'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/app/hooks/useAuth';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Building2, GraduationCap, CheckCircle, X } from 'lucide-react';

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
  const [role, setRole] = useState<UserRole>('student');
  const [studentNumber, setStudentNumber] = useState('');
  const [program, setProgram] = useState('');
  const [department, setDepartment] = useState('');
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
        role,
      };
      if (role === 'student') {
        payload.studentNumber = studentNumber;
        payload.program = program;
      } else if (role === 'adviser') {
        payload.department = department;
      }
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
      <div className="w-full max-w-lg relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors disabled:opacity-50 z-10"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* SESAM Logo */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-[#0C0B5D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join SINAG</h1>
          <p className="text-sm text-gray-600 mt-1">AI-Powered Graduate Advising Platform</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
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

              {/* Role Selection */}
              <div>
                <label htmlFor="register-role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="register-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors appearance-none bg-white"
                  >
                    <option value="student">Graduate Student</option>
                    <option value="adviser">Faculty Adviser</option>
                    <option value="coordinator">Program Coordinator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Student-specific fields */}
              {role === 'student' && (
                <>
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
                </>
              )}

              {/* Adviser-specific fields */}
              {role === 'adviser' && (
                <div>
                  <label htmlFor="register-department" className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="register-department"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C0B5D] focus:border-transparent text-sm transition-colors"
                      placeholder="e.g., SESAM"
                    />
                  </div>
                </div>
              )}

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
                    {showPassword ? <EyeOff className="h-5 h-5" /> : <Eye className="h-5 w-5" />}
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

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border-2 border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
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

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" onClick={onClose} className="font-semibold text-[#0C0B5D] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-gray-500">
          <div className="flex items-center gap-2 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure Registration</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>UPLB Official</span>
          </div>
        </div>
      </div>
    </div>
  );
}
