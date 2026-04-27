import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { documents } from '@/lib/dummy-data';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, _auth) => {
    const { id } = await params;
    const doc = documents.find((d) => d._id === id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, _auth) => {
    const { id } = await params;
    const idx = documents.findIndex((d) => d._id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    documents.splice(idx, 1);
    return NextResponse.json({ success: true });
  });
}
