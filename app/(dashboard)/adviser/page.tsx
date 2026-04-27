'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useAuth } from '@/app/hooks/useAuth';
import {
  SparklesIcon,
  UsersIcon,
  ClockIcon,
  ChatIcon,
  CheckIcon,
  XMarkIcon,
  ChevronRightIcon,
  UserIcon,
  BellIcon,
  ChartIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
} from '@/app/components/Icons';

interface Student {
  _id: string;
  name: string;
  program: string;
  nextMilestone: string;
  status: 'on-track' | 'needs-attention';
  initials: string;
}

interface PendingReview {
  id: string;
  title: string;
  studentName: string;
  submittedDate: string;
}

interface AIConsultation {
  id: string;
  studentName: string;
  topic: string;
  messageCount: number;
  lastActivity: string;
}

export default function AdviserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Simulated data fetch - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Mock data matching Figma
  const stats = {
    totalAdvisees: 5,
    pendingReviews: 3,
    upcomingDefenses: 1,
    avgTimeToDefense: '4.2y',
  };

  const advisees: Student[] = [
    {
      _id: '1',
      name: 'Maria Santos',
      program: 'M.S. in Environmental Science',
      nextMilestone: 'Data Collection Phase',
      status: 'on-track',
      initials: 'MS',
    },
    {
      _id: '2',
      name: 'Carlos Reyes',
      program: 'Ph.D. in Environmental Science',
      nextMilestone: 'Methodology Chapter',
      status: 'on-track',
      initials: 'CR',
    },
    {
      _id: '3',
      name: 'Isabel Cruz',
      program: 'Ph.D. in Environmental Diplomacy and Negotiations',
      nextMilestone: 'Proposal Defense Preparation',
      status: 'on-track',
      initials: 'IC',
    },
    {
      _id: '4',
      name: 'Miguel Dela Cruz',
      program: 'PM-TMEM',
      nextMilestone: 'Literature Review',
      status: 'needs-attention',
      initials: 'MDC',
    },
    {
      _id: '5',
      name: 'Ana Bautista',
      program: 'Ph.D. in Environmental Science',
      nextMilestone: 'Research Proposal',
      status: 'on-track',
      initials: 'AB',
    },
  ];

  const pendingReviews: PendingReview[] = [
    {
      id: '1',
      title: 'Methodology Chapter Draft',
      studentName: 'Maria Santos',
      submittedDate: 'March 28, 2026',
    },
    {
      id: '2',
      title: 'Research Proposal v2.0',
      studentName: 'Carlos Reyes',
      submittedDate: 'March 27, 2026',
    },
    {
      id: '3',
      title: 'Writing Phase Milestone',
      studentName: 'Isabel Cruz',
      submittedDate: 'March 26, 2026',
    },
  ];

  const recentConsultations: AIConsultation[] = [
    {
      id: '1',
      studentName: 'Maria Santos',
      topic: 'Survey design for metacognitive awareness',
      messageCount: 12,
      lastActivity: 'Yesterday, 2:30 PM',
    },
    {
      id: '2',
      studentName: 'Carlos Reyes',
      topic: 'Research methodology selection guidance',
      messageCount: 8,
      lastActivity: 'Apr 3, 2026',
    },
    {
      id: '3',
      studentName: 'Isabel Cruz',
      topic: 'Dissertation structure and chapter organization',
      messageCount: 15,
      lastActivity: 'Apr 1, 2026',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Dr. {user?.profile?.lastName || 'Santos'}</h1>
          <p className="mt-1 text-gray-600">School of Environmental Science and Management</p>
        </div>
        <Link
          href="/adviser/ai-chat"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-5 py-3 text-sm font-medium text-white hover:bg-[#162b45]"
        >
          <SparklesIcon className="h-4 w-4" />
          Ask AI a Question
        </Link>
      </div>

      {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SimpleStatCard value={stats.totalAdvisees.toString()} label="Total Advisees" />
        <SimpleStatCard value={stats.pendingReviews.toString()} label="Pending Reviews" valueColor="text-accent-orange" />
        <SimpleStatCard value={stats.upcomingDefenses.toString()} label="Upcoming Defenses" />
        <SimpleStatCard value={stats.avgTimeToDefense} label="Avg. Time to Defense" />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Advisees - 2/3 */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">My Advisees</h2>
            <div className="space-y-3">
              {advisees.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                      {student.initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.program}</p>
                      <p className="text-xs text-gray-400">Next: {student.nextMilestone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.status === 'on-track' ? (
                      <>
                        <CheckIcon className="h-4 w-4 text-accent-green" />
                        <span className="rounded-full bg-accent-green-light px-2 py-1 text-xs font-medium text-accent-green">
                          ON TRACK
                        </span>
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="h-4 w-4 text-accent-orange" />
                        <span className="rounded-full bg-accent-orange-light px-2 py-1 text-xs font-medium text-accent-orange">
                          NEEDS ATTENTION
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent AI Consultations */}
          <div className="mt-6 rounded-xl bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <SparklesIcon className="h-5 w-5 text-[#1e3a5f]" />
                Recent AI Consultations
              </h2>
              <Link href="#" className="flex items-center gap-1 text-sm font-medium text-[#1e3a5f] hover:underline">
                View All
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="flex items-start gap-3 rounded-lg border-l-4 border-[#1e3a5f] bg-gray-50 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[#1e3a5f]">Re: {consultation.studentName}</p>
                      <Link href="#" className="text-sm font-medium text-[#1e3a5f] hover:underline">
                        Continue
                      </Link>
                    </div>
                    <p className="text-sm text-gray-700">{consultation.topic}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      <ChatIcon className="mr-1 inline h-3 w-3" />
                      {consultation.messageCount} messages • {consultation.lastActivity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Reviews - 1/3 */}
        <div>
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Pending Reviews</h2>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-gray-100 p-4">
                  <p className="font-medium text-gray-900">{review.title}</p>
                  <p className="text-xs text-gray-500">{review.studentName}</p>
                  <p className="text-xs text-gray-400">Submitted: {review.submittedDate}</p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/adviser/reviews`}
                      className="flex-1 rounded-lg bg-[#1e3a5f] px-3 py-2 text-center text-sm font-medium text-white hover:bg-[#162b45]"
                    >
                      Review
                    </Link>
                    <button className="rounded-lg bg-accent-green px-3 py-2 text-white hover:bg-accent-green/90">
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleStatCard({
  value,
  label,
  valueColor = 'text-gray-900',
}: {
  value: string;
  label: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}


