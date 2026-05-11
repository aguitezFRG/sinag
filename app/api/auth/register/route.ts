import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toLegacyUser, UserRow, formatZodError } from '@/lib/supabase-mappers';
import { isHttpsRequest, shouldEnforceHttps } from '@/lib/request-security';
import { decryptAuthEnvelope, isEncryptedEnvelope, isEncryptionRequired, validateAuthCryptoConfig } from '@/lib/auth-crypto';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.literal('student').optional(),
  // Role-specific fields
  studentNumber: z.string().optional(),
  program: z.string().optional(),
  department: z.string().optional(),
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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }
    let parsedBody: unknown = body;
    if (isEncryptedEnvelope(body)) {
      parsedBody = decryptAuthEnvelope(body.payload);
    } else if (isEncryptionRequired()) {
      return NextResponse.json({ error: 'Encrypted auth payload required' }, { status: 400 });
    }
    const data = registerSchema.parse(parsedBody);

    const normalizedEmail = data.email.toLowerCase();
    const role = 'student' as const;

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: normalizedEmail,
        password_hash: passwordHash,
        role,
        first_name: data.firstName,
        last_name: data.lastName,
        avatar: '',
        is_active: true,
        last_login_at: new Date().toISOString(),
      })
      .select('id, email, role, first_name, last_name, avatar, is_active, created_at, last_login_at')
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Failed to create user' }, { status: 500 });
    }

    const studentNumber = data.studentNumber || `TEMP-${Date.now()}`;
    const { error: studentError } = await supabaseAdmin.from('students').insert({
      user_id: user.id,
      student_number: studentNumber,
      program: data.program || 'MSES',
      enrollment_status: 'active',
      start_date: new Date().toISOString().slice(0, 10),
    });
    if (studentError) {
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role,
    });

    const response = NextResponse.json({
      user: toLegacyUser(user as UserRow),
    });

    response.headers.set('Set-Cookie', setAuthCookie(token));
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Invalid encrypted auth payload') {
      return NextResponse.json({ error: 'Invalid encrypted auth payload' }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('AUTH_ENCRYPTION_PRIVATE_KEY')) {
      return NextResponse.json({ error: 'Server encryption key is not configured' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
