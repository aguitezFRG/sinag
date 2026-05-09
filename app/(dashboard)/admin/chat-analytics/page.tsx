'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart2, MessageSquare, RefreshCw, Star, TrendingUp, Users } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Overview {
  totalSessions: number;
  totalRatings: number;
  avgRating: number;
  todaySessions: number;
}

interface DailyPoint { date: string; count: number }
interface TopIntent { intent: string; count: number }
interface RatingEntry {
  id: string;
  rating: number;
  user_role: string;
  feedback: string | null;
  message_count: number;
  created_at: string;
  users: { first_name: string; last_name: string; email: string } | null;
}

interface AnalyticsData {
  overview: Overview;
  ratingDistribution: Record<number, number>;
  sessionsByRole: Record<string, number>;
  dailyTrend: DailyPoint[];
  topIntents: TopIntent[];
  recentRatings: RatingEntry[];
}

// ── Mini chart helpers ────────────────────────────────────────────────────────

function HBarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 truncate text-gray-600 flex-shrink-0 capitalize">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right font-semibold text-gray-700">{value}</span>
    </div>
  );
}

function RatingBars({ dist }: { dist: Record<number, number> }) {
  const values = [1, 2, 3, 4, 5].map((s) => dist[s] ?? 0);
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values, 1);
  const MAX_BAR_H = 130;
  const barColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-green-500'];
  const barBorders = ['border-red-500', 'border-orange-500', 'border-yellow-500', 'border-lime-600', 'border-green-600'];

  return (
    <div className="flex items-end gap-3 mt-2" style={{ height: '200px' }}>
      {values.map((count, i) => {
        const barH = Math.round((count / max) * MAX_BAR_H);
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="flex flex-col items-center justify-end mb-2" style={{ height: '52px' }}>
              {count > 0 && (
                <>
                  <span className="text-sm font-bold text-gray-800 leading-tight">{count}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{pct}%</span>
                </>
              )}
            </div>
            <div
              className={`w-full ${barColors[i]} border-t-2 ${barBorders[i]} rounded-t-lg shadow-sm transition-all duration-700`}
              style={{ height: `${Math.max(barH, count > 0 ? 8 : 0)}px` }}
            />
            <span className="text-xs font-semibold text-gray-500 mt-2">{i + 1}★</span>
          </div>
        );
      })}
    </div>
  );
}

function Sparkline({ data }: { data: DailyPoint[] }) {
  if (data.length < 2) return null;
  const counts = data.map((d) => d.count);
  const maxVal = Math.max(...counts, 1);
  const W = 400;
  const H = 140;
  const PAD = { top: 24, right: 16, bottom: 8, left: 30 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const xOf = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const yOf = (v: number) => PAD.top + chartH - Math.round((v / maxVal) * chartH);

  const linePts = counts.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
  const areaPath = [
    `M ${xOf(0).toFixed(1)},${(PAD.top + chartH).toFixed(1)}`,
    ...counts.map((v, i) => `L ${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`),
    `L ${xOf(counts.length - 1).toFixed(1)},${(PAD.top + chartH).toFixed(1)}`,
    'Z',
  ].join(' ');

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    y: PAD.top + chartH - pct * chartH,
    label: Math.round(maxVal * pct),
  }));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0C0B5D" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#0C0B5D" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Horizontal gridlines + y-axis labels */}
        {gridLines.map(({ y, label }) => (
          <g key={y}>
            <line x1={PAD.left} y1={y.toFixed(1)} x2={W - PAD.right} y2={y.toFixed(1)}
              stroke="#f3f4f6" strokeWidth="1" />
            <text x={PAD.left - 6} y={(y + 3.5).toFixed(1)} textAnchor="end"
              fontSize="9.5" fill="#d1d5db">{label}</text>
          </g>
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />
        {/* Line */}
        <polyline points={linePts} fill="none" stroke="#0C0B5D" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots + value labels */}
        {counts.map((v, i) => (
          <g key={i}>
            {v > 0 && (
              <text x={xOf(i).toFixed(1)} y={(yOf(v) - 8).toFixed(1)} textAnchor="middle"
                fontSize="10" fontWeight="700" fill="#0C0B5D">{v}</text>
            )}
            <circle cx={xOf(i).toFixed(1)} cy={yOf(v).toFixed(1)}
              r="4.5" fill="white" stroke="#0C0B5D" strokeWidth="2.5" />
          </g>
        ))}
      </svg>
      {/* Day labels aligned to chart area */}
      <div className="flex justify-between mt-1" style={{ paddingLeft: '7.5%', paddingRight: '4%' }}>
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-gray-400">
            {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
        ))}
      </div>
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-100'}`} />
      ))}
    </span>
  );
}

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-500',
  adviser: 'bg-purple-500',
  coordinator: 'bg-emerald-500',
  admin: 'bg-gray-500',
};

