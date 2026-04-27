import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { students, users, workflows, advisers } from '@/lib/dummy-data';

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
        // Find the adviser record for the current user
        const adviser = advisers.find((a) => a.userId === auth.userId);

        // If user is an adviser but has no adviser profile, return empty
        if (auth.role === 'adviser' && !adviser) {
          return NextResponse.json({
            students: [],
            summary: {
              totalAdvisees: 0,
              onTrackCount: 0,
              needsAttentionCount: 0,
            },
          } as AdviseesResponse);
        }

        // Get relevant students based on role
        let relevantStudents = students;
        if (adviser) {
          // If user is an adviser, filter to only their advisees
          relevantStudents = students.filter((s) => s.adviserId === adviser._id);
        } else if (auth.role === 'adviser') {
          // Fallback for adviser role without profile
          return NextResponse.json({
            students: [],
            summary: {
              totalAdvisees: 0,
              onTrackCount: 0,
              needsAttentionCount: 0,
            },
          } as AdviseesResponse);
        }
        // For coordinator and admin, return all students

        const adviseesList: AdviseeItem[] = relevantStudents.map((student) => {
          const user = users.find((u) => u._id === student.userId);
          const workflow = workflows.find((w) => w.studentId === student._id);

          // Determine status based on overdue milestones
          const now = new Date();
          const hasOverdue = workflow?.stages.some(
            (s: any) => s.status !== 'approved' && s.dueDate && new Date(s.dueDate) < now
          );

          return {
            _id: student._id,
            name: user
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : 'Unknown',
            program: student.program,
            nextMilestone: workflow?.currentStage || 'Not started',
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
