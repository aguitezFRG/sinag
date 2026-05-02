import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

// ============================================
// RESPONSE TYPE INTERFACES
// ============================================

export interface AdviseeItem {
  _id: string;
  name: string;
  program: string;
  nextMilestone: string;
  status: 'on-track' | 'needs-attention';
}

export interface AdviseesResponse {
  students: AdviseeItem[];
  summary: {
    totalAdvisees: number;
    onTrackCount: number;
    needsAttentionCount: number;
  };
}

// ============================================
// GET /api/adviser/students
// Auth: adviser, coordinator, admin
// Returns: students[] with status ('on-track' or 'needs-attention')
// ============================================

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (_req, auth) => {
      try {
        if (!isUuid(auth.userId)) {
          return NextResponse.json({
            students: [],
            summary: { totalAdvisees: 0, onTrackCount: 0, needsAttentionCount: 0 },
          } as AdviseesResponse);
        }

        let studentsQuery = supabaseAdmin
          .from('students')
          .select('id, user_id, program, advisers:adviser_id ( id ), users:user_id ( first_name, last_name )')
          .order('created_at', { ascending: false });

        if (auth.role === 'adviser') {
          const { data: adviser } = await supabaseAdmin
            .from('advisers')
            .select('id')
            .eq('user_id', auth.userId)
            .maybeSingle();

          if (!adviser) {
            return NextResponse.json({
              students: [],
              summary: { totalAdvisees: 0, onTrackCount: 0, needsAttentionCount: 0 },
            } as AdviseesResponse);
          }
          studentsQuery = studentsQuery.eq('adviser_id', adviser.id);
        }

        const { data: studentsRows, error: studentsError } = await studentsQuery;
        if (studentsError) {
          return NextResponse.json({ error: studentsError.message }, { status: 500 });
        }

        const studentIds = (studentsRows ?? []).map((s) => s.id);
        const { data: workflows } = studentIds.length
          ? await supabaseAdmin
              .from('workflows')
              .select('id, student_id, current_stage')
              .in('student_id', studentIds)
          : { data: [] as Array<{ id: string; student_id: string; current_stage: string }> };

        const workflowByStudent = new Map((workflows ?? []).map((w) => [w.student_id, w]));
        const workflowIds = (workflows ?? []).map((w) => w.id);
        const { data: stages } = workflowIds.length
          ? await supabaseAdmin
              .from('workflow_stages')
              .select('workflow_id, status, due_date')
              .in('workflow_id', workflowIds)
          : { data: [] as Array<{ workflow_id: string; status: string; due_date: string | null }> };
        const stagesByWorkflow = new Map<string, Array<{ status: string; due_date: string | null }>>();
        (stages ?? []).forEach((s) => {
          const arr = stagesByWorkflow.get(s.workflow_id) ?? [];
          arr.push({ status: s.status, due_date: s.due_date });
          stagesByWorkflow.set(s.workflow_id, arr);
        });

        const adviseesList: AdviseeItem[] = (studentsRows ?? []).map((student) => {
          const workflow = workflowByStudent.get(student.id);
          const now = new Date();
          const hasOverdue =
            (stagesByWorkflow.get(workflow?.id || '') ?? []).some(
              (s) => s.status !== 'approved' && s.due_date && new Date(s.due_date) < now
            );
          const userRel = student.users as
            | { first_name: string; last_name: string }
            | Array<{ first_name: string; last_name: string }>
            | null;
          const user = Array.isArray(userRel) ? userRel[0] ?? null : userRel;

          return {
            _id: student.id,
            name: user
              ? `${user.first_name} ${user.last_name}`
              : 'Unknown',
            program: student.program,
            nextMilestone: workflow?.current_stage || 'Not started',
            status: hasOverdue ? 'needs-attention' : 'on-track',
          };
        });

        // Calculate summary
        const onTrackCount = adviseesList.filter((s) => s.status === 'on-track').length;
        const needsAttentionCount = adviseesList.filter(
          (s) => s.status === 'needs-attention'
        ).length;

        const response: AdviseesResponse = {
          students: adviseesList,
          summary: {
            totalAdvisees: adviseesList.length,
            onTrackCount,
            needsAttentionCount,
          },
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error fetching advisees:', error);
        return NextResponse.json(
          { error: 'Failed to fetch advisees' },
          { status: 500 }
        );
      }
    },
    ['adviser', 'coordinator', 'admin']
  );
}
