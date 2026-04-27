import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { documents } from '@/lib/dummy-data';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;
    const doc = documents.find((d) => d._id === id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    const body = await req.json();
    const newVersion = {
      versionNumber: (doc.versions?.length || 0) + 1,
      fileUrl: body.fileUrl || 'https://example.com/docs/uploaded.pdf',
      uploadedBy: auth.userId,
      uploadedAt: new Date().toISOString(),
      changeLog: body.changeLog || 'New version uploaded',
    };
    doc.versions.push(newVersion as any);
    doc.updatedAt = new Date().toISOString();
    return NextResponse.json({ document: doc });
  });
}
