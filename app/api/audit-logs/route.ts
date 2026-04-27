import { NextRequest, NextResponse } from 'next/server';
import { auditLogs, users } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const logs = auditLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .map((log) => {
      const user = users.find((u) => u._id === log.userId);
      return {
        _id: log._id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        userEmail: user?.email,
        userRole: user?.role,
        timestamp: log.timestamp,
        details: log.details,
      };
    });

  return NextResponse.json({ logs });
}
