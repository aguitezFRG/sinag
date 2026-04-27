'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DataTable from '@/app/components/DataTable';
import StatsCard from '@/app/components/StatsCard';
import { UsersIcon, ActiveIcon, ThesisIcon } from '@/app/components/Icons';

interface Student {
  _id: string;
  email: string;
  profile: { firstName: string; lastName: string };
  studentNumber?: string;
  program?: string;
  thesisTitle?: string;
  enrollmentStatus?: string;
  workflowStatus?: string;
  currentStage?: string;
}

export default function AdviserStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/users?role=student&enrich=true', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data.users || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load students';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const name = `${s.profile?.firstName || ''} ${s.profile?.lastName || ''}`.toLowerCase();
    const query = search.toLowerCase();
    return (
      name.includes(query) ||
      (s.studentNumber || '').toLowerCase().includes(query) ||
      (s.program || '').toLowerCase().includes(query)
    );
  });

  const activeCount = students.filter((s) => s.enrollmentStatus === 'active' || !s.enrollmentStatus).length;
  const withThesisCount = students.filter((s) => s.thesisTitle).length;
  const inProgressCount = students.filter((s) => s.workflowStatus === 'active').length;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Students</h2>
        <p className="text-sm text-gray-500">View and manage your advisees</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Total Students" value={students.length} icon={<UsersIcon />} />
        <StatsCard title="Active" value={activeCount} icon={<ActiveIcon />} />
        <StatsCard title="With Thesis Title" value={withThesisCount} icon={<ThesisIcon />} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
          />
        </div>
        <span className="text-sm text-gray-500">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <DataTable
        columns={[
          {
            key: 'name',
            header: 'Name',
            sortable: false,
            render: (s: Student) => `${s.profile?.firstName || ''} ${s.profile?.lastName || ''}`,
          },
          { key: 'studentNumber', header: 'Student No.', sortable: true },
          { key: 'program', header: 'Program', sortable: true },
          {
            key: 'thesisTitle',
            header: 'Thesis Title',
            sortable: false,
            render: (s: Student) => s.thesisTitle || '—',
          },
          {
            key: 'currentStage',
            header: 'Stage',
            sortable: false,
            render: (s: Student) => s.currentStage || '—',
          },
          {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (s: Student) => (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  s.workflowStatus === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : s.workflowStatus === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {s.workflowStatus || s.enrollmentStatus || 'Active'}
              </span>
            ),
          },
        ]}
        data={filtered}
        keyExtractor={(s) => s._id}
        emptyMessage="No students found."
      />
    </div>
  );
}


