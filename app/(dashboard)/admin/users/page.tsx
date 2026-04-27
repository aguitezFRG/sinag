'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

interface User {
  _id: string;
  email: string;
  role: string;
  profile: { firstName: string; lastName: string };
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  async function fetchUsers() {
    try {
      setLoading(true);
      const url = new URL('/api/users', window.location.origin);
      if (roleFilter) url.searchParams.set('role', roleFilter);
      if (search) url.searchParams.set('q', search);
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, updates: { isActive: !isActive } }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: !isActive } : u)));
      setToast({ message: `User ${!isActive ? 'activated' : 'deactivated'} successfully`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const roleColors: Record<string, string> = {
    student: 'bg-blue-100 text-blue-700',
    adviser: 'bg-purple-100 text-purple-700',
    coordinator: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-500">Manage system users and their roles</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="block w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D] hover:border-gray-300 transition-all"
          />
        </form>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none w-full sm:w-auto px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D] hover:border-gray-300 transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="adviser">Adviser</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>
          <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'name', header: 'Name', sortable: false, render: (u: User) => `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}` },
            { key: 'email', header: 'Email', sortable: true },
            { key: 'role', header: 'Role', sortable: true, render: (u: User) => (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>
                {u.role}
              </span>
            )},
            { key: 'isActive', header: 'Status', sortable: true, render: (u: User) => (
              <span className={`text-xs font-medium ${u.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                {u.isActive ? 'Active' : 'Inactive'}
              </span>
            )},
            { key: 'lastLogin', header: 'Last Login', sortable: false, render: (u: User) => u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never' },
            { key: 'actions', header: 'Actions', sortable: false, render: (u: User) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedUser(u)}
                  className="text-sm font-medium text-blue-800 hover:underline"
                >
                  View
                </button>
                <button
                  onClick={() => toggleUserStatus(u._id, u.isActive)}
                  className="text-sm font-medium text-gray-600 hover:underline"
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )},
          ]}
          data={users}
          keyExtractor={(u) => u._id}
          emptyMessage="No users found."
        />
      )}

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
        {selectedUser && (
          <div className="space-y-3 text-sm">
            <p><span className="font-medium text-gray-700">Name:</span> {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}</p>
            <p><span className="font-medium text-gray-700">Email:</span> {selectedUser.email}</p>
            <p><span className="font-medium text-gray-700">Role:</span> <span className="capitalize">{selectedUser.role}</span></p>
            <p><span className="font-medium text-gray-700">Status:</span> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
            <p><span className="font-medium text-gray-700">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            <p><span className="font-medium text-gray-700">Last Login:</span> {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString() : 'Never'}</p>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
