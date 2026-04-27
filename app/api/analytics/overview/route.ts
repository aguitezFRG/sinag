import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getAdminStats, getCoordinatorStats } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const adminStats = getAdminStats();
    const coordinatorStats = getCoordinatorStats();

    return NextResponse.json({
      totalUsers: adminStats.totalUsers,
      totalStudents: adminStats.totalStudents,
      totalAdvisers: adminStats.totalAdvisers,
      totalQueries: adminStats.totalQueries,
      totalDocuments: adminStats.totalDocuments,
      totalWorkflows: adminStats.totalWorkflows,
      activeWorkflows: adminStats.activeWorkflows,
      completedWorkflows: adminStats.completedWorkflows,
      onHoldWorkflows: adminStats.onHoldWorkflows,
      completedMilestones: adminStats.completedMilestones,
      totalMilestones: adminStats.totalMilestones,
      milestoneCompletionRate: adminStats.milestoneCompletionRate,
      unassignedStudents: coordinatorStats.unassignedStudents,
      adviserWorkload: coordinatorStats.adviserWorkload,
      programBreakdown: coordinatorStats.programBreakdown,
    });
  }, ['coordinator', 'admin']);
}
