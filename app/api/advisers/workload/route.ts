import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ============================================
// RESPONSE TYPE INTERFACES
// ============================================

export interface AdviserWorkloadItem {
  adviserId: string;
  name: string;
  department: string;
  specialization: string[];
  studentCount: number;
  maxStudents: number;
  capacityPercentage: number;
  isAtCapacity: boolean;
  availableSlots: number;
}

export interface AdviserWorkloadResponse {
  advisers: AdviserWorkloadItem[];
  summary: {
    totalAdvisers: number;
    totalStudents: number;
    totalCapacity: number;
    overallUtilization: number;
    advisersAtCapacity: number;
  };
}

// ============================================
// GET /api/advisers/workload
// ============================================

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (_req, auth) => {
      try {
        const { data: advisers, error } = await supabaseAdmin
          .from('advisers')
          .select('id, specialization, max_students, department, users:user_id ( first_name, last_name )')
          .order('created_at', { ascending: false });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const adviserIds = (advisers ?? []).map((a) => a.id);
        const { data: students } = adviserIds.length
          ? await supabaseAdmin.from('students').select('adviser_id').in('adviser_id', adviserIds)
          : { data: [] as Array<{ adviser_id: string | null }> };

        const studentCountByAdviser = new Map<string, number>();
        (students ?? []).forEach((s) => {
          if (!s.adviser_id) return;
          studentCountByAdviser.set(s.adviser_id, (studentCountByAdviser.get(s.adviser_id) ?? 0) + 1);
        });

        const adviserWorkload: AdviserWorkloadItem[] = (advisers ?? []).map((adviser) => {
          const userRel = adviser.users as
            | { first_name: string; last_name: string }
            | Array<{ first_name: string; last_name: string }>
            | null;
          const user = Array.isArray(userRel) ? userRel[0] ?? null : userRel;
          const studentCount = studentCountByAdviser.get(adviser.id) ?? 0;
          const capacityPercentage = Math.round(
            (studentCount / adviser.max_students) * 100
          );

          return {
            adviserId: adviser.id,
            name: user
              ? `Dr. ${user.first_name} ${user.last_name}`
              : 'Unknown',
            department: adviser.department,
            specialization: adviser.specialization ?? [],
            studentCount,
            maxStudents: adviser.max_students,
            capacityPercentage,
            isAtCapacity: studentCount >= adviser.max_students,
            availableSlots: Math.max(0, adviser.max_students - studentCount),
          };
        });

        // Sort by student count descending (most loaded first)
        adviserWorkload.sort((a, b) => b.studentCount - a.studentCount);

        // Calculate summary statistics
        const totalAdvisers = (advisers ?? []).length;
        const totalStudents = adviserWorkload.reduce(
          (acc, a) => acc + a.studentCount,
          0
        );
        const totalCapacity = adviserWorkload.reduce(
          (acc, a) => acc + a.maxStudents,
          0
        );
        const overallUtilization =
          totalCapacity > 0
            ? Math.round((totalStudents / totalCapacity) * 100)
            : 0;
        const advisersAtCapacity = adviserWorkload.filter(
          (a) => a.isAtCapacity
        ).length;

        const response: AdviserWorkloadResponse = {
          advisers: adviserWorkload,
          summary: {
            totalAdvisers,
            totalStudents,
            totalCapacity,
            overallUtilization,
            advisersAtCapacity,
          },
        };

        return NextResponse.json(response);
      } catch (error) {
        console.error('Error fetching adviser workload:', error);
        return NextResponse.json(
          { error: 'Failed to fetch adviser workload data' },
          { status: 500 }
        );
      }
    },
    ['coordinator', 'admin']
  );
}
