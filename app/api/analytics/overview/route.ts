import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const [
      usersCount,
      studentUsersCount,
      adviserUsersCount,
      coordinatorUsersCount,
      adminUsersCount,
      activeUsersCount,
      queriesCount,
      documentsCount,
      workflows,
      stages,
      unassignedStudents,
      programRows,
      adviserRows,
      studentRows,
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { head: true, count: 'exact' }),
      supabaseAdmin.from('users').select('*', { head: true, count: 'exact' }).eq('role', 'student'),
      supabaseAdmin.from('users').select('*', { head: true, count: 'exact' }).eq('role', 'adviser'),
      supabaseAdmin.from('users').select('*', { head: true, count: 'exact' }).eq('role', 'coordinator'),
      supabaseAdmin.from('users').select('*', { head: true, count: 'exact' }).eq('role', 'admin'),
      supabaseAdmin.from('users').select('*', { head: true, count: 'exact' }).eq('is_active', true),
      supabaseAdmin.from('ai_queries').select('*', { head: true, count: 'exact' }),
      supabaseAdmin.from('documents').select('*', { head: true, count: 'exact' }),
      supabaseAdmin.from('workflows').select('id, status, student_id'),
      supabaseAdmin.from('workflow_stages').select('status'),
      supabaseAdmin.from('students').select('*', { head: true, count: 'exact' }).is('adviser_id', null),
      supabaseAdmin.from('students').select('id, program'),
      supabaseAdmin.from('advisers').select('id, max_students, users:user_id ( first_name, last_name )'),
      supabaseAdmin.from('students').select('adviser_id'),
    ]);

    const workflowRows = workflows.data ?? [];
    const stageRows = stages.data ?? [];
    const activeWorkflows = workflowRows.filter((w) => w.status === 'active').length;
    const completedWorkflows = workflowRows.filter((w) => w.status === 'completed').length;
    const onHoldWorkflows = workflowRows.filter((w) => w.status === 'on_hold').length;
    const completedMilestones = stageRows.filter((s) => s.status === 'approved').length;
    const totalMilestones = stageRows.length;
    const milestoneCompletionRate = totalMilestones
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    const byProgram = new Map<string, number>();
    (programRows.data ?? []).forEach((s) => {
      byProgram.set(s.program, (byProgram.get(s.program) ?? 0) + 1);
    });
    const workflowsByProgram = new Map<string, number>();
    const studentProgramMap = new Map<string, string>();
    (programRows.data ?? []).forEach((s: { id: string; program: string }) => {
      studentProgramMap.set(s.id, s.program);
    });
    workflowRows.forEach((w) => {
      const program = studentProgramMap.get(w.student_id);
      if (!program) return;
      workflowsByProgram.set(program, (workflowsByProgram.get(program) ?? 0) + 1);
    });

    const studentCountByAdviser = new Map<string, number>();
    (studentRows.data ?? []).forEach((s) => {
      if (!s.adviser_id) return;
      studentCountByAdviser.set(s.adviser_id, (studentCountByAdviser.get(s.adviser_id) ?? 0) + 1);
    });
    const adviserWorkload = (
      (adviserRows.data ?? []) as Array<{
        id: string;
        max_students: number;
        users:
          | { first_name: string; last_name: string }
          | Array<{ first_name: string; last_name: string }>
          | null;
      }>
    ).map((a) => {
      const user = Array.isArray(a.users) ? a.users[0] ?? null : a.users;
      return {
        adviser: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
        students: studentCountByAdviser.get(a.id) ?? 0,
        maxStudents: a.max_students,
      };
    });

    return NextResponse.json({
      totalUsers: usersCount.count ?? 0,
      totalStudents: studentUsersCount.count ?? 0,
      totalAdvisers: adviserUsersCount.count ?? 0,
      totalCoordinators: coordinatorUsersCount.count ?? 0,
      totalAdmins: adminUsersCount.count ?? 0,
      activeUsers: activeUsersCount.count ?? 0,
      inactiveUsers: (usersCount.count ?? 0) - (activeUsersCount.count ?? 0),
      totalQueries: queriesCount.count ?? 0,
      totalDocuments: documentsCount.count ?? 0,
      totalWorkflows: workflowRows.length,
      activeWorkflows,
      completedWorkflows,
      onHoldWorkflows,
      completedMilestones,
      totalMilestones,
      milestoneCompletionRate,
      unassignedStudents: unassignedStudents.count ?? 0,
      adviserWorkload,
      programBreakdown: Array.from(byProgram.entries()).map(([program, students]) => ({
        program,
        students,
        workflows: workflowsByProgram.get(program) ?? 0,
      })),
    });
  }, ['coordinator', 'admin']);
}
