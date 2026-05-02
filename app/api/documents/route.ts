import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { DOCUMENTS_BUCKET, supabaseAdmin } from '@/lib/supabase-admin';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toLegacyDocumentShape(
  row: {
    id: string;
    title: string;
    type: string;
    owner_id: string;
    workflow_id: string | null;
    is_public: boolean;
    tags: string[];
    created_at: string;
    updated_at: string;
    owner_name?: string;
    versions?: { version_number: number; uploaded_at: string }[];
  }
) {
  return {
    _id: row.id,
    title: row.title,
    type: row.type,
    ownerId: row.owner_id,
    workflowId: row.workflow_id ?? undefined,
    isPublic: row.is_public,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ownerName: row.owner_name,
    versions: (row.versions ?? []).map((v) => ({
      versionNumber: v.version_number,
      uploadedAt: v.uploaded_at,
    })),
  };
}

type DocumentListRow = {
  id: string;
  title: string;
  type: string;
  owner_id: string;
  workflow_id: string | null;
  is_public: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const mine = searchParams.get('mine') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    let query = supabaseAdmin
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
          updated_at
        `
      )
      .order('updated_at', { ascending: false });

    if (mine) {
      if (!isUuid(auth.userId)) {
        return NextResponse.json(
          {
            error:
              'Authenticated user id is not UUID. Re-login using Supabase-backed users before using documents API.',
          },
          { status: 400 }
        );
      }
      query = query.eq('owner_id', auth.userId);
    }

    if (ownerId && isUuid(ownerId)) {
      query = query.eq('owner_id', ownerId);
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as DocumentListRow[];
    const ownerIds = Array.from(new Set(rows.map((r) => r.owner_id)));
    const documentIds = rows.map((r) => r.id);

    const [{ data: users }, { data: versions }] = await Promise.all([
      ownerIds.length
        ? supabaseAdmin.from('users').select('id, first_name, last_name').in('id', ownerIds)
        : Promise.resolve({ data: [] }),
      documentIds.length
        ? supabaseAdmin
            .from('document_versions')
            .select('document_id, version_number, uploaded_at')
            .in('document_id', documentIds)
        : Promise.resolve({ data: [] }),
    ]);

    const ownerNameById = new Map<string, string>();
    ((users as Array<{ id: string; first_name: string; last_name: string }>) ?? []).forEach((u) => {
      ownerNameById.set(u.id, `${u.first_name} ${u.last_name}`);
    });

    const versionsByDocumentId = new Map<string, Array<{ version_number: number; uploaded_at: string }>>();
    (((versions as Array<{ document_id: string; version_number: number; uploaded_at: string }>) ?? [])).forEach((v) => {
      const existing = versionsByDocumentId.get(v.document_id) ?? [];
      existing.push({ version_number: v.version_number, uploaded_at: v.uploaded_at });
      versionsByDocumentId.set(v.document_id, existing);
    });

    const documents = rows.map((row) =>
      toLegacyDocumentShape({
        ...row,
        tags: row.tags ?? [],
        owner_name: ownerNameById.get(row.owner_id),
        versions: versionsByDocumentId.get(row.id) ?? [],
      })
    );

    return NextResponse.json({ documents });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    const contentType = req.headers.get('content-type') || '';

    let title: string;
    let type: string;
    let tags: string[] = [];
    let isPublic = false;
    let workflowId: string | undefined;
    let uploadFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = (formData.get('title') as string) || 'Untitled';
      type = (formData.get('type') as string) || 'proposal';
      const tagsRaw = formData.get('tags') as string;
      if (tagsRaw) tags = tagsRaw.split(',').map((t) => t.trim());
      isPublic = formData.get('isPublic') === 'true';
      workflowId = (formData.get('workflowId') as string) || undefined;
      const file = formData.get('file');
      uploadFile = file instanceof File ? file : null;
    } else {
      const body = await req.json();
      title = body.title || 'Untitled';
      type = body.type || 'proposal';
      tags = body.tags || [];
      isPublic = body.isPublic ?? false;
      workflowId = body.workflowId;
    }

    if (!isUuid(auth.userId)) {
      return NextResponse.json(
        {
          error:
            'Authenticated user id is not UUID. Re-login using Supabase-backed users before creating documents.',
        },
        { status: 400 }
      );
    }

    const insertPayload: Record<string, unknown> = {
      title,
      type,
      owner_id: auth.userId,
      is_public: isPublic,
      tags,
    };

    if (workflowId && isUuid(workflowId)) {
      insertPayload.workflow_id = workflowId;
    }

    const { data: insertedDoc, error: insertError } = await supabaseAdmin
      .from('documents')
      .insert(insertPayload)
      .select('id, title, type, owner_id, workflow_id, is_public, tags, created_at, updated_at')
      .single();

    if (insertError || !insertedDoc) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create document' }, { status: 500 });
    }

    let createdVersion: { version_number: number; uploaded_at: string } | null = null;

    if (uploadFile) {
      const path = `${insertedDoc.id}/v1-${Date.now()}-${uploadFile.name}`;
      const fileBuffer = await uploadFile.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from(DOCUMENTS_BUCKET)
        .upload(path, fileBuffer, {
          contentType: uploadFile.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: `Document created but file upload failed: ${uploadError.message}` }, { status: 500 });
      }

      const { data: versionRow, error: versionError } = await supabaseAdmin
        .from('document_versions')
        .insert({
          document_id: insertedDoc.id,
          version_number: 1,
          file_url: path,
          uploaded_by: auth.userId,
          change_log: 'Initial upload',
        })
        .select('version_number, uploaded_at')
        .single();

      if (versionError) {
        return NextResponse.json(
          { error: `Document file uploaded but version metadata failed: ${versionError.message}` },
          { status: 500 }
        );
      }
      createdVersion = versionRow;
    }

    const document = toLegacyDocumentShape({
      ...insertedDoc,
      versions: createdVersion ? [createdVersion] : [],
    });

    return NextResponse.json({ document });
  });
}
