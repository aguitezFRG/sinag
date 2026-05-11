import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const token = request.cookies.get('token')?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL(`/${payload.role}`, request.url));
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
