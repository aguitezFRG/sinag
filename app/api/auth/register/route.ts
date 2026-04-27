import { NextRequest, NextResponse } from 'next/server';
import { users, setCurrentUser, dummyStudents } from '@/lib/dummy-data';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['student', 'adviser', 'coordinator', 'admin']),
  // Role-specific fields
  studentNumber: z.string().optional(),
  program: z.string().optional(),
  department: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = users.find((u) => u.email === data.email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash the password
    const passwordHash = await hashPassword(data.password);

    const user = {
      _id: `u${Date.now()}`,
      email: data.email,
      passwordHash,
      role: data.role,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: '',
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(user as any);
    setCurrentUser(user);

    // Create role-specific records if needed
    if (data.role === 'student' && data.studentNumber) {
      const studentRecord = {
        _id: `s${Date.now()}`,
        userId: user._id,
        studentNumber: data.studentNumber,
        program: data.program || 'MSES',
        enrollmentStatus: 'active' as const,
        startDate: new Date().toISOString(),
      };
      dummyStudents.push(studentRecord as any);
    }

    // Create JWT token
    const token = await createToken({
      userId: user._id,
      email: user.email,
      role: user.role as any,
    });

    // Create response with user data (excluding passwordHash)
    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    });

    // Set auth cookie
    response.headers.set('Set-Cookie', setAuthCookie(token));

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
