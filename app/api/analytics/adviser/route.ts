import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

// ============================================
// RESPONSE TYPE INTERFACES
// ============================================

export interface AdviseeInfo {
  _id: string;
  name: string;
  program: string;
  thesisTitle: string | null;
  nextMilestone: string;
  status: 'on-track' | 'needs-attention' | 'at-risk';
  initials: string;
  lastActivity: string | null;
}

export interface RecentConsultation {
  _id: string;
  studentId: string;
  studentName: string;
  query: string;
  intent: string;
  createdAt: string;
}

export interface AdviserAnalyticsResponse {
  totalAdvisees: number;
  pendingReviews: number;
  upcomingDefenses: number;
  avgTimeToDefense: string;
  adviseeList: AdviseeInfo[];
  recentConsultations: RecentConsultation[];
}

// ============================================
// GET /api/analytics/adviser
// ============================================

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (_req, auth) => {
      try {
        if (!isUuid(auth.userId)) {
          return NextResponse.json({
            totalAdvisees: 0,
            pendingReviews: 0,
            upcomingDefenses: 0,
            avgTimeToDefense: '0.0y',
            adviseeList: [],
            recentConsultations: [],
          } satisfies AdviserAnalyticsResponse);
        }
        const { data: adviser } = await supabaseAdmin
          .from('advisers')
          .select('id')
          .eq('user_id', auth.userId)
          .maybeSingle();

        if (!adviser) {
          return NextResponse.json({
            totalAdvisees: 0,
            pendingReviews: 0,
            upcomingDefenses: 0,
            avgTimeToDefense: '0.0y',
            adviseeList: [],
            recentConsultations: [],
          } satisfies AdviserAnalyticsResponse);
        }

        const adviserId = adviser.id;

        const { data: advisees } = await supabaseAdmin
          .from('students')
          .select('id, user_id, program, thesis_title, start_date, expected_completion_date')
          .eq('adviser_id', adviserId);
        const students = advisees ?? [];
        const totalAdvisees = students.length;

        const studentIds = students.map((s) => s.id);
        const userIds = students.map((s) => s.user_id);
        const [workflowsRes, usersRes, docsRes, queriesRes] = await Promise.all([
          studentIds.length
            ? supabaseAdmin
                .from('workflows')
                .select('id, student_id, current_stage, updated_at')
                .in('student_id', studentIds)
            : Promise.resolve({ data: [] }),
          userIds.length
            ? supabaseAdmin.from('users').select('id, first_name, last_name').in('id', userIds)
            : Promise.resolve({ data: [] }),
          userIds.length
            ? supabaseAdmin
                .from('documents')
                .select('owner_id, updated_at')
                .in('owner_id', userIds)
            : Promise.resolve({ data: [] }),
          userIds.length
            ? supabaseAdmin
                .from('ai_queries')
                .select('id, user_id, query, intent, created_at')
                .in('user_id', userIds)
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [] }),
        ]);
        const adviseeWorkflows = workflowsRes.data ?? [];
        const users = usersRes.data ?? [];
        const documents = docsRes.data ?? [];
        const aiQueries = queriesRes.data ?? [];

        const workflowIds = adviseeWorkflows.map((w) => w.id);
        const { data: stages } = workflowIds.length
          ? await supabaseAdmin
              .from('workflow_stages')
              .select('workflow_id, name, status, due_date')
              .in('workflow_id', workflowIds)
          : { data: [] as Array<{ workflow_id: string; name: string; status: string; due_date: string | null }> };
        const stagesByWorkflow = new Map<string, Array<{ name: string; status: string; due_date: string | null }>>();
        (stages ?? []).forEach((s) => {
          const arr = stagesByWorkflow.get(s.workflow_id) ?? [];
          arr.push({ name: s.name, status: s.status, due_date: s.due_date });
          stagesByWorkflow.set(s.workflow_id, arr);
        });

        const pendingReviews = (stages ?? []).filter((s) => s.status === 'submitted').length;

        // Count upcoming defenses (scheduled or in_progress final defense)
        const upcomingDefenses = adviseeWorkflows.filter((w) => {
          const finalStage = (stagesByWorkflow.get(w.id) ?? []).find((s) => s.name === 'Final Defense');
          return (
            finalStage &&
            (finalStage.status === 'scheduled' ||
              finalStage.status === 'pending')
          );
        }).length;

        // Calculate average time to defense (based on start date to expected completion)
        const avgTimeToDefenseYears =
          students.length > 0
            ? (
                students.reduce((acc, s) => {
                  const start = new Date(s.start_date).getTime();
                  const expected = new Date(
                    s.expected_completion_date || Date.now()
                  ).getTime();
                  const durationMs = expected - start;
                  const durationYears =
                    durationMs / (1000 * 60 * 60 * 24 * 365);
                  return acc + durationYears;
                }, 0) / students.length
              ).toFixed(1)
            : '0.0';

        // Get advisee details with status
        const userById = new Map(users.map((u) => [u.id, u]));
        const workflowByStudent = new Map(adviseeWorkflows.map((w) => [w.student_id, w]));
        const adviseeList: AdviseeInfo[] = students.map((student) => {
          const user = userById.get(student.user_id);
          const workflow = workflowByStudent.get(student.id);
          const currentStage = (stagesByWorkflow.get(workflow?.id || '') ?? []).find(
            (s) => s.status === 'in_progress' || s.status === 'submitted'
          );
          const nextMilestone =
            currentStage?.name || workflow?.current_stage || 'Unknown';

          // Determine status based on overdue stages
          const now = new Date();
          const overdueStages =
            (stagesByWorkflow.get(workflow?.id || '') ?? []).filter((s) => {
              if (s.status === 'approved') return false;
              if (!s.due_date) return false;
              const dueDate = new Date(s.due_date);
              return dueDate < now;
            }) || [];

          let status: 'on-track' | 'needs-attention' | 'at-risk' = 'on-track';
          if (overdueStages.length >= 2) {
            status = 'at-risk';
          } else if (overdueStages.length === 1) {
            status = 'needs-attention';
          }

          // Get last activity timestamp
            const studentDocs = documents.filter(
              (d) => d.owner_id === student.user_id
            );
            const lastDoc = studentDocs.sort(
              (a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )[0];
          const lastActivity = lastDoc?.updated_at || workflow?.updated_at || null;

          return {
            _id: student.id,
            name: user
              ? `${user.first_name} ${user.last_name}`
              : 'Unknown',
            program: student.program,
            thesisTitle: student.thesis_title || null,
            nextMilestone,
            status,
            initials: user
              ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
              : '??',
            lastActivity,
          };
        });

        // Get recent AI consultations for adviser's students
        const recentConsultations: RecentConsultation[] = aiQueries
          .slice(0, 10)
          .map((q) => {
            const student = students.find((s) => s.user_id === q.user_id);
            const user = student ? userById.get(student.user_id) : null;
            return {
              _id: q.id,
              studentId: student?.id || '',
              studentName: user
                ? `${user.first_name} ${user.last_name}`
                : 'Unknown',
              query: q.query.substring(0, 100) + (q.query.length > 100 ? '...' : ''),
              intent: q.intent,
              createdAt: q.created_at,
            };
          });

        const response: AdviserAnalyticsResponse = {
          totalAdvisees,
          pendingReviews,
          upcomingDefenses,
          avgTimeToDefense: `${avgTimeToDefenseYears}y`,
          adviseeList,
          recentConsultations,
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error fetching adviser analytics:', error);
        return NextResponse.json(
          { error: 'Failed to fetch adviser analytics' },
          { status: 500 }
        );
      }
    },
    ['adviser', 'coordinator', 'admin']
  );
}
