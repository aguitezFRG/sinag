import { NextRequest } from 'next/server';

export function isHttpsRequest(req: NextRequest): boolean {
  const forwardedProto = req.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.split(',')[0].trim() === 'https';
  }
  return req.nextUrl.protocol === 'https:';
}

export function shouldEnforceHttps(): boolean {
  return process.env.NODE_ENV === 'production';
}

