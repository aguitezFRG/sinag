'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DataTable from '@/app/components/DataTable';
import StatsCard from '@/app/components/StatsCard';
import { ActiveIcon, CompletedIcon, PauseIcon } from '@/app/components/Icons';

interface Workflow {
  _id: string;
  title: string;
  studentName?: string;
  adviserName?: string;
  status: string;
  currentStage: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoordinatorWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/workflows', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch workflows');
        const data = await res.json();
        setWorkflows(data.workflows || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load workflows';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflows();
  }, []);

  const filtered = workflows.filter((w) => {
    const query = search.toLowerCase();
    const matchesSearch =
      w.title.toLowerCase().includes(query) ||
      (w.studentName || '').toLowerCase().includes(query) ||
      (w.adviserName || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = workflows.filter((w) => w.status === 'active').length;
  const completedCount = workflows.filter((w) => w.status === 'completed').length;
  const onHoldCount = workflows.filter((w) => w.status === 'on_hold').length;

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
        <h2 className="text-2xl font-bold text-gray-900">All Workflows</h2>
        <p className="text-sm text-gray-500">Manage and monitor all program workflows</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Active" value={activeCount} icon={<ActiveIcon />} />
        <StatsCard title="Completed" value={completedCount} icon={<CompletedIcon />} />
        <StatsCard title="On Hold" value={onHoldCount} icon={<PauseIcon />} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <span className="text-sm text-gray-500">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <DataTable
        columns={[
          { key: 'title', header: 'Title', sortable: true },
          {
            key: 'student',
            header: 'Student',
            sortable: false,
            render: (w: Workflow) => w.studentName || '—',
          },
          {
            key: 'adviser',
            header: 'Adviser',
            sortable: false,
            render: (w: Workflow) => w.adviserName || '—',
          },
          {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (w: Workflow) => (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  w.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : w.status === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {w.status}
              </span>
            ),
          },
          { key: 'currentStage', header: 'Current Stage', sortable: true },
          {
            key: 'updatedAt',
            header: 'Last Updated',
            sortable: true,
            render: (w: Workflow) => new Date(w.updatedAt).toLocaleDateString(),
          },
        ]}
        data={filtered}
        keyExtractor={(w) => w._id}
        emptyMessage="No workflows found."
      />
    </div>
  );
}


