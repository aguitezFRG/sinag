import { NextRequest, NextResponse } from 'next/server';
import { documents, auditLogs, currentUser } from '@/lib/dummy-data';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = documents.find((d) => d._id === id);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { feedback, status } = body;

    // Append feedback to document metadata (store in a simple field for dummy data)
    (doc as any).adviserFeedback = feedback;
    (doc as any).reviewStatus = status || 'reviewed';
    doc.updatedAt = new Date().toISOString();

    // Log audit
    auditLogs.push({
      _id: `al${Date.now()}`,
      userId: currentUser?._id || 'u2',
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
}
