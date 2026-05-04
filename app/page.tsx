'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from './hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './components/LoadingSpinner';
import RegisterModal from './components/auth/RegisterModal';
import {
  SparklesIcon,
  LightningIcon,
  UsersIcon,
  DocumentIcon,
  CheckIcon,
  ChatIcon,
  ShieldIcon,
  ChartIcon,
  GraduationCapIcon,
  BuildingIcon,
  GlobeIcon,
  LeafIcon,
  ChevronRightIcon,
} from './components/Icons';
import HomePageChatbot from './components/HomePageChatbot';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.push(`/${user.role}`);
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    const modal = new URLSearchParams(window.location.search).get('modal');
    if (modal === 'register') {
      setShowRegisterModal(true);
      setShowLoginModal(false);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-page">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-page">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation — fixed, scroll-aware */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-[#0C0B5D]/10 bg-white/95 shadow-md backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all md:px-12 ${scrolled ? 'h-14' : 'h-16'}`}>
          <Link href="/" className="flex items-center gap-3">
            {/* SESAM seal */}
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 transition ${
                scrolled ? 'bg-white ring-[#0C0B5D]/15' : 'bg-white/95 ring-white/40'
              }`}
            >
              <img
                src="/images/sesam-logo.png"
                alt="SESAM seal"
                className="h-7 w-7 object-contain"
              />
            </span>
            <div className="flex flex-col leading-none">
              <span className={`text-lg font-bold tracking-tight ${scrolled ? 'text-[#0C0B5D]' : 'text-white'}`}>
                SINAG
              </span>
              <span
                className={`mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${
                  scrolled ? 'text-[#0C0B5D]/60' : 'text-white/70'
                }`}
              >
                A SESAM Initiative
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { href: '#', label: 'Home' },
              { href: '#about', label: 'About' },
              { href: '#features', label: 'Features' },
              { href: '#programs', label: 'Programs' },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={`text-sm font-medium transition ${
                  scrolled ? 'text-[#0C0B5D]/75 hover:text-[#0C0B5D]' : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                scrolled
                  ? 'text-[#0C0B5D] hover:bg-[#0C0B5D]/5'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                scrolled
                  ? 'bg-[#0C0B5D] text-white shadow-sm hover:bg-[#0C0B5D]/90'
                  : 'bg-white text-[#0C0B5D] hover:bg-white/90'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-[#0C0B5D]">
        {/* Background: Official SESAM building photograph */}
        <div className="absolute inset-0">
          <img
            src="https://sesam.uplb.edu.ph/wp-content/uploads/2024/04/SESAM-building.png"
            alt="UPLB School of Environmental Science and Management (SESAM) building"
            className="h-full w-full object-cover object-center"
            style={{ filter: 'brightness(0.55) saturate(0.92)' }}
          />
          {/* Brand-color veil — indigo dominant for unmistakable branding */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(100deg, rgba(12,11,93,0.95) 0%, rgba(12,11,93,0.86) 42%, rgba(12,11,93,0.62) 72%, rgba(12,11,93,0.48) 100%)',
            }}
          />
          {/* Soft indigo highlight for depth */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 78% 38%, rgba(63,61,180,0.32) 0%, transparent 65%)',
            }}
          />
          {/* Bottom fade into next section */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,11,93,0.9))' }}
          />
        </div>

        {/* Content — centered single column */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center md:px-12">
          {/* Logo + SESAM origin chip on one row */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-white/20">
              <img src="/images/sesam-logo.png" alt="SESAM seal" className="h-12 w-12 object-contain" />
            </div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.08] px-4 py-1.5 backdrop-blur-md">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/95">
                A SESAM Initiative · UPLB
              </span>
            </div>
          </div>

          <h1
            className="text-6xl font-black leading-[0.95] tracking-tight text-white md:text-8xl lg:text-9xl"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.45)' }}
          >
            SINAG
          </h1>

          {/* Brand underline — centered */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-[3px] w-2 rounded-full bg-white/40" />
            <div className="h-[3px] w-20 rounded-full bg-white" />
            <div className="h-[3px] w-2 rounded-full bg-white/40" />
          </div>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Built for the School of Environmental Science and Management
          </p>

          <p className="mt-6 text-base font-semibold text-white md:text-lg">
            SESAM Intelligent Natural-language Advising Guide
          </p>

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85">
            Your AI consultation companion for UPLB SESAM. Get cited answers about SESAM
            admissions, enrolment, requirements, and defense procedures — and search the
            JESAM research archive in plain English.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-[#0C0B5D] shadow-lg shadow-black/20 transition hover:shadow-xl"
            >
              <SparklesIcon className="h-4 w-4" />
              Get Started Free
            </button>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-transparent px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Learn More
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85">
              <ShieldIcon className="h-3.5 w-3.5" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85">
              <SparklesIcon className="h-3.5 w-3.5" />
              AI-Powered
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85">
              <BuildingIcon className="h-3.5 w-3.5" />
              UPLB Official
            </div>
          </div>
        </div>
      </section>

      {/* About SINAG Section */}
      <section id="about" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12 text-center">
            <div className="pill-badge mx-auto mb-4 border border-[#0C0B5D]/20 bg-[#0C0B5D]/5 text-[#0C0B5D]">
              <BuildingIcon className="h-4 w-4" />
              About SINAG
            </div>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Revolutionizing Graduate Education
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Empowering graduate education at UPLB SESAM through intelligent technology
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl border border-[#0C0B5D]/10 shadow-lg">
              <img
                src="https://sesam.uplb.edu.ph/wp-content/uploads/2024/04/SESAM-building.png"
                alt="UPLB SESAM Building"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B5D]/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-md bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0C0B5D] shadow">
                UPLB SESAM
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              <AboutFeature
                icon={<ChatIcon className="h-5 w-5" />}
                iconBg="bg-accent-blue-light"
                iconColor="text-accent-blue"
                title="AI-Powered Consultation"
                description="Get instant answers to academic questions with our intelligent natural language assistant trained on SESAM policies and best practices."
              />
              <AboutFeature
                icon={<ChatIcon className="h-5 w-5" />}
                iconBg="bg-accent-blue-light"
                iconColor="text-accent-blue"
                title="SESAM Q&A"
                description="Ask about admissions, enrolment, program requirements, defense procedures, and graduation clearance — answered straight from the SESAM graduate handbook with citations."
              />
              <AboutFeature
                icon={<DocumentIcon className="h-5 w-5" />}
                iconBg="bg-accent-purple-light"
                iconColor="text-accent-purple"
                title="JESAM Research Q&A"
                description="Search the Journal of Environmental Science and Management archive in plain English. Find prior studies, compare methodologies, and pull cited findings for your thesis."
              />
              <AboutFeature
                icon={<ShieldIcon className="h-5 w-5" />}
                iconBg="bg-accent-green-light"
                iconColor="text-accent-green"
                title="Cited & Verifiable"
                description="Every response includes inline citations and a References section pointing to the exact handbook section or JESAM article. Nothing hallucinated, everything traceable."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="bg-gradient-page py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-[#0C0B5D]/15">
              <img src="/images/sesam-logo.png" alt="SESAM seal" className="h-12 w-12 object-contain" />
            </div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0C0B5D]/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0C0B5D]">
              <SparklesIcon className="h-3.5 w-3.5" />
              Built around SESAM
            </div>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              The Core of SINAG: SESAM-Aware AI Consultation
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-gray-600">
              Every answer is grounded in the actual SESAM graduate handbook, program guidelines,
              and the JESAM (Journal of Environmental Science and Management) archive — with
              inline citations to the exact source document.
            </p>
          </div>

          {/* Flagship feature — SESAM workflow + JESAM Q&A */}
          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            {/* SESAM Workflow Consultation */}
            <div className="rounded-2xl border border-[#0C0B5D]/10 bg-white p-8 shadow-card">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0C0B5D] text-white">
                    <ChatIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#0C0B5D]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0C0B5D]">
                    Flagship Feature
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">SESAM Consultation</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  Ask anything about the SESAM graduate journey — from admissions to final
                  defense — and get cited, handbook-grounded answers in seconds.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <FeatureListItem text="Admissions, enrolment & program requirements" />
                  <FeatureListItem text="Proposal defense, comprehensive exams, final defense" />
                  <FeatureListItem text="UPLB REB ethics review & data privacy compliance" />
                  <FeatureListItem text="Thesis formatting, submission & graduation clearance" />
                </ul>
              </div>
            </div>

            {/* JESAM Research Q&A */}
            <div className="rounded-2xl border border-[#0C0B5D]/10 bg-white p-8 shadow-card">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0C0B5D] text-white">
                    <DocumentIcon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#0C0B5D]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0C0B5D]">
                    JESAM Archive
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">JESAM Research Q&A</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  Search the Journal of Environmental Science and Management archive in plain
                  English. Every answer cites the exact JESAM article it pulled from.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <FeatureListItem text="Find prior SESAM theses & related JESAM studies" />
                  <FeatureListItem text="Compare methodologies across past research" />
                  <FeatureListItem text="Identify gaps for your own thesis topic" />
                  <FeatureListItem text="Pull statistics & findings with verifiable citations" />
                </ul>
              </div>
            </div>
          </div>

          {/* Supporting features — what each user gets out of the chatbot */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* For Students */}
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-blue-light">
                <GraduationCapIcon className="h-6 w-6 text-accent-blue" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">For SESAM Students</h3>
              <ul className="space-y-2">
                <FeatureListItem text="Get instant answers on admissions & enrolment" />
                <FeatureListItem text="Clarify program requirements & deadlines" />
                <FeatureListItem text="Look up defense and graduation procedures" />
                <FeatureListItem text="Find supporting JESAM research for your thesis" />
              </ul>
            </div>

            {/* For Advisers */}
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-purple-light">
                <UsersIcon className="h-6 w-6 text-accent-purple" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">For SESAM Advisers</h3>
              <ul className="space-y-2">
                <FeatureListItem text="Quickly verify SESAM policy with citations" />
                <FeatureListItem text="Surface relevant JESAM literature on demand" />
                <FeatureListItem text="Point students to the exact handbook section" />
                <FeatureListItem text="Reduce time spent on routine procedural questions" />
              </ul>
            </div>

            {/* Cited & Trustworthy */}
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-amber-light">
                <ShieldIcon className="h-6 w-6 text-accent-amber" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Cited &amp; Trustworthy</h3>
              <p className="mb-3 text-sm text-gray-600">
                Every response is grounded in real SESAM and JESAM source material.
              </p>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>• Inline numeric citations</li>
                <li>• References section with source links</li>
                <li>• No hallucinated policies or papers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">SESAM Graduate Programs</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Supporting all UPLB SESAM degree programs with specialized workflows
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* MS Environmental Science */}
            <div className="program-card-ms rounded-2xl bg-gray-50 p-6 transition-all hover:bg-white hover:shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue text-white">
                  <GraduationCapIcon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">M.S. in Environmental Science</h3>
              </div>
              <p className="text-sm text-gray-600">
                Comprehensive research training in environmental science with thesis or non-thesis options
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <ClockIcon className="h-3.5 w-3.5" />
                2-3 years completion
              </div>
            </div>

            {/* PhD Environmental Science */}
            <div className="program-card-phd rounded-2xl bg-gray-50 p-6 transition-all hover:bg-white hover:shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple text-white">
                  <DocumentIcon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ph.D. in Environmental Science</h3>
              </div>
              <p className="text-sm text-gray-600">
                Advanced research degree preparing scholars for academic and research careers
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <ClockIcon className="h-3.5 w-3.5" />
                3-5 years completion
              </div>
            </div>

            {/* PhD Environmental Diplomacy */}
            <div className="program-card-diplomacy rounded-2xl bg-gray-50 p-6 transition-all hover:bg-white hover:shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green text-white">
                  <GlobeIcon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ph.D. in Environmental Diplomacy and Negotiations</h3>
              </div>
              <p className="text-sm text-gray-600">
                Specialized program focusing on environmental policy and international relations
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <ClockIcon className="h-3.5 w-3.5" />
                3-5 years completion
              </div>
            </div>

            {/* PM-TMEM */}
            <div className="program-card-tmem rounded-2xl bg-gray-50 p-6 transition-all hover:bg-white hover:shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-teal text-white">
                  <LeafIcon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Professional Masters in Tropical Marine Ecosystems Management (PM-TMEM)</h3>
              </div>
              <p className="text-sm text-gray-600">
                Professional degree for marine ecosystem conservation and management
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <ClockIcon className="h-3.5 w-3.5" />
                2 years completion
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[#0C0B5D] py-20">
        <div className="absolute inset-0">
          <img
            src="https://sesam.uplb.edu.ph/wp-content/uploads/2024/04/SESAM-building.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
            style={{ filter: 'brightness(0.5) saturate(0.9)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(12,11,93,0.92) 0%, rgba(12,11,93,0.85) 100%)',
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-12">
          {/* SESAM seal — anchors the call-to-action with institutional identity */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-white/20">
            <img
              src="/images/sesam-logo.png"
              alt="SESAM seal"
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/95 backdrop-blur">
            School of Environmental Science and Management · UPLB
          </div>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Transform Your Graduate Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            Sign in to ask SINAG AI about SESAM admissions, enrolment, program requirements,
            defense procedures — or to search the JESAM research archive with cited answers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-[#0C0B5D] shadow-lg hover:bg-white/95"
            >
              Access SINAG Platform
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
            <a
              href="https://sesam.uplb.edu.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-transparent px-6 py-4 text-base font-medium text-white hover:bg-white/10"
            >
              Visit SESAM Website
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onOpenRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}
      <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
      <HomePageChatbot />
    </div>
  );
}

/* =================================================================
   Component Definitions
   ================================================================= */

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card-hover rounded-2xl bg-white p-6 shadow-card">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function AboutFeature({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function FeatureListItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-600">
      <CheckIcon className="h-4 w-4 shrink-0 text-accent-green" />
      {text}
    </li>
  );
}

