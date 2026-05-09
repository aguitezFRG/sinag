'use client';

import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import {
  ArrowRight,
  MessageSquare,
  Brain,
  Sparkles,
  BookOpen,
  GraduationCap,
  Search,
  CheckCircle,
  Quote,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const lastName = user?.profile?.lastName || 'Coordinator';

  const sampleQuestions = [
    {
      category: 'SESAM',
      icon: GraduationCap,
      label: 'Program Oversight',
      heading: 'Reference SESAM policy',
      description:
        'Look up handbook policies, AOSCOM workflows, milestone schedules, and adviser-student protocols when overseeing your programs — every answer is cited.',
      questions: [
        'What are the program-level milestone expectations across SESAM?',
        'How is the M.S. and Ph.D. comprehensive exam administered?',
        'What is the AOSCOM workflow for reviewing student proposals?',
        'What are the standard adviser workload guidelines?',
      ],
    },
    {
      category: 'JESAM',
      icon: BookOpen,
      label: 'Research Archive',
      heading: 'Search JESAM literature',
      description:
        'Search the Journal of Environmental Science and Management archive to inform program review, faculty mentoring, or academic planning — with verifiable citations.',
      questions: [
        'JESAM topics aligned with SESAM strategic research thrusts',
        'Find JESAM papers on program evaluation methodologies',
        'Compare methodological rigor in recent JESAM submissions',
        'JESAM articles on capacity-building in environmental science programs',
      ],
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      icon: MessageSquare,
      title: 'Ask in plain English',
      desc: 'Type your reference question about SESAM policy or research literature — no special syntax required.',
    },
    {
      step: '02',
      icon: Search,
      title: 'Cited retrieval',
      desc: 'SINAG searches the SESAM handbook and JESAM archive and grounds the answer in the most relevant passages.',
    },
    {
      step: '03',
      icon: Quote,
      title: 'Verifiable answer',
      desc: 'Get an authoritative response with inline citations and a References section — ready to share with advisers and committees.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* SESAM brand banner */}
      <div className="mb-6 relative overflow-hidden rounded-2xl bg-[#0C0B5D] p-5 sm:p-6 text-white shadow-lg">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
        <div className="relative flex items-start gap-4">
          <span className="hidden sm:flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white shadow ring-2 ring-white/20">
            <img src="/images/sesam-logo.png" alt="SESAM seal" className="h-11 w-11 object-contain" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">A SESAM Initiative · UPLB</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">Welcome back, Coord. {lastName}</h2>
            <p className="mt-1 text-sm text-white/80 max-w-2xl">
              Your AI reference companion for program-level oversight — pull SESAM policy and
              JESAM research with cited answers you can share with advisers and committees.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Action Card */}
      <div className="mb-6 rounded-2xl border-2 border-[#0C0B5D]/15 bg-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0C0B5D] text-white">
              <Brain className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Need program-level guidance?</h1>
              <p className="mt-1 text-sm text-gray-600 max-w-xl">
                Reference SESAM policies, AOSCOM procedures, or scan JESAM literature when
                coordinating your programs — SINAG cites every source.
              </p>
            </div>
          </div>
          <Link
            href="/coordinator/ai-chat"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C0B5D] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0a0949] w-full sm:w-auto"
          >
            <MessageSquare className="h-5 w-5" />
            Open AI Consultation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Two chatbot purposes */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {sampleQuestions.map(({ category, icon: Icon, label, heading, description, questions }) => (
          <div key={category} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0C0B5D]/10 text-[#0C0B5D]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0C0B5D]/70">
                  {label}
                </p>
                <h3 className="text-lg font-bold text-gray-900">{heading}</h3>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-600">{description}</p>
            <ul className="space-y-2">
              {questions.map((q) => (
                <li key={q}>
                  <Link
                    href={`/coordinator/ai-chat?q=${encodeURIComponent(q)}`}
                    className="flex items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:border-[#0C0B5D]/30 hover:bg-[#0C0B5D]/5"
                  >
                    <Search className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#0C0B5D]/60" />
                    <span>{q}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* How SINAG works */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#0C0B5D]/15 bg-[#0C0B5D]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0C0B5D]">
              <Sparkles className="h-3 w-3" />
              How SINAG works
            </div>
            <h2 className="text-2xl font-bold text-gray-900">From question to cited answer</h2>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">
              Three steps power every consultation — built on retrieval-grounded AI, so nothing
              is invented and every claim is traceable to an authoritative source.
            </p>
          </div>
          <Link
            href="/coordinator/ai-chat"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#0C0B5D]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0C0B5D] transition hover:bg-[#0C0B5D]/5"
          >
            Try it now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="relative grid gap-6 sm:grid-cols-3">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-[#0C0B5D]/20 to-transparent sm:block"
          />
          {workflowSteps.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative">
              <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0C0B5D]/20 bg-white shadow-sm">
                <Icon className="h-5 w-5 text-[#0C0B5D]" />
              </div>
              <div className="mb-1 text-[11px] font-bold tracking-[0.2em] text-[#0C0B5D]/60">STEP {step}</div>
              <h3 className="mb-2 text-base font-bold text-gray-900">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Cited &amp; verifiable</p>
              <p className="text-xs text-gray-600">Inline citations + References section every time.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Grounded in SESAM &amp; JESAM</p>
              <p className="text-xs text-gray-600">No hallucinated policies, no made-up papers.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Answers in seconds</p>
              <p className="text-xs text-gray-600">Pull policy and literature without context-switching.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
