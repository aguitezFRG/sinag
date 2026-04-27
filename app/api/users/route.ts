import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { users, dummyStudents, workflows } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const query = searchParams.get('q');
    const enrich = searchParams.get('enrich') !== 'false';

    let result = users;

    if (role) {
      result = result.filter((u) => u.role === role);
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (u) =>
          u.profile.firstName.toLowerCase().includes(q) ||
          u.profile.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    const mapped = result.map((user) => {
      const base = { ...user };
      if (enrich && user.role === 'student') {
        const student = dummyStudents.find((s) => s.userId === user._id);
        const workflow = workflows.find((w) => w.studentId === student?._id);
        return {
          ...base,
          studentNumber: student?.studentNumber,
          program: student?.program,
          thesisTitle: student?.thesisTitle,
          enrollmentStatus: student?.enrollmentStatus,
          workflowStatus: workflow?.status,
          currentStage: workflow?.currentStage,
          adviserId: student?.adviserId,
        };
      }
      return base;
    });

    return NextResponse.json({ users: mapped });
  }, ['coordinator', 'admin']);
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const { userId, updates } = await req.json();
    const user = users.find((u) => u._id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    Object.assign(user, updates);
    return NextResponse.json({ user });
  }, ['admin']);
}
