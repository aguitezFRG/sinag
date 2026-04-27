import { NextRequest, NextResponse } from 'next/server';
import { users, setCurrentUser } from '@/lib/dummy-data';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = users.find((u) => u.email === data.email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify the password
    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = await createToken({
      userId: user._id,
      email: user.email,
      role: user.role as any,
    });

    // Set current user in memory (for backward compatibility)
    setCurrentUser(user);

    // Build response with user data and token
    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    });

    // Set auth cookie in response headers
    response.headers.set('Set-Cookie', setAuthCookie(token));

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
