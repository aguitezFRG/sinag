import { NextRequest, NextResponse } from 'next/server';
import { documents } from '@/lib/dummy-data';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = documents.find((d) => d._id === id);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  return NextResponse.json({ document: doc });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = documents.findIndex((d) => d._id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  documents.splice(idx, 1);
  return NextResponse.json({ success: true });
}
