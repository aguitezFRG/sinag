import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { students, users, advisers, workflows } from '@/lib/dummy-data';

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

        // Build student list with assignment info
        let studentList: StudentAssignment[] = students.map((student) => {
          const user = users.find((u) => u._id === student.userId);
          const adviser = student.adviserId
            ? advisers.find((a) => a._id === student.adviserId)
            : null;
          const adviserUser = adviser
            ? users.find((u) => u._id === adviser.userId)
            : null;
          const workflow = workflows.find(
            (w) => w.studentId === student._id
          );

          return {
            studentId: student._id,
            userId: student.userId,
            studentName: user
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : 'Unknown',
            email: user?.email || '',
            studentNumber: student.studentNumber,
            program: student.program,
            enrollmentStatus: student.enrollmentStatus,
            thesisTitle: student.thesisTitle || null,
            adviserId: student.adviserId,
            adviserName: adviserUser
              ? `Dr. ${adviserUser.profile.firstName} ${adviserUser.profile.lastName}`
              : null,
            adviserDepartment: adviser?.department || null,
            currentStage: workflow?.currentStage || null,
            workflowStatus: workflow?.status || null,
            isAssigned: !!student.adviserId,
            startDate: student.startDate,
            expectedCompletionDate: student.expectedCompletionDate || null,
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
