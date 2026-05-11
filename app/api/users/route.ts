import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid, toLegacyUser, UserRole } from '@/lib/supabase-mappers';

export async function GET(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    void request;
    void auth;
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const query = searchParams.get('q');
    const enrich = searchParams.get('enrich') !== 'false';

    let dbQuery = supabaseAdmin
      .from('users')
      .select('id, email, role, first_name, last_name, avatar, is_active, created_at, last_login_at')
      .order('created_at', { ascending: false });

    if (role) dbQuery = dbQuery.eq('role', role);

    const { data, error } = await dbQuery;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let result = (data ?? []).map(toLegacyUser);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((u) => {
        const firstName = u.profile?.firstName?.toLowerCase() ?? '';
        const lastName = u.profile?.lastName?.toLowerCase() ?? '';
        return (
          firstName.includes(q) ||
          lastName.includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      });
    }

    let mapped = result;
    if (enrich) {
      const studentUserIds = mapped
        .filter((u) => u.role === 'student' && isUuid(u._id))
        .map((u) => u._id);

      if (studentUserIds.length > 0) {
        const { data: students } = await supabaseAdmin
          .from('students')
          .select('id, user_id, student_number, program, thesis_title, enrollment_status, adviser_id')
          .in('user_id', studentUserIds);

        const studentMap = new Map((students ?? []).map((s) => [s.user_id, s]));
        const studentIds = (students ?? []).map((s) => s.id);

        let workflowByStudentId = new Map<string, { status: string; current_stage: string }>();
        if (studentIds.length > 0) {
          const { data: workflows } = await supabaseAdmin
            .from('workflows')
            .select('student_id, status, current_stage')
            .in('student_id', studentIds);
          workflowByStudentId = new Map(
            (workflows ?? []).map((w) => [w.student_id, { status: w.status, current_stage: w.current_stage }])
          );
        }

        mapped = mapped.map((user) => {
          if (user.role !== 'student') return user;
          const student = studentMap.get(user._id);
          const workflow = student ? workflowByStudentId.get(student.id) : undefined;
          return {
            ...user,
            studentNumber: student?.student_number,
            program: student?.program,
            thesisTitle: student?.thesis_title ?? undefined,
            enrollmentStatus: student?.enrollment_status,
            workflowStatus: workflow?.status,
            currentStage: workflow?.current_stage,
            adviserId: student?.adviser_id ?? undefined,
          };
        });
      }
    }

    return NextResponse.json({ users: mapped });
  }, ['coordinator', 'admin']);
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, async (request, auth) => {
    void request;
    void auth;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }
    const { userId, updates } = body as Record<string, unknown>;
    if (typeof userId !== 'string' || !isUuid(userId)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    const u = typeof updates === 'object' && updates !== null ? updates as Record<string, unknown> : {};
    if (typeof u.isActive === 'boolean') updatePayload.is_active = u.isActive;
    if (typeof u.role === 'string') updatePayload.role = u.role as UserRole;
    if (typeof u.firstName === 'string') updatePayload.first_name = u.firstName;
    if (typeof u.lastName === 'string') updatePayload.last_name = u.lastName;
    if (typeof u.avatar === 'string') updatePayload.avatar = u.avatar;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('id, email, role, first_name, last_name, avatar, is_active, created_at, last_login_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: toLegacyUser(data) });
  }, ['admin']);
}
