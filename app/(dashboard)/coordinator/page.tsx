'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useApiFetch } from '@/app/hooks/useApiFetch';
import StatsCard from '@/app/components/StatsCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import {
  UsersIcon,
  ChartIcon,
  ClockIcon,
  BellIcon,
  ChevronRightIcon,
  CalendarIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  CheckIcon,
} from '@/app/components/Icons';

// TypeScript interfaces
interface CoordinatorStats {
  totalStudents: number;
  activeAdvisers: number;
  completionRate: string;
  overdueItems: number;
  adviserWorkload: {
    adviserId: string;
    name: string;
    students: number;
    maxStudents: number;
    utilizationRate: number;
  }[];
}

interface StudentAssignment {
  _id: string;
  name: string;
  program: string;
  studentNumber: string;
  adviser: {
    _id: string | null;
    name: string | null;
  };
  unassigned: boolean;
}

// Custom hook for coordinator dashboard data
function useCoordinatorDashboard() {
  const stats = useApiFetch<CoordinatorStats>({ url: '/api/analytics/coordinator' });
  const assignments = useApiFetch<{ students: StudentAssignment[] }>({
    url: '/api/students/assignments',
    transform: (data) => ({
      students: data.students.map((s: any) => ({
        _id: s.studentId,
        name: s.studentName,
        program: s.program,
        studentNumber: s.studentNumber,
        adviser: {
          _id: s.adviserId,
          name: s.adviserName,
        },
        unassigned: !s.isAssigned,
      })),
    }),
  });

  return {
    stats: stats.data,
    assignments: assignments.data?.students || [],
    loading: stats.loading || assignments.loading,
    error: stats.error || assignments.error,
    refetch: () => {
      stats.refetch();
      assignments.refetch();
    },
  };
}

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const { stats, assignments, loading, error, refetch } = useCoordinatorDashboard();

  // Keep announcements hardcoded (they're different from stats data)
  const announcements = [
    {
      id: '1',
      title: 'Spring 2026 Defense Schedule Released',
      type: 'All Students',
      date: 'March 30, 2026',
      activeUntil: 'May 31, 2026',
      targetAudience: 'All Students',
    },
    {
      id: '2',
      title: 'Research Methods Workshop - April 15',
      type: 'Workshop',
      date: 'March 25, 2026',
      activeUntil: 'April 15, 2026',
      targetAudience: 'All Students',
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
    <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Program Coordinator Dashboard</h1>
        <p className="mt-1 text-gray-600">Graduate Programs Management</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={refetch}
            className="text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards - Using shared StatsCard */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          loading={loading}
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Active Advisers"
          value={stats?.activeAdvisers || 0}
          loading={loading}
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Completion Rate"
          value={stats?.completionRate || '0%'}
          loading={loading}
          icon={<CheckIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Overdue Items"
          value={stats?.overdueItems || 0}
          loading={loading}
          icon={<ClockIcon className="h-5 w-5" />}
        />
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Adviser Workload Chart */}
        <div className="rounded-xl bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Students Per Adviser</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="flex-1 h-8 bg-gray-200 animate-pulse rounded" />
                  <div className="w-8 h-4 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.adviserWorkload?.map((adviser) => (
                <div key={adviser.adviserId} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-gray-600">{adviser.name}</span>
                  <div className="flex-1">
                    <div className="h-8 rounded bg-gray-100">
                      <div
                        className="h-8 rounded bg-[#1e3a5f]"
                        style={{
                          width: `${
                            (adviser.students /
                              Math.max(...stats.adviserWorkload.map((a) => a.students))) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-sm font-medium text-gray-900">{adviser.students}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestone Completion Placeholder */}
        <div className="rounded-xl bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Milestone Completion Rates</h2>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">Chart visualization placeholder</p>
          </div>
        </div>
      </div>

      {/* Adviser Assignments Table */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Adviser Assignments</h2>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#162b45]">
            <PlusIcon className="h-4 w-4" />
            Assign Adviser
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Program
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Assigned Adviser
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Skeleton rows
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
                    </td>
                  </tr>
                ))
              ) : assignments.length > 0 ? (
                assignments.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.program}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.unassigned ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                          Unassigned
                        </span>
                      ) : (
                        student.adviser.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button className="font-medium text-[#1e3a5f] hover:underline">
                        {student.unassigned ? 'Assign' : 'Reassign'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Reports */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Generate Reports</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <ReportCard
            title="Advising Activity Report"
            description="Track adviser-student interactions and meeting frequency"
          />
          <ReportCard
            title="Milestone Fulfillment Report"
            description="Review completion rates across all programs"
          />
          <ReportCard
            title="Time-to-Defense Report"
            description="Analyze average completion times by program"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="date"
            placeholder="mm/dd/yyyy"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            placeholder="mm/dd/yyyy"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option>All Programs</option>
            <option>M.S. Environmental Science</option>
            <option>Ph.D. Environmental Science</option>
            <option>Ph.D. Environmental Diplomacy</option>
            <option>PM-TMEM</option>
          </select>
          <div className="ml-auto flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#162b45]">
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#162b45]">
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export Excel
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#162b45]">
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Program Announcements */}
      <div className="rounded-xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Program Announcements</h2>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#162b45]">
            <PlusIcon className="h-4 w-4" />
            Create Announcement
          </button>
        </div>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="rounded-lg border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    The defense schedule for Spring 2026 is now available. Please review and confirm
                    your dates.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {announcement.targetAudience}
                    </span>
                    <span className="text-xs text-gray-500">
                      Active until: {announcement.activeUntil}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{announcement.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-3 flex gap-2">
        <input
          type="date"
          placeholder="mm/dd/yyyy"
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
        />
        <input
          type="date"
          placeholder="mm/dd/yyyy"
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
        />
      </div>
    </div>
  );
}
