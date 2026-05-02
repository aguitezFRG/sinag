import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

type WorkflowStageRow = {
  id: string;
  name: string;
  stage_order: number;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  feedback: string | null;
};

type WorkflowRow = {
  id: string;
  student_id: string;
  adviser_id: string;
  title: string;
  status: string;
  current_stage: string;
  created_at: string;
  updated_at: string;
};

function mapWorkflow(
  row: WorkflowRow,
  stages: WorkflowStageRow[],
  studentName?: string,
  adviserName?: string
) {
  return {
    _id: row.id,
    studentId: row.student_id,
    adviserId: row.adviser_id,
    title: row.title,
    status: row.status,
    currentStage: row.current_stage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    studentName,
    adviserName,
    stages: stages
      .sort((a, b) => a.stage_order - b.stage_order)
      .map((s) => ({
        _id: s.id,
        name: s.name,
        order: s.stage_order,
        status: s.status,
        dueDate: s.due_date ?? undefined,
        completedAt: s.completed_at ?? undefined,
        feedback: s.feedback ?? undefined,
      })),
  };
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const adviserId = searchParams.get('adviserId');
    const mine = searchParams.get('mine') === 'true';

    const { data: workflowRows, error: workflowError } = await supabaseAdmin
      .from('workflows')
      .select('id, student_id, adviser_id, title, status, current_stage, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (workflowError) {
      return NextResponse.json({ error: workflowError.message }, { status: 500 });
    }

    let rows = (workflowRows ?? []) as WorkflowRow[];
    if (mine) {
      if (!isUuid(auth.userId)) return NextResponse.json({ workflows: [] });
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('user_id', auth.userId)
        .maybeSingle();
      rows = student ? rows.filter((w) => w.student_id === student.id) : [];
    }
    if (studentId && isUuid(studentId)) rows = rows.filter((w) => w.student_id === studentId);
    if (adviserId && isUuid(adviserId)) rows = rows.filter((w) => w.adviser_id === adviserId);

    const workflowIds = rows.map((w) => w.id);
    const studentIds = Array.from(new Set(rows.map((w) => w.student_id)));
    const adviserIds = Array.from(new Set(rows.map((w) => w.adviser_id)));

    const [{ data: stages }, { data: students }, { data: advisers }] = await Promise.all([
      workflowIds.length
        ? supabaseAdmin
            .from('workflow_stages')
            .select('id, workflow_id, name, stage_order, status, due_date, completed_at, feedback')
            .in('workflow_id', workflowIds)
        : Promise.resolve({ data: [] }),
      studentIds.length
        ? supabaseAdmin
            .from('students')
            .select('id, user_id')
            .in('id', studentIds)
        : Promise.resolve({ data: [] }),
      adviserIds.length
        ? supabaseAdmin
            .from('advisers')
            .select('id, user_id')
            .in('id', adviserIds)
        : Promise.resolve({ data: [] }),
    ]);

    const userIds = Array.from(
      new Set(
        [
          ...(((students as Array<{ id: string; user_id: string }>) ?? []).map((s) => s.user_id)),
          ...(((advisers as Array<{ id: string; user_id: string }>) ?? []).map((a) => a.user_id)),
        ].filter((id): id is string => Boolean(id))
      )
    );

    const { data: users } = userIds.length
      ? await supabaseAdmin.from('users').select('id, first_name, last_name').in('id', userIds)
      : { data: [] as Array<{ id: string; first_name: string; last_name: string }> };

    const stagesByWorkflow = new Map<string, WorkflowStageRow[]>();
    ((stages as Array<WorkflowStageRow & { workflow_id: string }>) ?? []).forEach((stage) => {
      const existing = stagesByWorkflow.get(stage.workflow_id) ?? [];
      existing.push(stage);
      stagesByWorkflow.set(stage.workflow_id, existing);
    });

    const studentNameById = new Map<string, string>();
    const userNameById = new Map<string, string>();
    ((users as Array<{ id: string; first_name: string; last_name: string }>) ?? []).forEach((u) => {
      userNameById.set(u.id, `${u.first_name} ${u.last_name}`);
    });

    (((students as Array<{ id: string; user_id: string }>) ?? [])).forEach((s) => {
      const fullName = userNameById.get(s.user_id);
      if (fullName) studentNameById.set(s.id, fullName);
    });

    const adviserNameById = new Map<string, string>();
    (((advisers as Array<{ id: string; user_id: string }>) ?? [])).forEach((a) => {
      const fullName = userNameById.get(a.user_id);
      if (fullName) adviserNameById.set(a.id, fullName);
    });

    const result = rows.map((row) =>
      mapWorkflow(
        row,
        stagesByWorkflow.get(row.id) ?? [],
        studentNameById.get(row.student_id),
        adviserNameById.get(row.adviser_id)
      )
    );

    return NextResponse.json({ workflows: result });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    void request;
    void auth;
    const body = await req.json();
    if (!isUuid(body.studentId) || !isUuid(body.adviserId)) {
      return NextResponse.json({ error: 'studentId and adviserId must be UUIDs' }, { status: 400 });
    }

    const { data: workflowRow, error: workflowError } = await supabaseAdmin
      .from('workflows')
      .insert({
        student_id: body.studentId,
        adviser_id: body.adviserId,
        title: body.title || 'Untitled Workflow',
        status: 'active',
        current_stage: body.stages?.[0]?.name || 'Topic Selection',
      })
      .select('id, student_id, adviser_id, title, status, current_stage, created_at, updated_at')
      .single();

    if (workflowError || !workflowRow) {
      return NextResponse.json({ error: workflowError?.message || 'Failed to create workflow' }, { status: 500 });
    }

    if (Array.isArray(body.stages) && body.stages.length > 0) {
      const stageRows = body.stages.map((stage: { name: string; order?: number; status?: string }, idx: number) => ({
        workflow_id: workflowRow.id,
        name: stage.name,
        stage_order: stage.order || idx + 1,
        status: stage.status || 'pending',
      }));
      const { error: stageError } = await supabaseAdmin.from('workflow_stages').insert(stageRows);
      if (stageError) {
        return NextResponse.json({ error: stageError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ workflow: mapWorkflow(workflowRow as WorkflowRow, []) });
  });
}
