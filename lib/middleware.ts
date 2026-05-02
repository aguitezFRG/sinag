import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, UserRole } from './auth';

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
}

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse | Response>,
  allowedRoles?: UserRole[]
): Promise<NextResponse | Response> {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return handler(req, payload);
}

export async function getAuthUser(req: NextRequest): Promise<AuthContext | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}
