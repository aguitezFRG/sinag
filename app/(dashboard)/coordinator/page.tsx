'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useAuth } from '@/app/hooks/useAuth';
import {
  UsersIcon,
  ChartIcon,
  ClockIcon,
  BellIcon,
  ChevronRightIcon,
  CalendarIcon,
  PlusIcon,
  DocumentArrowDownIcon,
} from '@/app/components/Icons';

interface StudentAssignment {
  id: string;
  name: string;
  program: string;
  adviser: string | null;
  unassigned: boolean;
}

interface Announcement {
  id: string;
  title: string;
  type: string;
  date: string;
  activeUntil: string;
  targetAudience: string;
}

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Simulated data fetch
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Mock data from Figma
  const stats = {
    totalStudents: 22,
    activeAdvisers: 5,
    completionRate: '89%',
    overdueItems: 3,
  };

  const adviserWorkload = [
    { name: 'Dr. Wilson', students: 6 },
    { name: 'Dr. Smith', students: 5 },
    { name: 'Dr. Johnson', students: 4 },
    { name: 'Dr. Brown', students: 4 },
    { name: 'Dr. Davis', students: 3 },
  ];

  const assignments: StudentAssignment[] = [
    { id: '1', name: 'Maria Santos', program: 'M.S. in Environmental Science', adviser: 'Dr. Ramon Santos', unassigned: false },
    { id: '2', name: 'Carlos Reyes', program: 'Ph.D. in Environmental Science', adviser: 'Dr. Ramon Santos', unassigned: false },
    { id: '3', name: 'Isabel Cruz', program: 'Ph.D. in Environmental Diplomacy and Negotiations', adviser: 'Dr. Ramon Santos', unassigned: false },
    { id: '4', name: 'Miguel Dela Cruz', program: 'PM-TMEM', adviser: 'Dr. Sofia Reyes', unassigned: false },
    { id: '5', name: 'Ana Bautista', program: 'Ph.D. in Environmental Science', adviser: 'Dr. Sofia Reyes', unassigned: false },
    { id: '6', name: 'Roberto Torres', program: 'M.S. in Environmental Science', adviser: 'Dr. Maria Gonzales', unassigned: false },
    { id: '7', name: 'Jennifer Aquino', program: 'Ph.D. in Environmental Diplomacy and Negotiations', adviser: null, unassigned: true },
  ];

  const announcements: Announcement[] = [
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

      {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SimpleStatCard value={stats.totalStudents.toString()} label="Total Active Students" />
        <SimpleStatCard value={stats.activeAdvisers.toString()} label="Active Advisers" />
        <SimpleStatCard value={stats.completionRate} label="Completion Rate" valueColor="text-[#1e3a5f]" />
        <SimpleStatCard value={stats.overdueItems.toString()} label="Overdue Items" valueColor="text-red-600" />
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Students Per Adviser</h2>
          <div className="space-y-3">
            {adviserWorkload.map((adviser) => (
              <div key={adviser.name} className="flex items-center gap-4">
                <span className="w-24 text-sm text-gray-600">{adviser.name}</span>
                <div className="flex-1">
                  <div className="h-8 rounded bg-gray-100">
                    <div
                      className="h-8 rounded bg-[#1e3a5f]"
                      style={{ width: `${(adviser.students / 8) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-sm font-medium text-gray-900">{adviser.students}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Milestone Completion Rates</h2>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">Chart visualization placeholder</p>
          </div>
        </div>
      </div>

      {/* Adviser Assignments */}
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
              {assignments.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.program}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {student.unassigned ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        Unassigned
                      </span>
                    ) : (
                      student.adviser
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="font-medium text-[#1e3a5f] hover:underline">
                      {student.unassigned ? 'Assign' : 'Reassign'}
                    </button>
                  </td>
                </tr>
              ))}
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
                    The defense schedule for Spring 2026 is now available. Please review and confirm your dates.
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


