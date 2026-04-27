import { NextRequest, NextResponse } from 'next/server';
import { workflows } from '@/lib/dummy-data';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; stageId: string }> }) {
  const { id, stageId } = await params;
  const workflow = workflows.find((w) => w._id === id);
  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }
  const stage = workflow.stages.find((s: any) => s.name === stageId || s.order === parseInt(stageId));
  if (!stage) {
    return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
  }
  stage.status = 'submitted';
  workflow.updatedAt = new Date().toISOString();
  return NextResponse.json({ workflow });
}
