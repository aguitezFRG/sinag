import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ success: true });

  response.headers.set('Set-Cookie', clearAuthCookie());
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