function Footer() {
  return (
    <footer className="bg-[#111827] py-12 text-white">
      <div className="mx-auto max-w-7xl px-6 pt-12 md:px-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Logo & Description — co-branded SESAM × SINAG */}
          <div>
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white/10">
                <img
                  src="/images/sesam-logo.png"
                  alt="SESAM seal"
                  className="h-14 w-14 object-contain"
                />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-bold tracking-tight">SINAG</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  A SESAM Initiative
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-white/85">
              SESAM Intelligent Natural-language Advising Guide
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/60">
              School of Environmental Science and Management
              <br />
              University of the Philippines Los Baños
              <br />
              College, Los Baños, Laguna 4031
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/95">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="https://sesam.uplb.edu.ph" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  SESAM Website
                </a>
              </li>
              <li>
                <a href="https://uplb.edu.ph" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  UPLB Homepage
                </a>
              </li>
              <li>
                <Link href="#programs" className="hover:text-white">
                  Graduate Programs
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white">
                  Platform Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/95">Contact SESAM</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Email: sesam@uplb.edu.ph</li>
              <li>Phone: (049) 536-2509</li>
              <li>Office Hours: Mon-Fri, 8AM-5PM</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-8 text-xs text-white/55 md:flex-row">
          <span>
            © {new Date().getFullYear()} SINAG · SESAM Intelligent Natural-language Advising Guide
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <img src="/images/sesam-logo.png" alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
            </span>
            Powered by the School of Environmental Science and Management, UPLB
          </span>
        </div>
      </div>
    </footer>
  );
}

