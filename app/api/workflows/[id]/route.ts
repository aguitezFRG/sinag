import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (request, auth) => {
    void request;
    void auth;
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid workflow id' }, { status: 400 });
    }

    const { data: workflow, error } = await supabaseAdmin
      .from('workflows')
      .select('id, student_id, adviser_id, title, status, current_stage, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    return NextResponse.json({
      workflow: {
        _id: workflow.id,
        studentId: workflow.student_id,
        adviserId: workflow.adviser_id,
        title: workflow.title,
        status: workflow.status,
        currentStage: workflow.current_stage,
        createdAt: workflow.created_at,
        updatedAt: workflow.updated_at,
      },
    });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (request, auth) => {
    void request;
    void auth;
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid workflow id' }, { status: 400 });
    }
    const body = await req.json();

    const updatePayload: Record<string, unknown> = {};
    if (typeof body.title === 'string') updatePayload.title = body.title;
    if (typeof body.status === 'string') updatePayload.status = body.status;
    if (typeof body.currentStage === 'string') updatePayload.current_stage = body.currentStage;

    const { data: workflow, error } = await supabaseAdmin
      .from('workflows')
      .update(updatePayload)
      .eq('id', id)
      .select('id, student_id, adviser_id, title, status, current_stage, created_at, updated_at')
      .maybeSingle();

    if (error || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    return NextResponse.json({
      workflow: {
        _id: workflow.id,
        studentId: workflow.student_id,
        adviserId: workflow.adviser_id,
        title: workflow.title,
        status: workflow.status,
        currentStage: workflow.current_stage,
        createdAt: workflow.created_at,
        updatedAt: workflow.updated_at,
      },
    });
  });
}
