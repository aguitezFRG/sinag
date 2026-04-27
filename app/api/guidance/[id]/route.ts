import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { guidanceResources } from '@/lib/dummy-data';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, _auth) => {
    const { id } = await params;
    const resource = guidanceResources.find((g) => g._id === id);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({ resource });
  });
}
