import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const [usersCount, studentsCount, workflows, stages, queries, programRows, adviserRows, adviserStudentRows] =
      await Promise.all([
        supabaseAdmin.from('users').select('*', { head: true, count: 'exact' }),
        supabaseAdmin.from('students').select('*', { head: true, count: 'exact' }),
        supabaseAdmin.from('workflows').select('id, status, student_id, created_at'),
        supabaseAdmin.from('workflow_stages').select('status'),
        supabaseAdmin
          .from('ai_queries')
          .select('id, created_at')
          .order('created_at', { ascending: false })
          .limit(20),
        supabaseAdmin.from('students').select('id, program'),
        supabaseAdmin.from('advisers').select('id, max_students, users:user_id ( first_name, last_name )'),
        supabaseAdmin.from('students').select('adviser_id'),
      ]);

    const workflowRows = workflows.data ?? [];
    const stageRows = stages.data ?? [];
    const activeWorkflows = workflowRows.filter((w) => w.status === 'active').length;
    const completedWorkflows = workflowRows.filter((w) => w.status === 'completed').length;
    const completedMilestones = stageRows.filter((s) => s.status === 'approved').length;
    const totalMilestones = stageRows.length;
    const milestoneCompletionRate = totalMilestones
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;
    const recentQueries = (queries.data ?? []).length;

    const monthBuckets = new Map<string, number>();
    workflowRows.forEach((w) => {
      const month = new Date(w.created_at).toISOString().slice(0, 7);
      monthBuckets.set(month, (monthBuckets.get(month) ?? 0) + 1);
    });
    const monthlyActivity = Array.from(monthBuckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));

    const byProgram = new Map<string, number>();
    const studentProgramMap = new Map<string, string>();
    (programRows.data ?? []).forEach((s: { id: string; program: string }) => {
      byProgram.set(s.program, (byProgram.get(s.program) ?? 0) + 1);
      studentProgramMap.set(s.id, s.program);
    });
    const workflowByProgram = new Map<string, number>();
    workflowRows.forEach((w) => {
      const p = studentProgramMap.get(w.student_id);
      if (!p) return;
      workflowByProgram.set(p, (workflowByProgram.get(p) ?? 0) + 1);
    });

    const studentCountByAdviser = new Map<string, number>();
    (adviserStudentRows.data ?? []).forEach((s) => {
      if (!s.adviser_id) return;
      studentCountByAdviser.set(s.adviser_id, (studentCountByAdviser.get(s.adviser_id) ?? 0) + 1);
    });
    const adviserWorkload = ((adviserRows.data ?? []) as Array<{
      id: string;
      max_students: number;
      users:
        | { first_name: string; last_name: string }
        | Array<{ first_name: string; last_name: string }>
        | null;
    }>).map((a) => {
      const user = Array.isArray(a.users) ? a.users[0] ?? null : a.users;
      return {
        adviser: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
        students: studentCountByAdviser.get(a.id) ?? 0,
        maxStudents: a.max_students,
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers: usersCount.count ?? 0,
        totalStudents: studentsCount.count ?? 0,
        activeWorkflows,
        completedWorkflows,
        completedMilestones,
        totalMilestones,
        milestoneCompletionRate,
        avgCompletionDays: 0,
        recentQueries,
      },
      programBreakdown: Array.from(byProgram.entries()).map(([program, students]) => ({
        program,
        students,
        activeWorkflows: workflowByProgram.get(program) ?? 0,
      })),
      monthlyActivity,
      adviserWorkload,
    });
  }, ['coordinator', 'admin']);
}
