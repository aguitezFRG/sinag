import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toLegacyUser, UserRow } from '@/lib/supabase-mappers';
import { isHttpsRequest, shouldEnforceHttps } from '@/lib/request-security';
import { decryptAuthEnvelope, isEncryptedEnvelope, isEncryptionRequired, validateAuthCryptoConfig } from '@/lib/auth-crypto';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    if (isEncryptionRequired()) {
      const cfg = validateAuthCryptoConfig();
      if (!cfg.privateKeyConfigured) {
        return NextResponse.json({ error: 'Server encryption key is not configured' }, { status: 500 });
      }
      if (cfg.keyPairValid === false) {
        return NextResponse.json({ error: 'Server encryption keypair is invalid' }, { status: 500 });
      }
    }

    if (shouldEnforceHttps() && !isHttpsRequest(req)) {
      return NextResponse.json({ error: 'HTTPS is required' }, { status: 400 });
    }

    const body = await req.json();
    let parsedBody: unknown = body;
    if (isEncryptedEnvelope(body)) {
      parsedBody = decryptAuthEnvelope(body.payload);
    } else if (isEncryptionRequired()) {
      return NextResponse.json({ error: 'Encrypted auth payload required' }, { status: 400 });
    }
    const data = loginSchema.parse(parsedBody);

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, role, first_name, last_name, avatar, is_active, created_at, last_login_at')
      .eq('email', data.email.toLowerCase())
      .limit(2);

    const normalizedEmail = data.email.toLowerCase();

    if (error) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (users.length > 1) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    if (!user.is_active) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const response = NextResponse.json({
      user: toLegacyUser(user as UserRow),
    });

    response.headers.set('Set-Cookie', setAuthCookie(token));
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Invalid encrypted auth payload') {
      return NextResponse.json({ error: 'Invalid encrypted auth payload' }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('AUTH_ENCRYPTION_PRIVATE_KEY')) {
      return NextResponse.json({ error: 'Server encryption key is not configured' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
