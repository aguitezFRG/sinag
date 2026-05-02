import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toLegacyUser, UserRow } from '@/lib/supabase-mappers';

export async function GET(req: NextRequest) {
  // 1. Read the token cookie from the request
  const token = req.cookies.get('token')?.value;

  // 2. If no token, return 401
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Verify the token
  const payload = await verifyToken(token);

  // 4. If invalid token, return 401
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, role, first_name, last_name, avatar, is_active, created_at, last_login_at')
    .eq('id', payload.userId)
    .maybeSingle();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user: toLegacyUser(user as UserRow) });
}
