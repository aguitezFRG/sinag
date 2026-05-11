import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

// ============================================
// RESPONSE TYPE INTERFACES
// ============================================

export interface PendingReviewItem {
  reviewId: string;
  workflowId: string;
  stageId: number;
  stageName: string;
  stageOrder: number;
  status: 'submitted' | 'in_progress';
  submittedAt: string | null;
  dueDate: string | null;
  isOverdue: boolean;
  daysOverdue: number;
  priority: 'urgent' | 'high' | 'normal' | 'low';

  // Student info
  studentId: string;
  studentName: string;
  studentProgram: string;
  thesisTitle: string | null;

  // Document info (if any documents attached to this stage)
  attachedDocuments: {
    documentId: string;
    title: string;
    type: string;
    uploadedAt: string;
  }[];

  // Workflow context
  workflowProgress: {
    completedStages: number;
    totalStages: number;
    percentage: number;
  };
}

export interface PendingReviewsResponse {
  reviews: PendingReviewItem[];
  summary: {
    totalPending: number;
    submittedCount: number;
    inProgressCount: number;
    urgentCount: number;
    overdueCount: number;
  };
  filters: {
    applied: {
      status: string | null;
      priority: string | null;
    };
  };
}

// ============================================
// GET /api/adviser/pending-reviews
// Query params:
//   - status=submitted|in_progress (filter by status)
//   - priority=urgent|high|normal|low (filter by priority)
// ============================================

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (_req, auth) => {
      try {
        if (!isUuid(auth.userId)) {
          return NextResponse.json({
            reviews: [],
            summary: { totalPending: 0, submittedCount: 0, inProgressCount: 0, urgentCount: 0, overdueCount: 0 },
            filters: { applied: { status: null, priority: null } },
          } satisfies PendingReviewsResponse);
        }

        const { data: adviser } = await supabaseAdmin
          .from('advisers')
          .select('id')
          .eq('user_id', auth.userId)
          .maybeSingle();
        if (!adviser) {
          return NextResponse.json({
            reviews: [],
            summary: { totalPending: 0, submittedCount: 0, inProgressCount: 0, urgentCount: 0, overdueCount: 0 },
            filters: { applied: { status: null, priority: null } },
          } satisfies PendingReviewsResponse);
        }

        const adviserId = adviser.id;

        // Parse query parameters
        const url = new URL(req.url);
        const statusFilter = url.searchParams.get('status');
        const priorityFilter = url.searchParams.get('priority');

        const { data: students } = await supabaseAdmin
          .from('students')
          .select('id, user_id, program, thesis_title')
          .eq('adviser_id', adviserId);
        const adviseeIds = (students ?? []).map((s) => s.id);
        const userIds = (students ?? []).map((s) => s.user_id);

        const [{ data: workflows }, { data: stages }, { data: users }] =
          await Promise.all([
            adviseeIds.length
              ? supabaseAdmin
                  .from('workflows')
                  .select('id, student_id, updated_at')
                  .in('student_id', adviseeIds)
              : Promise.resolve({ data: [] }),
            adviseeIds.length
              ? supabaseAdmin
                  .from('workflows')
                  .select('id, student_id, workflow_stages ( id, name, stage_order, status, due_date, completed_at )')
                  .in('student_id', adviseeIds)
              : Promise.resolve({ data: [] }),
            userIds.length
              ? supabaseAdmin
                  .from('users')
                  .select('id, first_name, last_name')
                  .in('id', userIds)
              : Promise.resolve({ data: [] }),
          ]);

        // Collect all pending reviews from workflows
        let pendingReviews: PendingReviewItem[] = [];

        const studentById = new Map((students ?? []).map((s) => [s.id, s]));
        const userById = new Map((users ?? []).map((u) => [u.id, u]));
        const workflowRows = workflows ?? [];

        for (const workflow of workflowRows) {
          const student = studentById.get(workflow.student_id);
          if (!student) continue;

          const studentUser = userById.get(student.user_id);
          const stagesEntry = (stages ?? []).find(
            (w: { id: string; workflow_stages: unknown[] }) => w.id === workflow.id
          );
          const workflowStages = (stagesEntry?.workflow_stages ?? []) as Array<{
            id: string;
            name: string;
            stage_order: number;
            status: string;
            due_date: string | null;
            completed_at: string | null;
          }>;

          // Find stages that need review (submitted or in_progress)
          const reviewableStages = workflowStages.filter(
            (s) => s.status === 'submitted' || s.status === 'in_progress'
          );

          for (const stage of reviewableStages) {
            // Calculate priority based on due date and status
            const now = new Date();
            const dueDate = stage.due_date ? new Date(stage.due_date) : null;
            const isOverdue = dueDate ? dueDate < now : false;
            const daysOverdue = isOverdue && dueDate
              ? Math.floor(
                  (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                )
              : 0;

            let priority: 'urgent' | 'high' | 'normal' | 'low' = 'normal';
            if (isOverdue && daysOverdue > 7) {
              priority = 'urgent';
            } else if (isOverdue) {
              priority = 'high';
            } else if (dueDate) {
              const daysUntilDue = Math.floor(
                (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (daysUntilDue <= 7 && daysUntilDue >= 0) {
                priority = 'high';
              }
            }

            // Get attached documents for this stage
            const attachedDocs: PendingReviewItem['attachedDocuments'] = [];

            // Calculate workflow progress
            const completedStages = workflowStages.filter(
              (s) => s.status === 'approved'
            ).length;
            const totalStages = workflowStages.length || 1;

            pendingReviews.push({
              reviewId: `${workflow.id}-${stage.stage_order}`,
              workflowId: workflow.id,
              stageId: stage.stage_order,
              stageName: stage.name,
              stageOrder: stage.stage_order,
              status: stage.status as 'submitted' | 'in_progress',
              submittedAt: stage.completed_at || workflow.updated_at,
              dueDate: stage.due_date || null,
              isOverdue,
              daysOverdue,
              priority,
              studentId: student.id,
              studentName: studentUser
                ? `${studentUser.first_name} ${studentUser.last_name}`
                : 'Unknown',
              studentProgram: student.program,
              thesisTitle: student.thesis_title || null,
              attachedDocuments: attachedDocs,
              workflowProgress: {
                completedStages,
                totalStages,
                percentage: Math.round((completedStages / totalStages) * 100),
              },
            });
          }
        }

        // Apply filters
        if (statusFilter) {
          pendingReviews = pendingReviews.filter(
            (r) => r.status === statusFilter
          );
        }

        if (priorityFilter) {
          pendingReviews = pendingReviews.filter(
            (r) => r.priority === priorityFilter
          );
        }

        // Sort by priority (urgent first), then by due date
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        pendingReviews.sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        // Calculate summary statistics
        const summary = {
          totalPending: pendingReviews.length,
          submittedCount: pendingReviews.filter((r) => r.status === 'submitted').length,
          inProgressCount: pendingReviews.filter((r) => r.status === 'in_progress').length,
          urgentCount: pendingReviews.filter((r) => r.priority === 'urgent').length,
          overdueCount: pendingReviews.filter((r) => r.isOverdue).length,
        };

        const response: PendingReviewsResponse = {
          reviews: pendingReviews,
          summary,
          filters: {
            applied: {
              status: statusFilter,
              priority: priorityFilter,
            },
          },
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error fetching pending reviews:', error);
        return NextResponse.json(
          { error: 'Failed to fetch pending reviews' },
          { status: 500 }
        );
      }
    },
    ['adviser', 'coordinator', 'admin']
  );
}
