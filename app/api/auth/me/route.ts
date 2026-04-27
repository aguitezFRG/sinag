import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { users } from '@/lib/dummy-data';

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

  // 5. Find the user in dummy-data.ts by payload.userId
  const user = users.find((u) => u._id === payload.userId);

  // 6. If user not found, return 404
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // 7. Return the user object (without passwordHash - not present in dummy data)
  return NextResponse.json({ user });
}
