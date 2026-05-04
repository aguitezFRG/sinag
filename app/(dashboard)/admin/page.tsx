'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatsCard from '@/app/components/StatsCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { UsersIcon, StudentIcon, AdviserIcon, LogIcon, ShieldIcon } from '@/app/components/Icons';

interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalAdvisers: number;
  totalCoordinators: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
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
      {/* Brand header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0C0B5D] p-6 text-white shadow-lg">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white shadow ring-2 ring-white/20">
            <img src="/images/sesam-logo.png" alt="SESAM seal" className="h-11 w-11 object-contain" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">A SESAM Initiative · UPLB</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-white/80">
              System administration and oversight for SINAG — the SESAM-grounded graduate advising platform.
            </p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Account totals — live from Supabase */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Accounts Overview</h3>
            <p className="text-xs text-gray-400">
              Live counts from the SINAG database · {stats?.activeUsers ?? 0} active / {stats?.inactiveUsers ?? 0} inactive
            </p>
          </div>
          <Link href="/admin/users" className="text-xs font-semibold text-[#0C0B5D] hover:underline">
            Manage users →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatsCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<UsersIcon />} />
          <StatsCard title="Students" value={stats?.totalStudents ?? 0} icon={<StudentIcon />} />
          <StatsCard title="Advisers" value={stats?.totalAdvisers ?? 0} icon={<AdviserIcon />} />
          <StatsCard title="Coordinators" value={stats?.totalCoordinators ?? 0} icon={<UsersIcon />} />
          <StatsCard title="Admins" value={stats?.totalAdmins ?? 0} icon={<ShieldIcon />} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C0B5D]/10 text-[#0C0B5D]">
              <LogIcon />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Audit Logs</h3>
              <p className="text-xs text-gray-500">Latest system activity across SINAG</p>
            </div>
          </div>
          <Link href="/admin/audit-logs" className="inline-flex items-center gap-1 rounded-lg border border-[#0C0B5D]/20 bg-white px-3 py-1.5 text-sm font-semibold text-[#0C0B5D] transition hover:bg-[#0C0B5D]/5">
            View all
          </Link>
        </div>
        {audits.length > 0 ? (
          <ul className="mt-2 divide-y divide-gray-100">
            {audits.map((a) => {
              const action = a.action.toLowerCase();
              const tone =
                action.includes('delete') || action.includes('remove')
                  ? 'bg-red-50 text-red-700'
                  : action.includes('create') || action.includes('add')
                  ? 'bg-emerald-50 text-emerald-700'
                  : action.includes('update') || action.includes('edit')
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-100 text-gray-700';
              return (
                <li key={a._id} className="flex items-start gap-3 py-3">
                  <span className={`mt-0.5 inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
                    {a.action}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="text-[#0C0B5D]">{a.resource}</span>
                      <span className="text-gray-500"> · by </span>
                      <span>{a.userEmail || 'System'}</span>
                      {a.userRole && (
                        <span className="ml-2 inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600">
                          {a.userRole}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-500">
            No audit logs found.
          </div>
        )}
      </div>
    </div>
  );
}


