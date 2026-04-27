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
        // Find the adviser record for the current user
        const adviser = advisers.find((a) => a.userId === auth.userId);

        if (!adviser) {
          return NextResponse.json(
            { error: 'Adviser profile not found' },
            { status: 404 }
          );
        }

        const adviserId = adviser._id;

        // Parse query parameters
        const url = new URL(req.url);
        const statusFilter = url.searchParams.get('status');
        const priorityFilter = url.searchParams.get('priority');

        // Get all workflows for this adviser's students
        const adviseeIds = students
          .filter((s) => s.adviserId === adviserId)
          .map((s) => s._id);

        const adviseeWorkflows = workflows.filter((w) =>
          adviseeIds.includes(w.studentId)
        );

        // Collect all pending reviews from workflows
        let pendingReviews: PendingReviewItem[] = [];

        for (const workflow of adviseeWorkflows) {
          const student = students.find((s) => s._id === workflow.studentId);
          if (!student) continue;

          const studentUser = users.find((u) => u._id === student.userId);

          // Find stages that need review (submitted or in_progress)
          const reviewableStages = workflow.stages.filter(
            (s: any) => s.status === 'submitted' || s.status === 'in_progress'
          );

          for (const stage of reviewableStages) {
            // Calculate priority based on due date and status
            const now = new Date();
            const dueDate = stage.dueDate ? new Date(stage.dueDate) : null;
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
            const attachedDocs = (stage.documents || [])
              .map((docId: string) => {
                const doc = documents.find((d) => d._id === docId);
                return doc
                  ? {
                      documentId: doc._id,
                      title: doc.title,
                      type: doc.type,
                      uploadedAt: doc.createdAt,
                    }
                  : null;
              })
              .filter(Boolean) as PendingReviewItem['attachedDocuments'];

            // Calculate workflow progress
            const completedStages = workflow.stages.filter(
              (s: any) => s.status === 'approved'
            ).length;
            const totalStages = workflow.stages.length;

            pendingReviews.push({
              reviewId: `${workflow._id}-${stage.order}`,
              workflowId: workflow._id,
              stageId: stage.order,
              stageName: stage.name,
              stageOrder: stage.order,
              status: stage.status as 'submitted' | 'in_progress',
              submittedAt: stage.completedAt || workflow.updatedAt,
              dueDate: stage.dueDate || null,
              isOverdue,
              daysOverdue,
              priority,
              studentId: student._id,
              studentName: studentUser
                ? `${studentUser.profile.firstName} ${studentUser.profile.lastName}`
                : 'Unknown',
              studentProgram: student.program,
              thesisTitle: student.thesisTitle || null,
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
