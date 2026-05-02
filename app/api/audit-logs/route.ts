import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select(
        `
          id,
          user_id,
          action,
          resource,
          resource_id,
          details,
          timestamp
        `
      )
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type AuditLogRow = {
      id: string;
      user_id: string | null;
      action: string;
      resource: string;
      resource_id: string | null;
      timestamp: string;
      details: Record<string, unknown> | null;
    };

    const rows = (data ?? []) as AuditLogRow[];
    const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter((id): id is string => Boolean(id))));
    const { data: users } = userIds.length
      ? await supabaseAdmin.from('users').select('id, email, role').in('id', userIds)
      : { data: [] as Array<{ id: string; email: string; role: string }> };

    const userById = new Map<string, { email: string; role: string }>();
    ((users as Array<{ id: string; email: string; role: string }>) ?? []).forEach((u) => {
      userById.set(u.id, { email: u.email, role: u.role });
    });

    const logs = rows.map((log) => {
      const user = log.user_id ? userById.get(log.user_id) : undefined;
      return {
      _id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resource_id,
      userEmail: user?.email,
      userRole: user?.role,
      timestamp: log.timestamp,
      details: log.details ?? {},
      };
    });

    return NextResponse.json({ logs });
  }, ['admin']);
}
