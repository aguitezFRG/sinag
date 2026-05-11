import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, UserRole } from './auth';
import { supabaseAdmin } from './supabase-admin';

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  jti: string;
}

async function isTokenBlacklisted(jti: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('token_blacklist')
      .select('jti')
      .eq('jti', jti)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
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

  if (await isTokenBlacklisted(payload.jti)) {
    return NextResponse.json({ error: 'Token has been revoked' }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return handler(req, payload);
}

export async function getAuthUser(req: NextRequest): Promise<AuthContext | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  if (await isTokenBlacklisted(payload.jti)) return null;
  return payload;
}
