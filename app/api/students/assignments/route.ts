import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ============================================
// RESPONSE TYPE INTERFACES
// ============================================

export interface StudentAssignment {
  studentId: string;
  userId: string;
  studentName: string;
  email: string;
  studentNumber: string;
  program: string;
  enrollmentStatus: string;
  thesisTitle: string | null;
  adviserId: string | null;
  adviserName: string | null;
  adviserDepartment: string | null;
  currentStage: string | null;
  workflowStatus: string | null;
  isAssigned: boolean;
  startDate: string;
  expectedCompletionDate: string | null;
}

export interface StudentAssignmentsResponse {
  students: StudentAssignment[];
  summary: {
    totalStudents: number;
    assignedCount: number;
    unassignedCount: number;
    byProgram: Record<string, number>;
  };
  filters: {
    applied: {
      unassignedOnly: boolean;
      program: string | null;
    };
  };
}

// ============================================
// GET /api/students/assignments
// Query params:
//   - unassigned=true (filter to show only unassigned students)
//   - program=<program-code> (filter by program)
// ============================================

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (_req, auth) => {
      try {
        // Parse query parameters
        const url = new URL(req.url);
        const unassignedOnly = url.searchParams.get('unassigned') === 'true';
        const programFilter = url.searchParams.get('program');

        const { data: studentsRows, error } = await supabaseAdmin
          .from('students')
          .select(
            `
            id,
            user_id,
            student_number,
            program,
            enrollment_status,
            thesis_title,
            adviser_id,
            start_date,
            expected_completion_date,
            users:user_id ( email, first_name, last_name ),
            advisers:adviser_id ( id, department, user_id, users:user_id ( first_name, last_name ) )
          `
          )
          .order('created_at', { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const studentIds = (studentsRows ?? []).map((s) => s.id);
        const { data: workflows } = studentIds.length
          ? await supabaseAdmin
              .from('workflows')
              .select('student_id, status, current_stage')
              .in('student_id', studentIds)
          : { data: [] as Array<{ student_id: string; status: string; current_stage: string }> };
        const workflowByStudent = new Map((workflows ?? []).map((w) => [w.student_id, w]));

        let studentList: StudentAssignment[] = (studentsRows ?? []).map((student) => {
          const userRel = student.users as
            | { email: string; first_name: string; last_name: string }
            | Array<{ email: string; first_name: string; last_name: string }>
            | null;
          const user = Array.isArray(userRel) ? userRel[0] ?? null : userRel;
          const adviserRel = student.advisers as
            | {
                id: string;
                department: string;
                users:
                  | { first_name: string; last_name: string }
                  | Array<{ first_name: string; last_name: string }>
                  | null;
              }
            | Array<{
                id: string;
                department: string;
                users:
                  | { first_name: string; last_name: string }
                  | Array<{ first_name: string; last_name: string }>
                  | null;
              }>
            | null;
          const adviser = Array.isArray(adviserRel) ? adviserRel[0] ?? null : adviserRel;
          const adviserUserRel = adviser?.users ?? null;
          const adviserUser = Array.isArray(adviserUserRel) ? adviserUserRel[0] ?? null : adviserUserRel;
          const workflow = workflowByStudent.get(student.id);

          return {
            studentId: student.id,
            userId: student.user_id,
            studentName: user
              ? `${user.first_name} ${user.last_name}`
              : 'Unknown',
            email: user?.email || '',
            studentNumber: student.student_number,
            program: student.program,
            enrollmentStatus: student.enrollment_status,
            thesisTitle: student.thesis_title || null,
            adviserId: student.adviser_id,
            adviserName: adviserUser
              ? `Dr. ${adviserUser.first_name} ${adviserUser.last_name}`
              : null,
            adviserDepartment: adviser?.department || null,
            currentStage: workflow?.current_stage || null,
            workflowStatus: workflow?.status || null,
            isAssigned: !!student.adviser_id,
            startDate: student.start_date,
            expectedCompletionDate: student.expected_completion_date || null,
          };
        });

        // Apply filters
        if (unassignedOnly) {
          studentList = studentList.filter((s) => !s.isAssigned);
        }

        if (programFilter) {
          studentList = studentList.filter(
            (s) => s.program === programFilter
          );
        }

        // Sort: unassigned first, then by program, then by name
        studentList.sort((a, b) => {
          if (a.isAssigned !== b.isAssigned) {
            return a.isAssigned ? 1 : -1;
          }
          if (a.program !== b.program) {
            return a.program.localeCompare(b.program);
          }
          return a.studentName.localeCompare(b.studentName);
        });

        // Calculate summary statistics
        const totalStudents = studentList.length;
        const assignedCount = studentList.filter((s) => s.isAssigned).length;
        const unassignedCount = studentList.filter((s) => !s.isAssigned).length;

        // Count by program
        const byProgram: Record<string, number> = {};
        studentList.forEach((s) => {
          byProgram[s.program] = (byProgram[s.program] || 0) + 1;
        });

        const response: StudentAssignmentsResponse = {
          students: studentList,
          summary: {
            totalStudents,
            assignedCount,
            unassignedCount,
            byProgram,
          },
          filters: {
            applied: {
              unassignedOnly,
              program: programFilter,
            },
          },
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error fetching student assignments:', error);
        return NextResponse.json(
          { error: 'Failed to fetch student assignments' },
          { status: 500 }
        );
      }
    },
    ['coordinator', 'admin', 'adviser']
  );
}
