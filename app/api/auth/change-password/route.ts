import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export async function POST(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    try {
      const body = await req.json();
      const data = changePasswordSchema.parse(body);

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, password_hash')
        .eq('id', auth.userId)
        .single();

      if (userError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const newPasswordHash = await hashPassword(data.newPassword);
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', auth.userId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
  });
}
