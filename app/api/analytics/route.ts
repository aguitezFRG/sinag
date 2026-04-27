import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getAnalyticsOverview, getCoordinatorStats } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const overview = getAnalyticsOverview();
    const coordinatorStats = getCoordinatorStats();

    const programBreakdown = coordinatorStats.programBreakdown.map((p) => ({
      program: p.program,
      students: p.students,
      activeWorkflows: p.workflows,
    }));

    return NextResponse.json({
      stats: {
        totalUsers: overview.totalUsers,
        totalStudents: overview.totalStudents,
        activeWorkflows: overview.activeWorkflows,
        completedWorkflows: overview.completedWorkflows,
        completedMilestones: overview.completedMilestones,
        totalMilestones: overview.totalMilestones,
        milestoneCompletionRate: overview.milestoneCompletionRate,
        avgCompletionDays: overview.avgCompletionDays,
        recentQueries: overview.recentQueries,
      },
      programBreakdown,
      monthlyActivity: overview.monthlyActivity,
      adviserWorkload: coordinatorStats.adviserWorkload,
    });
  }, ['coordinator', 'admin']);
}
