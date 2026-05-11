import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie, verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload?.jti) {
      const expDate = new Date();
      expDate.setHours(expDate.getHours() + 24);
      await supabaseAdmin.from('token_blacklist').upsert({
        jti: payload.jti,
        expires_at: expDate.toISOString(),
      }, { onConflict: 'jti' });
    }
  }

  const response = NextResponse.json({ success: true });

  response.headers.set('Set-Cookie', clearAuthCookie());
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
