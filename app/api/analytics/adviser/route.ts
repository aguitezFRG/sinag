import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import {
  students,
  advisers,
  users,
  workflows,
  documents,
  aiQueries,
} from '@/lib/dummy-data';

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
        // Find the adviser record for the current user
        const adviser = advisers.find((a) => a.userId === auth.userId);

        if (!adviser) {
          return NextResponse.json(
            { error: 'Adviser profile not found' },
            { status: 404 }
          );
        }

        const adviserId = adviser._id;

        // Get advisee count
        const advisees = students.filter((s) => s.adviserId === adviserId);
        const totalAdvisees = advisees.length;

        // Get workflows for this adviser's students
        const adviseeWorkflows = workflows.filter((w) =>
          advisees.some((s) => s._id === w.studentId)
        );

        // Count pending reviews (submitted stages awaiting approval)
        const pendingReviews = adviseeWorkflows.reduce((acc, w) => {
          return (
            acc +
            w.stages.filter((s: any) => s.status === 'submitted').length
          );
        }, 0);

        // Count upcoming defenses (scheduled or in_progress final defense)
        const upcomingDefenses = adviseeWorkflows.filter((w: any) => {
          const finalStage = w.stages.find(
            (s: any) => s.name === 'Final Defense'
          );
          return (
            finalStage &&
            (finalStage.status === 'scheduled' ||
              finalStage.status === 'pending')
          );
        }).length;

        // Calculate average time to defense (based on start date to expected completion)
        const avgTimeToDefenseYears =
          advisees.length > 0
            ? (
                advisees.reduce((acc, s) => {
                  const start = new Date(s.startDate).getTime();
                  const expected = new Date(
                    s.expectedCompletionDate || Date.now()
                  ).getTime();
                  const durationMs = expected - start;
                  const durationYears =
                    durationMs / (1000 * 60 * 60 * 24 * 365);
                  return acc + durationYears;
                }, 0) / advisees.length
              ).toFixed(1)
            : '0.0';

        // Get advisee details with status
        const adviseeList: AdviseeInfo[] = advisees.map((student) => {
          const user = users.find((u) => u._id === student.userId);
          const workflow = workflows.find((w) => w.studentId === student._id);
          const currentStage = workflow?.stages.find(
            (s: any) => s.status === 'in_progress' || s.status === 'submitted'
          );
          const nextMilestone =
            currentStage?.name || workflow?.currentStage || 'Unknown';

          // Determine status based on overdue stages
          const now = new Date();
          const overdueStages =
            workflow?.stages.filter((s: any) => {
              if (s.status === 'approved') return false;
              const dueDate = new Date(s.dueDate);
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
            (d) => d.ownerId === student.userId
          );
          const lastDoc = studentDocs.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          const lastActivity = lastDoc?.updatedAt || workflow?.updatedAt || null;

          return {
            _id: student._id,
            name: user
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : 'Unknown',
            program: student.program,
            thesisTitle: student.thesisTitle || null,
            nextMilestone,
            status,
            initials: user
              ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase()
              : '??',
            lastActivity,
          };
        });

        // Get recent AI consultations for adviser's students
        const adviseeUserIds = advisees.map((s) => s.userId);
        const recentConsultations: RecentConsultation[] = aiQueries
          .filter((q) => adviseeUserIds.includes(q.userId))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 10)
          .map((q) => {
            const student = students.find((s) => s.userId === q.userId);
            const user = student
              ? users.find((u) => u._id === student.userId)
              : null;
            return {
              _id: q._id,
              studentId: student?._id || '',
              studentName: user
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : 'Unknown',
              query: q.query.substring(0, 100) + (q.query.length > 100 ? '...' : ''),
              intent: q.intent,
              createdAt: q.createdAt,
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
