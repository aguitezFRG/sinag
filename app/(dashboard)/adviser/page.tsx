'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useApiFetch } from '@/app/hooks/useApiFetch';
import StatsCard from '@/app/components/StatsCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Link from 'next/link';
import {
  SparklesIcon,
  UsersIcon,
  ClockIcon,
  ChatIcon,
  CheckIcon,
  XMarkIcon,
  ChevronRightIcon,
  UserIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
} from '@/app/components/Icons';

// TypeScript interfaces
interface AdviserStats {
  totalAdvisees: number;
  pendingReviews: number;
  upcomingDefenses: number;
  avgTimeToDefense: string;
}

interface Advisee {
  _id: string;
  name: string;
  program: string;
  nextMilestone: string;
  status: 'on-track' | 'needs-attention';
}

interface PendingReview {
  reviewId: string;
  stageName: string;
  studentName: string;
  studentProgram: string;
  submittedAt: string | null;
  priority: 'normal' | 'high' | 'urgent';
}

interface Consultation {
  consultationId: string;
  studentName: string;
  studentProgram: string;
  query: string;
  createdAt: string;
}

// Custom hook for adviser dashboard data
function useAdviserDashboard() {
  const stats = useApiFetch<AdviserStats>({ url: '/api/analytics/adviser' });
  const advisees = useApiFetch<{ students: Advisee[] }>({ url: '/api/adviser/students' });
  const pending = useApiFetch<{ reviews: PendingReview[] }>({
    url: '/api/adviser/pending-reviews',
    transform: (data) => ({
      reviews: data.reviews.map((r: any) => ({
        reviewId: r.reviewId,
        stageName: r.stageName,
        studentName: r.studentName,
        studentProgram: r.studentProgram,
        submittedAt: r.submittedAt,
        priority: r.priority,
      })),
    }),
  });
  const consultations = useApiFetch<{ consultations: Consultation[] }>({
    url: '/api/adviser/consultations?limit=3',
    transform: (data) => ({
      consultations: data.consultations.map((c: any) => ({
        consultationId: c.consultationId,
        studentName: c.studentName,
        studentProgram: c.studentProgram,
        query: c.query,
        createdAt: c.createdAt,
      })),
    }),
  });

  return {
    stats: stats.data,
    advisees: advisees.data?.students || [],
    pendingReviews: pending.data?.reviews || [],
    recentConsultations: consultations.data?.consultations || [],
    loading:
      stats.loading || advisees.loading || pending.loading || consultations.loading,
    error: stats.error || advisees.error || pending.error || consultations.error,
    refetch: () => {
      stats.refetch();
      advisees.refetch();
      pending.refetch();
      consultations.refetch();
    },
  };
}

export default function AdviserDashboard() {
  const { user } = useAuth();
  const { stats, advisees, pendingReviews, recentConsultations, loading, error, refetch } =
    useAdviserDashboard();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Dr. {user?.profile?.lastName || 'Santos'}
          </h1>
          <p className="mt-1 text-gray-600">School of Environmental Science and Management</p>
        </div>
        <Link
          href="/adviser/ai-chat"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0C0B5D] px-5 py-3 text-sm font-medium text-white hover:bg-[#0a0949]"
        >
          <SparklesIcon className="h-4 w-4" />
          Ask AI a Question
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={refetch} className="text-red-700 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards - Using shared StatsCard */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Advisees"
          value={stats?.totalAdvisees || 0}
          loading={loading}
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Pending Reviews"
          value={stats?.pendingReviews || 0}
          loading={loading}
          icon={<DocumentIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Upcoming Defenses"
          value={stats?.upcomingDefenses || 0}
          loading={loading}
          icon={<CheckIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Avg. Time to Defense"
          value={stats?.avgTimeToDefense || 'N/A'}
          loading={loading}
          icon={<ClockIcon className="h-5 w-5" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Advisees - 2/3 */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">My Advisees</h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full" />
                      <div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-32 mb-1" />
                        <div className="h-3 bg-gray-200 animate-pulse rounded w-24" />
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
                  </div>
                ))}
              </div>
            ) : advisees.length > 0 ? (
              <div className="space-y-3">
                {advisees.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0C0B5D] text-sm font-bold text-white">
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.program}</p>
                        <p className="text-xs text-gray-400">Next: {student.nextMilestone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.status === 'on-track' ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          ON TRACK
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                          NEEDS ATTENTION
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">No advisees found.</div>
            )}
          </div>

          {/* Recent AI Consultations */}
          <div className="mt-6 rounded-xl bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <SparklesIcon className="h-5 w-5 text-[#0C0B5D]" />
                Recent AI Consultations
              </h2>
              <Link
                href="#"
                className="flex items-center gap-1 text-sm font-medium text-[#0C0B5D] hover:underline"
              >
                View All
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-l-4 border-gray-200 bg-gray-50 p-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-full mb-1" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-32" />
                  </div>
                ))}
              </div>
            ) : recentConsultations.length > 0 ? (
              <div className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.consultationId}
                    className="flex items-start gap-3 rounded-lg border-l-4 border-[#0C0B5D] bg-gray-50 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-[#0C0B5D]">
                          Re: {consultation.studentName}
                        </p>
                        <Link
                          href="#"
                          className="text-sm font-medium text-[#0C0B5D] hover:underline"
                        >
                          Continue
                        </Link>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-1">{consultation.query}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        <ChatIcon className="mr-1 inline h-3 w-3" />
                        {consultation.studentProgram} •{' '}
                        {new Date(consultation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">No recent consultations.</div>
            )}
          </div>
        </div>

        {/* Pending Reviews - 1/3 */}
        <div>
          <div className="rounded-xl bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Pending Reviews</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-100 p-4 rounded-lg">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-32 mb-3" />
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-gray-200 animate-pulse rounded" />
                      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
                      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingReviews.length > 0 ? (
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <div key={review.reviewId} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{review.stageName}</p>
                        <p className="text-xs text-gray-500">
                          {review.studentName} • {review.studentProgram}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted:{' '}
                          {review.submittedAt
                            ? new Date(review.submittedAt).toLocaleDateString()
                            : 'Unknown'}
                        </p>
                        {review.priority !== 'normal' && (
                          <span
                            className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${
                              review.priority === 'urgent'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {review.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href="/adviser/reviews"
                        className="flex-1 rounded-lg bg-[#0C0B5D] px-3 py-2 text-center text-sm font-medium text-white hover:bg-[#0a0949]"
                      >
                        Review
                      </Link>
                      <button className="rounded-lg bg-green-500 px-3 py-2 text-white hover:bg-green-600">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">No pending reviews.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
