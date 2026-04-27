import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { advisers, users, students } from '@/lib/dummy-data';

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
        // Calculate workload for each adviser
        const adviserWorkload: AdviserWorkloadItem[] = advisers.map((adviser) => {
          const user = users.find((u) => u._id === adviser.userId);
          const studentCount = students.filter(
            (s) => s.adviserId === adviser._id
          ).length;
          const capacityPercentage = Math.round(
            (studentCount / adviser.maxStudents) * 100
          );

          return {
            adviserId: adviser._id,
            name: user
              ? `Dr. ${user.profile.firstName} ${user.profile.lastName}`
              : 'Unknown',
            department: adviser.department,
            specialization: adviser.specialization,
            studentCount,
            maxStudents: adviser.maxStudents,
            capacityPercentage,
            isAtCapacity: studentCount >= adviser.maxStudents,
            availableSlots: Math.max(0, adviser.maxStudents - studentCount),
          };
        });

        // Sort by student count descending (most loaded first)
        adviserWorkload.sort((a, b) => b.studentCount - a.studentCount);

        // Calculate summary statistics
        const totalAdvisers = advisers.length;
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
