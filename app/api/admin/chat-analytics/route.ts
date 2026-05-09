import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
      const todayStart = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';

      const [
        { data: allQueryData },
        { data: allRatings },
        { data: recentRatingsData },
        { data: dailyData },
        { data: intentData },
        { data: todayData },
      ] = await Promise.all([
        // All session IDs ever
        supabaseAdmin.from('ai_queries').select('session_id'),
        // All ratings — role, rating, timestamps
        supabaseAdmin
          .from('session_ratings')
          .select('rating, user_role, created_at, feedback, message_count'),
        // Recent ratings with user details
        supabaseAdmin
          .from('session_ratings')
          .select('id, rating, user_role, feedback, message_count, created_at, users(first_name, last_name, email)')
          .order('created_at', { ascending: false })
          .limit(15),
        // Last 7 days — for daily trend
        supabaseAdmin
          .from('ai_queries')
          .select('session_id, created_at')
          .gte('created_at', sevenDaysAgo),
        // Top intents (last 500 queries)
        supabaseAdmin
          .from('ai_queries')
          .select('intent')
          .order('created_at', { ascending: false })
          .limit(500),
        // Today's sessions
        supabaseAdmin.from('ai_queries').select('session_id').gte('created_at', todayStart),
      ]);

      // ── Overview ────────────────────────────────────────────────
      const totalSessions = new Set(allQueryData?.map((q) => q.session_id) ?? []).size;
      const todaySessions = new Set(todayData?.map((q) => q.session_id) ?? []).size;

      const ratings = allRatings ?? [];
      const avgRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((s, r) => s + (r.rating ?? 0), 0) / ratings.length) * 10) / 10
          : 0;

      // ── Rating distribution ──────────────────────────────────────
      const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const r of ratings) {
        if (r.rating >= 1 && r.rating <= 5) ratingDistribution[r.rating]++;
      }

      // ── Sessions by role ─────────────────────────────────────────
      const sessionsByRole: Record<string, number> = {};
      for (const r of ratings) {
        sessionsByRole[r.user_role] = (sessionsByRole[r.user_role] ?? 0) + 1;
      }

      // ── Daily trend (last 7 days) ────────────────────────────────
      const dailyBuckets: Record<string, Set<string>> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyBuckets[d.toISOString().split('T')[0]] = new Set();
      }
      for (const q of dailyData ?? []) {
        const day = (q.created_at as string).split('T')[0];
        dailyBuckets[day]?.add(q.session_id as string);
      }
      const dailyTrend = Object.entries(dailyBuckets).map(([date, sessions]) => ({
        date,
        count: sessions.size,
      }));

      // ── Top intents ──────────────────────────────────────────────
      const intentCounts: Record<string, number> = {};
      for (const q of intentData ?? []) {
        if (q.intent) intentCounts[q.intent as string] = (intentCounts[q.intent as string] ?? 0) + 1;
      }
      const topIntents = Object.entries(intentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([intent, count]) => ({ intent, count }));

      return NextResponse.json({
        overview: {
          totalSessions,
          totalRatings: ratings.length,
          avgRating,
          todaySessions,
        },
        ratingDistribution,
        sessionsByRole,
        dailyTrend,
        topIntents,
        recentRatings: recentRatingsData ?? [],
      });
    },
    ['admin']
  );
}
