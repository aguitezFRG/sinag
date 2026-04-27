import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { documents, auditLogs } from '@/lib/dummy-data';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;
    const doc = documents.find((d) => d._id === id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    try {
      const body = await req.json();
      const { feedback, status } = body;

      (doc as any).adviserFeedback = feedback;
      (doc as any).reviewStatus = status || 'reviewed';
      doc.updatedAt = new Date().toISOString();

      auditLogs.push({
        _id: `al${Date.now()}`,
        userId: auth.userId,
        action: 'update',
        resource: 'document',
        resourceId: id,
        details: { feedback, status, title: doc.title },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date().toISOString(),
      } as any);

      return NextResponse.json({ success: true, document: doc });
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  }, ['adviser']);
}
