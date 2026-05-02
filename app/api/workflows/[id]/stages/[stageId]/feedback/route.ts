import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; stageId: string }> }) {
  return withAuth(req, async (_req, _auth) => {
    const { id, stageId } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid workflow id' }, { status: 400 });
    }
    const stageOrder = Number.parseInt(stageId, 10);
    const isStageOrder = Number.isFinite(stageOrder) && stageOrder > 0;

    const { data: workflow, error: workflowError } = await supabaseAdmin
      .from('workflows')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    let stageQuery = supabaseAdmin
      .from('workflow_stages')
      .select('id')
      .eq('workflow_id', id);
    stageQuery = isStageOrder ? stageQuery.eq('stage_order', stageOrder) : stageQuery.eq('name', stageId);
    const { data: stage } = await stageQuery.maybeSingle();
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }
    const { feedback } = await req.json();

    const { error: updateError } = await supabaseAdmin
      .from('workflow_stages')
      .update({ feedback: feedback || null })
      .eq('id', stage.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { data: updatedWorkflow } = await supabaseAdmin
      .from('workflows')
      .select('id, title, status, current_stage, created_at, updated_at')
      .eq('id', id)
      .single();

    return NextResponse.json({
      workflow: updatedWorkflow
        ? {
            _id: updatedWorkflow.id,
            title: updatedWorkflow.title,
            status: updatedWorkflow.status,
            currentStage: updatedWorkflow.current_stage,
            createdAt: updatedWorkflow.created_at,
            updatedAt: updatedWorkflow.updated_at,
          }
        : { _id: id },
    });
  }, ['adviser']);
}
