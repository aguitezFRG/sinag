import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ============================================
// RESPONSE TYPE INTERFACES
// ============================================

export interface AdviserWorkloadItem {
  adviserId: string;
  name: string;
  students: number;
  maxStudents: number;
  utilizationRate: number;
}

export interface RecentAssignment {
  studentId: string;
  studentName: string;
  program: string;
  adviserId: string | null;
  adviserName: string | null;
  assignedAt: string | null;
  status: 'assigned' | 'unassigned';
}

export interface CoordinatorAnalyticsResponse {
  totalStudents: number;
  activeAdvisers: number;
  completionRate: number;
  overdueItems: number;
  unassignedStudents: number;
  adviserWorkload: AdviserWorkloadItem[];
  recentAssignments: RecentAssignment[];
  programBreakdown: {
    program: string;
    students: number;
    workflows: number;
  }[];
}

// ============================================
// GET /api/analytics/coordinator
// ============================================

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (_req, auth) => {
      try {
        const [studentsRes, advisersRes, workflowsRes, stagesRes, usersRes, documentsRes] =
          await Promise.all([
            supabaseAdmin.from('students').select('id, user_id, adviser_id, program, created_at'),
            supabaseAdmin.from('advisers').select('id, user_id, max_students'),
            supabaseAdmin.from('workflows').select('id, student_id, created_at'),
            supabaseAdmin.from('workflow_stages').select('workflow_id, status, due_date'),
            supabaseAdmin.from('users').select('id, first_name, last_name'),
            supabaseAdmin.from('documents').select('owner_id, created_at'),
          ]);
        const students = studentsRes.data ?? [];
        const advisers = advisersRes.data ?? [];
        const workflows = workflowsRes.data ?? [];
        const stages = stagesRes.data ?? [];
        const users = usersRes.data ?? [];
        const documents = documentsRes.data ?? [];

        const totalStudents = students.length;
        const activeAdvisers = advisers.length;
        const unassignedStudents = students.filter((s) => !s.adviser_id).length;

        // Calculate completion rate from workflows
        const totalMilestones = stages.length;
        const completedMilestones = stages.filter((s) => s.status === 'approved').length;
        const completionRate =
          totalMilestones > 0
            ? Math.round((completedMilestones / totalMilestones) * 100)
            : 0;

        // Count overdue items (stages with past due dates not yet approved)
        const now = new Date();
        const overdueItems = stages.filter((s) => {
          if (s.status === 'approved' || s.status === 'completed') return false;
          if (!s.due_date) return false;
          return new Date(s.due_date) < now;
        }).length;

        // Calculate adviser workload distribution
        const adviserWorkload: AdviserWorkloadItem[] = advisers
          .map((adviser) => {
            const user = users.find((u) => u.id === adviser.user_id);
            const studentCount = students.filter(
              (s) => s.adviser_id === adviser.id
            ).length;
            return {
              adviserId: adviser.id,
              name: user
                ? `Dr. ${user.first_name} ${user.last_name}`
                : 'Unknown',
              students: studentCount,
              maxStudents: adviser.max_students,
              utilizationRate: Math.round(
                (studentCount / adviser.max_students) * 100
              ),
            };
          })
          .sort((a, b) => b.students - a.students);

        // Get recent assignments (students with recent adviser assignments or unassigned)
        const recentAssignments: RecentAssignment[] = students
          .map((student) => {
            const user = users.find((u) => u.id === student.user_id);
            const adviser = student.adviser_id
              ? advisers.find((a) => a.id === student.adviser_id)
              : null;
            const adviserUser = adviser
              ? users.find((u) => u.id === adviser.user_id)
              : null;

            // Find the most recent document or workflow activity for this student
            const studentWorkflow = workflows.find(
              (w) => w.student_id === student.id
            );
            const recentDoc = documents
              .filter((d) => d.owner_id === student.user_id)
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];

            const assignedAt = recentDoc?.created_at || studentWorkflow?.created_at;

            return {
              studentId: student.id,
              studentName: user
                ? `${user.first_name} ${user.last_name}`
                : 'Unknown',
              program: student.program,
              adviserId: student.adviser_id,
              adviserName: adviserUser
                ? `Dr. ${adviserUser.first_name} ${adviserUser.last_name}`
                : null,
              assignedAt: assignedAt || null,
              status: (student.adviser_id ? 'assigned' : 'unassigned') as 'assigned' | 'unassigned',
            };
          })
          .sort((a, b) => {
            // Sort unassigned first, then by assignedAt (most recent first)
            if (a.status === 'unassigned' && b.status !== 'unassigned')
              return -1;
            if (a.status !== 'unassigned' && b.status === 'unassigned')
              return 1;
            if (!a.assignedAt && !b.assignedAt) return 0;
            if (!a.assignedAt) return 1;
            if (!b.assignedAt) return -1;
            return (
              new Date(b.assignedAt).getTime() -
              new Date(a.assignedAt).getTime()
            );
          })
          .slice(0, 10); // Limit to 10 most recent

        // Program breakdown
        const programBreakdown = [
          {
            program: 'MSES',
            students: students.filter((s) => s.program === 'MSES').length,
            workflows: workflows.filter((w) => {
              const student = students.find((s) => s.id === w.student_id);
              return student?.program === 'MSES';
            }).length,
          },
          {
            program: 'PhD-ES',
            students: students.filter((s) => s.program === 'PhD-ES').length,
            workflows: workflows.filter((w) => {
              const student = students.find((s) => s.id === w.student_id);
              return student?.program === 'PhD-ES';
            }).length,
          },
          {
            program: 'PhD-EDN',
            students: students.filter((s) => s.program === 'PhD-EDN').length,
            workflows: workflows.filter((w) => {
              const student = students.find((s) => s.id === w.student_id);
              return student?.program === 'PhD-EDN';
            }).length,
          },
          {
            program: 'PM-TMEM',
            students: students.filter((s) => s.program === 'PM-TMEM').length,
            workflows: workflows.filter((w) => {
              const student = students.find((s) => s.id === w.student_id);
              return student?.program === 'PM-TMEM';
            }).length,
          },
        ];

        const response: CoordinatorAnalyticsResponse = {
          totalStudents,
          activeAdvisers,
          completionRate,
          overdueItems,
          unassignedStudents,
          adviserWorkload,
          recentAssignments,
          programBreakdown,
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error fetching coordinator analytics:', error);
        return NextResponse.json(
          { error: 'Failed to fetch coordinator analytics' },
          { status: 500 }
        );
      }
    },
    ['coordinator', 'admin']
  );
}
