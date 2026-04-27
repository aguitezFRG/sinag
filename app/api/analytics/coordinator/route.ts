import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import {
  students,
  advisers,
  users,
  workflows,
  documents,
} from '@/lib/dummy-data';

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
        // Calculate coordinator statistics
        const totalStudents = students.length;
        const activeAdvisers = advisers.length;
        const unassignedStudents = students.filter((s) => !s.adviserId).length;

        // Calculate completion rate from workflows
        const totalMilestones = workflows.reduce(
          (acc, w) => acc + w.stages.length,
          0
        );
        const completedMilestones = workflows.reduce(
          (acc, w) =>
            acc + w.stages.filter((s: any) => s.status === 'approved').length,
          0
        );
        const completionRate =
          totalMilestones > 0
            ? Math.round((completedMilestones / totalMilestones) * 100)
            : 0;

        // Count overdue items (stages with past due dates not yet approved)
        const now = new Date();
        const overdueItems = workflows.reduce((acc, w) => {
          return (
            acc +
            w.stages.filter((s: any) => {
              if (s.status === 'approved' || s.status === 'completed')
                return false;
              const dueDate = new Date(s.dueDate);
              return dueDate < now;
            }).length
          );
        }, 0);

        // Calculate adviser workload distribution
        const adviserWorkload: AdviserWorkloadItem[] = advisers
          .map((adviser) => {
            const user = users.find((u) => u._id === adviser.userId);
            const studentCount = students.filter(
              (s) => s.adviserId === adviser._id
            ).length;
            return {
              adviserId: adviser._id,
              name: user
                ? `Dr. ${user.profile.firstName} ${user.profile.lastName}`
                : 'Unknown',
              students: studentCount,
              maxStudents: adviser.maxStudents,
              utilizationRate: Math.round(
                (studentCount / adviser.maxStudents) * 100
              ),
            };
          })
          .sort((a, b) => b.students - a.students);

        // Get recent assignments (students with recent adviser assignments or unassigned)
        const recentAssignments: RecentAssignment[] = students
          .map((student) => {
            const user = users.find((u) => u._id === student.userId);
            const adviser = student.adviserId
              ? advisers.find((a) => a._id === student.adviserId)
              : null;
            const adviserUser = adviser
              ? users.find((u) => u._id === adviser.userId)
              : null;

            // Find the most recent document or workflow activity for this student
            const studentWorkflow = workflows.find(
              (w) => w.studentId === student._id
            );
            const recentDoc = documents
              .filter((d) => d.ownerId === student.userId)
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0];

            const assignedAt = recentDoc?.createdAt || studentWorkflow?.createdAt;

            return {
              studentId: student._id,
              studentName: user
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : 'Unknown',
              program: student.program,
              adviserId: student.adviserId,
              adviserName: adviserUser
                ? `Dr. ${adviserUser.profile.firstName} ${adviserUser.profile.lastName}`
                : null,
              assignedAt: assignedAt || null,
              status: (student.adviserId ? 'assigned' : 'unassigned') as 'assigned' | 'unassigned',
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
              const student = students.find((s) => s._id === w.studentId);
              return student?.program === 'MSES';
            }).length,
          },
          {
            program: 'PhD-ES',
            students: students.filter((s) => s.program === 'PhD-ES').length,
            workflows: workflows.filter((w) => {
              const student = students.find((s) => s._id === w.studentId);
              return student?.program === 'PhD-ES';
            }).length,
          },
          {
            program: 'PhD-EDN',
            students: students.filter((s) => s.program === 'PhD-EDN').length,
            workflows: workflows.filter((w) => {
              const student = students.find((s) => s._id === w.studentId);
              return student?.program === 'PhD-EDN';
            }).length,
          },
          {
            program: 'PM-TMEM',
            students: students.filter((s) => s.program === 'PM-TMEM').length,
            workflows: workflows.filter((w) => {
              const student = students.find((s) => s._id === w.studentId);
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
