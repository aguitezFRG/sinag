import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { workflows } from '@/lib/dummy-data';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, _auth) => {
    const { id } = await params;
    const workflow = workflows.find((w) => w._id === id);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    return NextResponse.json({ workflow });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, _auth) => {
    const { id } = await params;
    const workflow = workflows.find((w) => w._id === id);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    const body = await req.json();
    Object.assign(workflow, body, { updatedAt: new Date().toISOString() });
    return NextResponse.json({ workflow });
  });
}
