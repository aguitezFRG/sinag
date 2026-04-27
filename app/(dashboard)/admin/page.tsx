'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatsCard from '@/app/components/StatsCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DataTable from '@/app/components/DataTable';
import { UsersIcon, StudentIcon, AdviserIcon, WorkflowIcon, ChatIcon, DocIcon, ListIcon, HealthIcon, LogIcon } from '@/app/components/Icons';

interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalAdvisers: number;
  totalQueries: number;
  totalDocuments: number;
  totalWorkflows: number;
  activeWorkflows: number;
}

interface AuditEntry {
  _id: string;
  action: string;
  resource: string;
  userEmail?: string;
  userRole?: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, auditRes] = await Promise.all([
          fetch('/api/analytics/overview', { credentials: 'include' }),
          fetch('/api/audit-logs?limit=5', { credentials: 'include' }),
        ]);

        if (!cancelled) {
          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data);
          }
          if (auditRes.ok) {
            const data = await auditRes.json();
            setAudits(data.logs || []);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchData();

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">System administration and oversight</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon={<UsersIcon />} />
        <StatsCard title="Students" value={stats?.totalStudents || 0} icon={<StudentIcon />} />
        <StatsCard title="Advisers" value={stats?.totalAdvisers || 0} icon={<AdviserIcon />} />
        <StatsCard title="Active Workflows" value={stats?.activeWorkflows || 0} icon={<WorkflowIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="AI Queries" value={stats?.totalQueries || 0} icon={<ChatIcon />} />
        <StatsCard title="Documents" value={stats?.totalDocuments || 0} icon={<DocIcon />} />
        <StatsCard title="Total Workflows" value={stats?.totalWorkflows || 0} icon={<ListIcon />} />
        <StatsCard title="System Health" value="Healthy" change="All services operational" changeType="positive" icon={<HealthIcon />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Audit Logs</h3>
            <Link href="/admin/audit-logs" className="text-sm font-medium text-blue-800 hover:underline">
              View all
            </Link>
          </div>
          {audits.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <DataTable
                columns={[
                  {
                    key: 'action',
                    header: 'Action',
                    sortable: true,
                    render: (a: AuditEntry) => (
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {a.action}
                      </span>
                    ),
                  },
                  { key: 'resource', header: 'Resource', sortable: true },
                  {
                    key: 'user',
                    header: 'User',
                    sortable: false,
                    render: (a: AuditEntry) => a.userEmail || 'System',
                  },
                  {
                    key: 'timestamp',
                    header: 'Time',
                    sortable: true,
                    render: (a: AuditEntry) => new Date(a.timestamp).toLocaleString(),
                  },
                ]}
                data={audits}
                keyExtractor={(a) => a._id}
                emptyMessage="No audit logs found."
              />
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-500">
              No audit logs found.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <Link href="/admin/users" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <UsersIcon className="h-5 w-5 text-blue-800" />
              Manage Users
            </Link>
            <Link href="/admin/audit-logs" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <LogIcon />
              View Audit Logs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


