import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type');

    const query = q.toLowerCase();
    const results: Array<Record<string, unknown>> = [];

    if (!type || type === 'document') {
      const { data: docs } = await supabaseAdmin
        .from('documents')
        .select('id, title, type, owner_id, workflow_id, is_public, tags, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);
      results.push(
        ...((docs ?? [])
          .filter(
            (d) =>
              d.title.toLowerCase().includes(query) ||
              ((d.tags ?? []) as string[]).some((t: string) => t.toLowerCase().includes(query))
          )
          .map((d) => ({
            _id: d.id,
            title: d.title,
            type: d.type,
            ownerId: d.owner_id,
            workflowId: d.workflow_id,
            isPublic: d.is_public,
            tags: d.tags ?? [],
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            resultType: 'document',
          })) as Array<Record<string, unknown>>)
      );
    }

    if (!type || type === 'guidance') {
      const { data: guidance } = await supabaseAdmin
        .from('guidance_resources')
        .select('id, title, category, content, file_url, tags, program, is_active, created_at, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(50);
      results.push(
        ...((guidance ?? [])
          .filter(
            (g) =>
              g.title.toLowerCase().includes(query) ||
              g.content.toLowerCase().includes(query) ||
              ((g.tags ?? []) as string[]).some((t: string) => t.toLowerCase().includes(query))
          )
          .map((g) => ({
            _id: g.id,
            title: g.title,
            category: g.category,
            content: g.content,
            fileUrl: g.file_url,
            tags: g.tags ?? [],
            program: g.program,
            isActive: g.is_active,
            createdAt: g.created_at,
            updatedAt: g.updated_at,
            resultType: 'guidance',
          })) as Array<Record<string, unknown>>)
      );
    }

    if (!type || type === 'workflow') {
      const { data: workflows } = await supabaseAdmin
        .from('workflows')
        .select('id, title, status, current_stage, student_id, adviser_id, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);
      results.push(
        ...((workflows ?? [])
          .filter((w) => w.title.toLowerCase().includes(query))
          .map((w) => ({
            _id: w.id,
            title: w.title,
            status: w.status,
            currentStage: w.current_stage,
            studentId: w.student_id,
            adviserId: w.adviser_id,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
            resultType: 'workflow',
          })) as Array<Record<string, unknown>>)
      );
    }

    if (!type || type === 'user') {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email, role, first_name, last_name, avatar, is_active, created_at, last_login_at')
        .order('created_at', { ascending: false })
        .limit(50);
      results.push(
        ...((users ?? [])
          .filter(
            (u) =>
              u.first_name.toLowerCase().includes(query) ||
              u.last_name.toLowerCase().includes(query) ||
              u.email.toLowerCase().includes(query)
          )
          .map((u) => ({
            _id: u.id,
            email: u.email,
            role: u.role,
            profile: {
              firstName: u.first_name,
              lastName: u.last_name,
              avatar: u.avatar ?? '',
            },
            isActive: u.is_active,
            createdAt: u.created_at,
            lastLoginAt: u.last_login_at,
            resultType: 'user',
          })) as Array<Record<string, unknown>>)
      );
    }

    return NextResponse.json({ results, total: results.length });
  });
}
