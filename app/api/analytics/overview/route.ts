import { NextRequest, NextResponse } from 'next/server';
import { users, workflows, aiQueries, documents, dummyStudents, dummyAdvisers } from '@/lib/dummy-data';

export async function GET(_req: NextRequest) {
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalAdvisers = users.filter((u) => u.role === 'adviser').length;
  const totalQueries = aiQueries.length;
  const totalDocuments = documents.length;
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
  const completedWorkflows = workflows.filter((w) => w.status === 'completed').length;
  const onHoldWorkflows = workflows.filter((w) => w.status === 'on_hold').length;

  const completedMilestones = workflows.reduce(
    (acc, w) => acc + w.stages.filter((s: any) => s.status === 'approved').length,
    0
  );
  const totalMilestones = workflows.reduce((acc, w) => acc + w.stages.length, 0);

  return NextResponse.json({
    totalUsers,
    totalStudents,
    totalAdvisers,
    totalQueries,
    totalDocuments,
    totalWorkflows,
    activeWorkflows,
    completedWorkflows,
    onHoldWorkflows,
    completedMilestones,
    totalMilestones,
    milestoneCompletionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
  });
}