const ROLE_BADGE: Record<string, string> = {
  student: 'bg-blue-50 text-blue-700 border-blue-200',
  adviser: 'bg-purple-50 text-purple-700 border-purple-200',
  coordinator: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  admin: 'bg-gray-100 text-gray-700 border-gray-200',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminChatAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/chat-analytics', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load analytics');
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0C0B5D]/20 border-t-[#0C0B5D] rounded-full animate-spin" />
      </div>
    );
  }

  const roleEntries = Object.entries(data?.sessionsByRole ?? {}).sort((a, b) => b[1] - a[1]);
  const maxRole = Math.max(...roleEntries.map((e) => e[1]), 1);
  const intentEntries = (data?.topIntents ?? []).slice(0, 6);
  const maxIntent = Math.max(...intentEntries.map((e) => e.count), 1);
  const avgRating = data?.overview.avgRating ?? 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0C0B5D]">Chat Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            SINAG conversation usage, ratings, and insights across all roles
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* ── Overview stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Sessions',
            value: data?.overview.totalSessions ?? 0,
            icon: <MessageSquare className="w-4 h-4" />,
            sub: `${data?.overview.todaySessions ?? 0} today`,
            color: 'bg-blue-50 text-blue-600 border-blue-100',
          },
          {
            label: 'Avg Rating',
            value: avgRating > 0 ? avgRating.toFixed(1) : '—',
            icon: <Star className="w-4 h-4" />,
            sub: `out of 5 stars`,
            color: 'bg-amber-50 text-amber-600 border-amber-100',
          },
          {
            label: 'Rated Sessions',
            value: data?.overview.totalRatings ?? 0,
            icon: <BarChart2 className="w-4 h-4" />,
            sub: data?.overview.totalSessions
              ? `${Math.round(((data.overview.totalRatings) / data.overview.totalSessions) * 100)}% response rate`
              : '0% response rate',
            color: 'bg-purple-50 text-purple-600 border-purple-100',
          },
          {
            label: 'Active Roles',
            value: Object.keys(data?.sessionsByRole ?? {}).length,
            icon: <Users className="w-4 h-4" />,
            sub: roleEntries.map(([r]) => r).join(', ') || 'None yet',
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</span>
              <span className={`p-1.5 rounded-lg border ${card.color}`}>{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row 1 ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Daily trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#0C0B5D]" />
            <h2 className="text-sm font-bold text-gray-900">Conversations — Last 7 Days</h2>
          </div>
          {(data?.dailyTrend?.length ?? 0) >= 2 ? (
            <Sparkline data={data!.dailyTrend} />
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">Not enough data yet</p>
          )}
          {data?.dailyTrend && (
            <p className="text-[10px] text-gray-400 mt-2 text-right">
              Total this week:{' '}
              <strong className="text-gray-600">{data.dailyTrend.reduce((s, d) => s + d.count, 0)}</strong> sessions
            </p>
          )}
        </div>

        {/* Sessions by role */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#0C0B5D]" />
            <h2 className="text-sm font-bold text-gray-900">Rated Sessions by Role</h2>
          </div>
          {roleEntries.length > 0 ? (
            <div className="space-y-2.5 mt-1">
              {roleEntries.map(([role, count]) => (
                <HBarRow key={role} label={role} value={count} max={maxRole} color={ROLE_COLORS[role] ?? 'bg-gray-400'} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No rated sessions yet</p>
          )}
        </div>
      </div>

      {/* ── Charts row 2 ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Rating distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-900">Rating Distribution</h2>
            </div>
            {avgRating > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {avgRating.toFixed(1)} avg
              </span>
            )}
          </div>
          {data && <RatingBars dist={data.ratingDistribution} />}
        </div>

        {/* Top intents */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-[#0C0B5D]" />
            <h2 className="text-sm font-bold text-gray-900">Top Query Intents</h2>
          </div>
          {intentEntries.length > 0 ? (
            <div className="space-y-2.5">
              {intentEntries.map(({ intent, count }) => (
                <HBarRow key={intent} label={intent.replace(/_/g, ' ')} value={count} max={maxIntent} color="bg-[#0C0B5D]" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No intent data yet</p>
          )}
        </div>
      </div>

      {/* ── Recent ratings table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-900">Recent Ratings</h2>
          </div>
          <span className="text-xs text-gray-400">{data?.recentRatings?.length ?? 0} shown</span>
        </div>

        {(data?.recentRatings?.length ?? 0) === 0 ? (
          <div className="py-10 text-center">
            <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No ratings submitted yet.</p>
            <p className="text-xs text-gray-400 mt-1">Ratings appear here after users end a chat conversation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Feedback</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Msgs</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data!.recentRatings.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">
                        {r.users ? `${r.users.first_name} ${r.users.last_name}` : 'Unknown'}
                      </p>
                      <p className="text-gray-400 truncate max-w-[120px]">{r.users?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${ROLE_BADGE[r.user_role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {r.user_role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StarDisplay rating={r.rating} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell max-w-[200px]">
                      {r.feedback ? (
                        <p className="text-gray-600 line-clamp-2 leading-relaxed">{r.feedback}</p>
                      ) : (
                        <span className="text-gray-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-500">{r.message_count}</td>
                    <td className="px-4 py-3 text-right text-gray-400 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="text-center pb-2">
        <Link href="/admin" className="text-xs text-gray-400 hover:text-[#0C0B5D] transition-colors">
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
