import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    if (!isUuid(auth.userId)) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('id, user_id, type, title, message, related_id, related_type, is_read, created_at')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notifications = (data ?? []).map((n) => ({
      _id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      relatedId: n.related_id ?? undefined,
      relatedType: n.related_type ?? undefined,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return NextResponse.json({ notifications, unreadCount });
  });
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    if (!isUuid(auth.userId)) {
      return NextResponse.json({ success: true });
    }

    const body = await req.json();
    const ids = body.ids as string[] | undefined;

    if (ids && ids.length > 0) {
      const validIds = ids.filter((id) => isUuid(id));
      if (validIds.length > 0) {
        const { error } = await supabaseAdmin
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', auth.userId)
          .in('id', validIds);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', auth.userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  });
}
