import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    void request;
    void auth;
    const [{ count: usersCount }, { data: users, count: activeUsersCount }] = await Promise.all([
      supabaseAdmin.from('users').select('*', { head: true, count: 'exact' }),
      supabaseAdmin
        .from('users')
        .select('email', { count: 'exact' })
        .eq('is_active', true)
        .limit(4),
    ]);

    return NextResponse.json({
      usersCount: usersCount ?? 0,
      activeUsersCount: activeUsersCount ?? 0,
      firstFewEmails: (users ?? []).map((u) => u.email),
    });
  }, ['admin']);
}
