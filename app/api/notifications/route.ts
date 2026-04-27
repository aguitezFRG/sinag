import { NextRequest, NextResponse } from 'next/server';
import { notifications } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'u1';

  const result = notifications.filter((n) => n.userId === userId);
  const unreadCount = result.filter((n) => !n.isRead).length;

  return NextResponse.json({ notifications: result, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const ids = body.ids as string[] | undefined;

  if (ids && ids.length > 0) {
    notifications.forEach((n) => {
      if (ids.includes(n._id)) n.isRead = true;
    });
  } else {
    // Mark all as read for default user
    notifications.forEach((n) => {
      if (n.userId === 'u1') n.isRead = true;
    });
  }

  return NextResponse.json({ success: true });
}
