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
      .select('id, stage_order')
      .eq('workflow_id', id);
    stageQuery = isStageOrder ? stageQuery.eq('stage_order', stageOrder) : stageQuery.eq('name', stageId);
    const { data: stage } = await stageQuery.maybeSingle();
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { error: approveError } = await supabaseAdmin
      .from('workflow_stages')
      .update({ status: 'approved', completed_at: now })
      .eq('id', stage.id);
    if (approveError) {
      return NextResponse.json({ error: approveError.message }, { status: 500 });
    }

    const { data: nextStage } = await supabaseAdmin
      .from('workflow_stages')
      .select('id, name')
      .eq('workflow_id', id)
      .eq('stage_order', stage.stage_order + 1)
      .maybeSingle();

    if (nextStage) {
      await supabaseAdmin.from('workflow_stages').update({ status: 'in_progress' }).eq('id', nextStage.id);
      await supabaseAdmin.from('workflows').update({ current_stage: nextStage.name }).eq('id', id);
    } else {
      await supabaseAdmin.from('workflows').update({ status: 'completed' }).eq('id', id);
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
  }, ['adviser', 'coordinator', 'admin']);
}
