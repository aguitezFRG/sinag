import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

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
        if (!isUuid(auth.userId)) {
          return NextResponse.json({
            consultations: [],
            summary: { totalConsultations: 0, uniqueStudents: 0, flaggedCount: 0, intentsBreakdown: {} },
            pagination: { limit: 20, offset: 0, hasMore: false },
          } satisfies ConsultationsResponse);
        }
        const { data: adviser } = await supabaseAdmin
          .from('advisers')
          .select('id')
          .eq('user_id', auth.userId)
          .maybeSingle();

        if (!adviser) {
          return NextResponse.json({
            consultations: [],
            summary: { totalConsultations: 0, uniqueStudents: 0, flaggedCount: 0, intentsBreakdown: {} },
            pagination: { limit: 20, offset: 0, hasMore: false },
          } satisfies ConsultationsResponse);
        }

        const adviserId = adviser.id;

        // Parse query parameters
        const url = new URL(req.url);
        const limit = Math.min(
          parseInt(url.searchParams.get('limit') || '20', 10),
          100
        );
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);
        const studentIdFilter = url.searchParams.get('studentId');
        const flaggedOnly = url.searchParams.get('flagged') === 'true';

        const { data: advisees } = await supabaseAdmin
          .from('students')
          .select('id, user_id, program')
          .eq('adviser_id', adviserId);
        const adviseeUserIds = (advisees ?? []).map((s) => s.user_id);
        const studentByUserId = new Map((advisees ?? []).map((s) => [s.user_id, s]));

        let query = supabaseAdmin
          .from('ai_queries')
          .select(
            `
            id, user_id, session_id, query, response, intent, is_flagged, created_at,
            ai_query_sources ( title, source_type, url )
          `
          )
          .in('user_id', adviseeUserIds)
          .order('created_at', { ascending: false });

        // Apply additional filters
        if (studentIdFilter) {
          const targetStudent = (advisees ?? []).find((s) => s.id === studentIdFilter);
          if (targetStudent) {
            query = query.eq('user_id', targetStudent.user_id);
          }
        }

        if (flaggedOnly) {
          query = query.eq('is_flagged', true);
        }

        const { data: filteredQueries, error } = await query;
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        const userIds = Array.from(new Set((filteredQueries ?? []).map((q) => q.user_id)));
        const { data: users } = userIds.length
          ? await supabaseAdmin.from('users').select('id, first_name, last_name').in('id', userIds)
          : { data: [] as Array<{ id: string; first_name: string; last_name: string }> };
        const userById = new Map((users ?? []).map((u) => [u.id, u]));

        // Calculate total before pagination
        const totalCount = (filteredQueries ?? []).length;

        // Apply pagination
        const paginatedQueries = (filteredQueries ?? []).slice(offset, offset + limit);

        // Map to response format
        const consultations: ConsultationItem[] = paginatedQueries.map(
          (q) => {
            const student = studentByUserId.get(q.user_id);
            const studentUser = student ? userById.get(student.user_id) : null;

            return {
              consultationId: q.id,
              studentId: student?.id || '',
              studentName: studentUser
                ? `${studentUser.first_name} ${studentUser.last_name}`
                : 'Unknown',
              studentProgram: student?.program || 'Unknown',
              studentInitials: studentUser
                ? `${studentUser.first_name[0]}${studentUser.last_name[0]}`.toUpperCase()
                : '??',
              query: q.query,
              response: q.response,
              intent: q.intent,
              sources: (q.ai_query_sources ?? []).map(
                (s: { title: string | null; source_type: string | null; url: string | null }) => ({
                  title: s.title ?? '',
                  type: s.source_type ?? '',
                  url: s.url ?? undefined,
                })
              ),
              isFlagged: q.is_flagged,
              createdAt: q.created_at,
              sessionId: q.session_id,
            };
          }
        );

        // Calculate summary statistics
        const uniqueStudents = new Set(
          (filteredQueries ?? []).map((q) => q.user_id)
        ).size;
        const flaggedCount = (filteredQueries ?? []).filter((q) => q.is_flagged).length;

        // Calculate intents breakdown
        const intentsBreakdown: Record<string, number> = {};
        (filteredQueries ?? []).forEach((q) => {
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
