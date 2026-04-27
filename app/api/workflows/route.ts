import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { workflows, users, dummyStudents, dummyAdvisers } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const adviserId = searchParams.get('adviserId');
    const mine = searchParams.get('mine') === 'true';

    let result = workflows.map((wf) => {
      const student = dummyStudents.find((s) => s._id === wf.studentId);
      const studentUser = student ? users.find((u) => u._id === student.userId) : null;
      const adviser = dummyAdvisers.find((a) => a._id === wf.adviserId);
      const adviserUser = adviser ? users.find((u) => u._id === adviser.userId) : null;

      return {
        ...wf,
        studentName: studentUser ? `${studentUser.profile.firstName} ${studentUser.profile.lastName}` : undefined,
        adviserName: adviserUser ? `${adviserUser.profile.firstName} ${adviserUser.profile.lastName}` : undefined,
      };
    });

    if (mine) {
      const student = dummyStudents.find((s) => s.userId === auth.userId);
      if (student) result = result.filter((w) => w.studentId === student._id);
      else result = [];
    }
    if (studentId) result = result.filter((w) => w.studentId === studentId);
    if (adviserId) result = result.filter((w) => w.adviserId === adviserId);

    return NextResponse.json({ workflows: result });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const body = await req.json();
    const workflow = {
      _id: `w${Date.now()}`,
      ...body,
      status: 'active',
      currentStage: body.stages?.[0]?.name || 'Topic Selection',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    workflows.push(workflow as any);
    return NextResponse.json({ workflow });
  });
}
