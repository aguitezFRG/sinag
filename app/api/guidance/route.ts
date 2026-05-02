import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

type GuidanceRow = {
  id: string;
  title: string;
  category: string;
  content: string;
  file_url: string | null;
  tags: string[] | null;
  program: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function toLegacyResource(row: GuidanceRow) {
  return {
    _id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    fileUrl: row.file_url ?? undefined,
    tags: row.tags ?? [],
    program: row.program ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const q = searchParams.get('q');

    let query = supabaseAdmin
      .from('guidance_resources')
      .select('id, title, category, content, file_url, tags, program, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (tag) query = query.contains('tags', [tag]);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let resources = ((data ?? []) as GuidanceRow[]).map(toLegacyResource);
    if (q) {
      const needle = q.toLowerCase();
      resources = resources.filter(
        (r) =>
          r.title.toLowerCase().includes(needle) ||
          r.content.toLowerCase().includes(needle) ||
          r.tags.some((t: string) => t.toLowerCase().includes(needle))
      );
    }

    return NextResponse.json({ resources });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from('guidance_resources')
      .insert({
        title: body.title || 'Untitled',
        category: body.category || 'guideline',
        content: body.content || '',
        file_url: body.fileUrl || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        program: body.program || null,
        is_active: true,
      })
      .select('id, title, category, content, file_url, tags, program, is_active, created_at, updated_at')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create resource' }, { status: 500 });
    }

    return NextResponse.json({ resource: toLegacyResource(data as GuidanceRow) });
  }, ['coordinator', 'admin']);
}
