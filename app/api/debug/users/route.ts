import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { users, dummyUsers } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    return NextResponse.json({
      usersCount: users.length,
      dummyUsersCount: dummyUsers.length,
      firstFewEmails: users.slice(0, 4).map((u) => u.email),
    });
  }, ['admin']);
}
