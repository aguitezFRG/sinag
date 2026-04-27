'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  MailOpen,
  Mail,
  Megaphone,
  FileText,
  Target,
  MessageSquare,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import DataTable from '@/app/components/DataTable';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export type NotificationType = 'system' | 'adviser' | 'milestone' | 'document' | 'announcement' | 'feedback' | 'approval' | 'deadline';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
  link?: string;
}

const typeIcons: Record<NotificationType, typeof Bell> = {
  system: AlertCircle,
  adviser: MessageSquare,
  milestone: Target,
  document: FileText,
  announcement: Megaphone,
  feedback: MessageSquare,
  approval: Check,
  deadline: Clock,
};

const typeColors: Record<NotificationType, string> = {
  system: 'bg-gray-100 text-gray-700 border-gray-300',
  adviser: 'bg-purple-100 text-purple-700 border-purple-300',
  milestone: 'bg-blue-100 text-blue-700 border-blue-300',
  document: 'bg-orange-100 text-orange-700 border-orange-300',
  announcement: 'bg-red-100 text-red-700 border-red-300',
  feedback: 'bg-purple-100 text-purple-700 border-purple-300',
  approval: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  deadline: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

const typeLabels: Record<NotificationType, string> = {
  system: 'System',
  adviser: 'Adviser',
  milestone: 'Milestone',
  document: 'Document',
  announcement: 'Announcement',
  feedback: 'Feedback',
  approval: 'Approval',
  deadline: 'Deadline',
};

const readStatusTabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
] as const;

const typeFilters: { key: NotificationType | 'all'; label: string }[] = [
  { key: 'all', label: 'All Types' },
  { key: 'system', label: 'System' },
  { key: 'adviser', label: 'Adviser' },
  { key: 'milestone', label: 'Milestone' },
  { key: 'document', label: 'Document' },
  { key: 'announcement', label: 'Announcement' },
];

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [markingRead, setMarkingRead] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/notifications', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    const matchesReadStatus =
      activeTab === 'all' ? true : activeTab === 'unread' ? !n.isRead : n.isRead;
    const matchesType = typeFilter === 'all' ? true : n.type === typeFilter;
    return matchesReadStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const markAsRead = async (ids: string[]) => {
    try {
      setMarkingRead(true);
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.filter(id => notifications.find(n => n._id === id && !n.isRead)).length));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setMarkingRead(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingRead(true);
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setMarkingRead(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (notification.link) return notification.link;
    if (notification.relatedType === 'workflow') return `/${user?.role}/workflow`;
    if (notification.relatedType === 'document') return `/${user?.role}/documents`;
    return '#';
  };

  const columns = [
    {
      key: 'status',
      header: '',
      sortable: false,
      render: (n: Notification) => (
        <div className="flex items-center justify-center">
          {n.isRead ? (
            <MailOpen className="w-5 h-5 text-gray-400" />
          ) : (
            <Mail className="w-5 h-5 text-[#0C0B5D]" />
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (n: Notification) => {
        const Icon = typeIcons[n.type] || Bell;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[n.type].split(' ')[0]}`}>
              <Icon className={`w-4 h-4 ${typeColors[n.type].split(' ')[1]}`} />
            </div>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[n.type]}`}>
              {typeLabels[n.type] || n.type}
            </span>
          </div>
        );
      },
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (n: Notification) => (
        <Link
          href={getNotificationLink(n)}
          onClick={() => handleNotificationClick(n)}
          className={`font-semibold hover:text-[#0C0B5D] hover:underline ${
            n.isRead ? 'text-gray-700' : 'text-gray-900'
          }`}
        >
          {n.title}
        </Link>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      sortable: false,
      render: (n: Notification) => (
        <p className={`text-sm line-clamp-2 ${n.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
          {n.message}
        </p>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (n: Notification) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {new Date(n.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          <span className="text-gray-400 mx-1">•</span>
          {new Date(n.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (n: Notification) => (
        <div className="flex items-center gap-2">
          {!n.isRead ? (
            <button
              onClick={() => markAsRead([n._id])}
              disabled={markingRead}
              className="text-sm font-medium text-[#0C0B5D] hover:underline disabled:opacity-50"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-gray-400">Read</span>
          )}
        </div>
      ),
    },
  ];

  if (authLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0C0B5D] rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage your notifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${user?.role}`}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-3xl font-bold text-blue-700">{unreadCount}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Unread Notifications</h3>
            <p className="text-xs text-gray-600">Requires your attention</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-700" />
              </div>
              <span className="text-3xl font-bold text-gray-700">{notifications.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Notifications</h3>
            <p className="text-xs text-gray-600">All time notifications</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-emerald-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <span className="text-3xl font-bold text-emerald-700">
                {notifications.length - unreadCount}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Read Notifications</h3>
            <p className="text-xs text-gray-600">Already reviewed</p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-6 border-b-2 border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Read Status Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {readStatusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-[#0C0B5D] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Type Filter & Bulk Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as NotificationType | 'all');
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0C0B5D] focus:ring-1 focus:ring-[#0C0B5D]"
              >
                {typeFilters.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingRead}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All as Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Notifications Table */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size={40} />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                {activeTab === 'unread'
                  ? "You don't have any unread notifications. Great job staying on top of things!"
                  : activeTab === 'read'
                  ? "You haven't read any notifications yet."
                  : "You don't have any notifications at the moment."}
              </p>
              {(typeFilter !== 'all' || activeTab !== 'all') && (
                <button
                  onClick={() => {
                    setTypeFilter('all');
                    setActiveTab('all');
                  }}
                  className="mt-4 text-sm font-medium text-[#0C0B5D] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={paginatedNotifications}
                keyExtractor={(n) => n._id}
                emptyMessage="No notifications found."
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of{' '}
                    {filteredNotifications.length} notifications
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
