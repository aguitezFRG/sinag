'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DataTable from '@/app/components/DataTable';

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  userEmail?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const url = new URL('/api/audit-logs', window.location.origin);
        if (actionFilter) url.searchParams.set('action', actionFilter);
        url.searchParams.set('limit', '100');
        const res = await fetch(url.toString(), { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [actionFilter]);

  const actionColors: Record<string, string> = {
    create: 'bg-emerald-100 text-emerald-700',
    read: 'bg-blue-100 text-blue-700',
    update: 'bg-amber-100 text-amber-700',
    delete: 'bg-red-100 text-red-700',
    login: 'bg-purple-100 text-purple-700',
    logout: 'bg-gray-100 text-gray-700',
    ai_query: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="text-sm text-gray-500">System activity and security audit trail</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="read">Read</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="ai_query">AI Query</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'timestamp', header: 'Timestamp', sortable: true, render: (l: AuditLog) => new Date(l.timestamp).toLocaleString() },
            { key: 'action', header: 'Action', sortable: true, render: (l: AuditLog) => (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${actionColors[l.action] || 'bg-gray-100 text-gray-700'}`}>
                {l.action}
              </span>
            )},
            { key: 'resource', header: 'Resource', sortable: true },
            { key: 'userEmail', header: 'User', sortable: false, render: (l: AuditLog) => l.userEmail || l.userId || 'System' },
            { key: 'ipAddress', header: 'IP Address', sortable: false, render: (l: AuditLog) => l.ipAddress || '—' },
          ]}
          data={logs}
          keyExtractor={(l) => l._id}
          emptyMessage="No audit logs found."
        />
      )}
    </div>
  );
}
