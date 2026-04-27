'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import StatsCard from '@/app/components/StatsCard';
import { UsersIcon, StudentIcon, ChatIcon, DocIcon, CheckIcon, WorkflowIcon, CompletedIcon, ClockIcon } from '@/app/components/Icons';

interface OverviewStats {
  totalUsers: number;
  totalStudents: number;
  totalAdvisers: number;
  totalQueries: number;
  totalDocuments: number;
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  onHoldWorkflows: number;
  completedMilestones: number;
  totalMilestones: number;
  milestoneCompletionRate: number;
}

interface AnalyticsDetail {
  stats: OverviewStats;
  programBreakdown: { program: string; students: number; activeWorkflows: number }[];
  monthlyActivity: { month: string; queries: number; submissions: number }[];
}

export default function CoordinatorAnalyticsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [detail, setDetail] = useState<AnalyticsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const [overviewRes, detailRes] = await Promise.all([
          fetch('/api/analytics/overview', { credentials: 'include' }),
          fetch('/api/analytics', { credentials: 'include' }),
        ]);

        if (!cancelled) {
          if (overviewRes.ok) {
            const data = await overviewRes.json();
            setOverview(data);
          }
          if (detailRes.ok) {
            const data = await detailRes.json();
            setDetail(data);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load analytics';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const queriesData = detail?.monthlyActivity || [];
  const workflowsData = [
    { status: 'active', count: overview?.activeWorkflows || 0 },
    { status: 'completed', count: overview?.completedWorkflows || 0 },
    { status: 'on_hold', count: overview?.onHoldWorkflows || 0 },
  ].filter((d) => d.count > 0);

  const maxQueries = Math.max(...queriesData.map((d) => d.queries), 1);
  const maxWorkflows = Math.max(...workflowsData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-sm text-gray-500">Program-level insights and usage metrics</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={overview?.totalUsers || 0} icon={<UsersIcon />} />
        <StatsCard title="Students" value={overview?.totalStudents || 0} icon={<StudentIcon />} />
        <StatsCard title="AI Queries" value={overview?.totalQueries || 0} icon={<ChatIcon />} />
        <StatsCard title="Documents" value={overview?.totalDocuments || 0} icon={<DocIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Completion Rate"
          value={`${overview?.milestoneCompletionRate || 0}%`}
          icon={<CheckIcon />}
        />
        <StatsCard title="Active Workflows" value={overview?.activeWorkflows || 0} icon={<WorkflowIcon />} />
        <StatsCard title="Completed" value={overview?.completedWorkflows || 0} icon={<CompletedIcon />} />
        <StatsCard title="Avg Completion" value="~14 mo" icon={<ClockIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Activity</h3>
          {queriesData.length > 0 ? (
            <div className="mt-4">
              <svg
                viewBox={`0 0 ${queriesData.length * 60 + 20} 200`}
                className="w-full h-48"
                preserveAspectRatio="none"
              >
                {/* Axes */}
                <line x1="30" y1="10" x2="30" y2="170" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="30" y1="170" x2={queriesData.length * 60 + 10} y2="170" stroke="#e5e7eb" strokeWidth="1" />
                {/* Bars */}
                {queriesData.map((d, i) => {
                  const barHeight = (d.queries / maxQueries) * 140;
                  const x = 40 + i * 60;
                  return (
                    <g key={d.month}>
                      <rect x={x} y={170 - barHeight} width="40" height={barHeight} rx="4" fill="#1e40af" opacity={0.85} />
                      <text x={x + 20} y="185" textAnchor="middle" fontSize="10" fill="#6b7280">
                        {d.month}
                      </text>
                      <text x={x + 20} y={170 - barHeight - 6} textAnchor="middle" fontSize="10" fill="#374151">
                        {d.queries}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-500">
              No monthly data available
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Workflows by Status</h3>
          {workflowsData.length > 0 ? (
            <div className="mt-4 space-y-4">
              {workflowsData.map((d) => (
                <div key={d.status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-700">{d.status.replace('_', ' ')}</span>
                    <span className="font-medium text-gray-900">{d.count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-blue-800"
                      style={{ width: `${(d.count / maxWorkflows) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-500">
              No workflow data available
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Program Breakdown</h3>
        {detail?.programBreakdown && detail.programBreakdown.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {detail.programBreakdown.map((prog) => (
              <div key={prog.program} className="rounded-lg border border-gray-100 p-4">
                <p className="text-sm font-medium text-gray-900">{prog.program}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="text-lg font-bold text-gray-900">{prog.students}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active Workflows</p>
                    <p className="text-lg font-bold text-gray-900">{prog.activeWorkflows}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-500">
            No program breakdown data available
          </div>
        )}
      </div>
    </div>
  );
}


