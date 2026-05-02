import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid document id' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('documents')
      .select(
        `
          id,
          title,
          type,
          owner_id,
          workflow_id,
          is_public,
          tags,
          created_at,
          updated_at,
          document_versions ( version_number, uploaded_at )
        `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const isPrivileged = ['admin', 'coordinator', 'adviser'].includes(auth.role);
    if (!isPrivileged && data.owner_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    type VersionRow = { version_number: number; uploaded_at: string };

    return NextResponse.json({
      document: {
        _id: data.id,
        title: data.title,
        type: data.type,
        ownerId: data.owner_id,
        workflowId: data.workflow_id ?? undefined,
        isPublic: data.is_public,
        tags: data.tags ?? [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        versions: ((data.document_versions ?? []) as VersionRow[]).map((v) => ({
          versionNumber: v.version_number,
          uploadedAt: v.uploaded_at,
        })),
      },
    });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid document id' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('documents')
      .select('id, owner_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const isPrivileged = ['admin', 'coordinator'].includes(auth.role);
    if (!isPrivileged && existing.owner_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('documents').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  });
}
