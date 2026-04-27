import { NextRequest, NextResponse } from 'next/server';
import { users, workflows, aiQueries, dummyStudents } from '@/lib/dummy-data';

export async function GET(_req: NextRequest) {
  const totalUsers = users.length;
  const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
  const completedWorkflows = workflows.filter((w) => w.status === 'completed').length;
  const completedMilestones = workflows.reduce(
    (acc, w) => acc + w.stages.filter((s: any) => s.status === 'approved').length,
    0
  );
  const totalMilestones = workflows.reduce((acc, w) => acc + w.stages.length, 0);
  const recentQueries = aiQueries.slice(-5);
  const avgCompletionDays = 420; // Mock: ~14 months

  return NextResponse.json({
    stats: {
      totalUsers,
      totalStudents: dummyStudents.length,
      activeWorkflows,
      completedWorkflows,
      completedMilestones,
      totalMilestones,
      milestoneCompletionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
      avgCompletionDays,
      recentQueries,
    },
    programBreakdown: [
      { program: 'MSES', students: 1, activeWorkflows: 1 },
      { program: 'PhD-ES', students: 1, activeWorkflows: 1 },
    ],
    monthlyActivity: [
      { month: 'Aug', queries: 5, submissions: 2 },
      { month: 'Sep', queries: 8, submissions: 3 },
      { month: 'Oct', queries: 12, submissions: 4 },
      { month: 'Nov', queries: 15, submissions: 5 },
      { month: 'Dec', queries: 20, submissions: 3 },
    ],
  });
}
