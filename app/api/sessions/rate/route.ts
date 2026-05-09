import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

const RateSchema = z.object({
  sessionId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (_request, auth) => {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const parse = RateSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid data', issues: parse.error.issues }, { status: 400 });
    }
    const { sessionId, rating, feedback } = parse.data;

    // Count messages for this session belonging to this user
    const { count: messageCount } = await supabaseAdmin
      .from('ai_queries')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('user_id', auth.userId);

    const { error } = await supabaseAdmin.from('session_ratings').upsert(
      {
        session_id: sessionId,
        user_id: auth.userId,
        user_role: auth.role,
        rating,
        feedback: feedback || null,
        message_count: messageCount ?? 0,
      },
      { onConflict: 'session_id' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  });
}
