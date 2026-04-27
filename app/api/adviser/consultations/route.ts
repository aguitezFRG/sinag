import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { students, advisers, users, aiQueries } from '@/lib/dummy-data';

// ============================================
// RESPONSE TYPE INTERFACES
// ============================================

export interface ConsultationItem {
  consultationId: string;
  studentId: string;
  studentName: string;
  studentProgram: string;
  studentInitials: string;
  query: string;
  response: string;
  intent: string;
  sources: {
    title: string;
    type: string;
    url?: string;
  }[];
  isFlagged: boolean;
  createdAt: string;
  sessionId: string;
}

export interface ConsultationsResponse {
  consultations: ConsultationItem[];
  summary: {
    totalConsultations: number;
    uniqueStudents: number;
    flaggedCount: number;
    intentsBreakdown: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================
// GET /api/adviser/consultations
// Query params:
//   - limit=<number> (default: 20, max: 100)
//   - offset=<number> (default: 0)
//   - studentId=<student-id> (filter by specific student)
//   - flagged=true (show only flagged consultations)
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
        const limit = Math.min(
          parseInt(url.searchParams.get('limit') || '20', 10),
          100
        );
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);
        const studentIdFilter = url.searchParams.get('studentId');
        const flaggedOnly = url.searchParams.get('flagged') === 'true';

        // Get all advisees for this adviser
        const advisees = students.filter((s) => s.adviserId === adviserId);
        const adviseeUserIds = advisees.map((s) => s.userId);

        // Filter AI queries by advisee userIds
        let filteredQueries = aiQueries.filter((q) =>
          adviseeUserIds.includes(q.userId)
        );

        // Apply additional filters
        if (studentIdFilter) {
          const targetStudent = advisees.find(
            (s) => s._id === studentIdFilter
          );
          if (targetStudent) {
            filteredQueries = filteredQueries.filter(
              (q) => q.userId === targetStudent.userId
            );
          }
        }

        if (flaggedOnly) {
          filteredQueries = filteredQueries.filter((q) => q.isFlagged);
        }

        // Sort by createdAt descending (most recent first)
        filteredQueries.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Calculate total before pagination
        const totalCount = filteredQueries.length;

        // Apply pagination
        const paginatedQueries = filteredQueries.slice(offset, offset + limit);

        // Map to response format
        const consultations: ConsultationItem[] = paginatedQueries.map(
          (q) => {
            const student = students.find((s) => s.userId === q.userId);
            const studentUser = student
              ? users.find((u) => u._id === student.userId)
              : null;

            return {
              consultationId: q._id,
              studentId: student?._id || '',
              studentName: studentUser
                ? `${studentUser.profile.firstName} ${studentUser.profile.lastName}`
                : 'Unknown',
              studentProgram: student?.program || 'Unknown',
              studentInitials: studentUser
                ? `${studentUser.profile.firstName[0]}${studentUser.profile.lastName[0]}`.toUpperCase()
                : '??',
              query: q.query,
              response: q.response,
              intent: q.intent,
              sources: q.sources || [],
              isFlagged: q.isFlagged,
              createdAt: q.createdAt,
              sessionId: q.sessionId,
            };
          }
        );

        // Calculate summary statistics
        const uniqueStudents = new Set(
          filteredQueries.map((q) => q.userId)
        ).size;
        const flaggedCount = filteredQueries.filter((q) => q.isFlagged).length;

        // Calculate intents breakdown
        const intentsBreakdown: Record<string, number> = {};
        filteredQueries.forEach((q) => {
          intentsBreakdown[q.intent] = (intentsBreakdown[q.intent] || 0) + 1;
        });

        const response: ConsultationsResponse = {
          consultations,
          summary: {
            totalConsultations: totalCount,
            uniqueStudents,
            flaggedCount,
            intentsBreakdown,
          },
          pagination: {
            limit,
            offset,
            hasMore: offset + limit < totalCount,
          },
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error fetching consultations:', error);
        return NextResponse.json(
          { error: 'Failed to fetch consultations' },
          { status: 500 }
        );
      }
    },
    ['adviser', 'coordinator', 'admin']
  );
}