function LoginModal({
  onClose,
  onOpenRegister,
}: {
  onClose: () => void;
  onOpenRegister: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      router.push(`/${user.role}`);
    } catch {
      // error handled in hook
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#0C0B5D]/10">
        {/* Close (top-right) */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/15 p-1.5 text-white/90 transition hover:bg-white/25"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand header strip with SESAM seal — compact */}
        <div className="bg-[#0C0B5D] px-6 pb-5 pt-5 text-white">
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow ring-2 ring-white/25">
              <img src="/images/sesam-logo.png" alt="SESAM seal" className="h-9 w-9 object-contain" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/70">
              A SESAM Initiative · UPLB
            </span>
            <h2 className="mt-1 text-lg font-bold tracking-tight">Welcome back to SINAG</h2>
          </div>
        </div>

        <div className="px-6 pb-5 pt-4">
          {/* SSO Button */}
          <button className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0C0B5D] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#0a0949]">
            <BuildingIcon className="h-4 w-4" />
            Sign in with UPLB SSO
          </button>

          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-700">Institutional Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@uplb.edu.ph"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D]/20"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D]/20"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0C0B5D] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0a0949] disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size={16} className="text-white" /> : (
                <>
                  Sign In
                  <ChevronRightIcon className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-0.5 text-[11px]">
              <Link href="#" className="font-medium text-[#0C0B5D] hover:underline">
                Forgot password?
              </Link>
              <span className="text-gray-500">
                No account?{' '}
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="font-semibold text-[#0C0B5D] hover:underline"
                >
                  Create one
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}

/* Additional Icon Components */
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
