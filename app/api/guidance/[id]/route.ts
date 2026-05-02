import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, _auth) => {
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid resource id' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('guidance_resources')
      .select('id, title, category, content, file_url, tags, program, is_active, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({
      resource: {
        _id: data.id,
        title: data.title,
        category: data.category,
        content: data.content,
        fileUrl: data.file_url ?? undefined,
        tags: data.tags ?? [],
        program: data.program ?? undefined,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  });
}
