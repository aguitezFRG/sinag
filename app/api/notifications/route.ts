import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { notifications } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    const result = notifications.filter((n) => n.userId === auth.userId);
    const unreadCount = result.filter((n) => !n.isRead).length;
    return NextResponse.json({ notifications: result, unreadCount });
  });
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    const body = await req.json();
    const ids = body.ids as string[] | undefined;

    if (ids && ids.length > 0) {
      notifications.forEach((n) => {
        if (ids.includes(n._id)) n.isRead = true;
      });
    } else {
      notifications.forEach((n) => {
        if (n.userId === auth.userId) n.isRead = true;
      });
    }

    return NextResponse.json({ success: true });
  });
}
