import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { DOCUMENTS_BUCKET, supabaseAdmin } from '@/lib/supabase-admin';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid document id' }, { status: 400 });
    }

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const isPrivileged = ['admin', 'coordinator', 'adviser'].includes(auth.role);
    if (!isPrivileged && doc.owner_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: versions, error: versionsError } = await supabaseAdmin
      .from('document_versions')
      .select('id, version_number, file_url, uploaded_by, uploaded_at, change_log')
      .eq('document_id', id)
      .order('version_number', { ascending: false });

    if (versionsError) {
      return NextResponse.json({ error: versionsError.message }, { status: 500 });
    }

    const signedVersions = await Promise.all(
      (versions ?? []).map(async (version) => {
        const { data: signedData, error: signedError } = await supabaseAdmin.storage
          .from(DOCUMENTS_BUCKET)
          .createSignedUrl(version.file_url, 60 * 10);

        return {
          id: version.id,
          versionNumber: version.version_number,
          filePath: version.file_url,
          fileUrl: signedError ? null : signedData?.signedUrl ?? null,
          uploadedBy: version.uploaded_by,
          uploadedAt: version.uploaded_at,
          changeLog: version.change_log,
        };
      })
    );

    return NextResponse.json({ versions: signedVersions });
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Invalid document id' }, { status: 400 });
    }
    if (!isUuid(auth.userId)) {
      return NextResponse.json({ error: 'Authenticated user id must be a UUID' }, { status: 400 });
    }

    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, title, type, owner_id, workflow_id, is_public, tags, created_at, updated_at')
      .eq('id', id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    let changeLog = 'New version uploaded';
    let filePath: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      changeLog = (formData.get('changeLog') as string) || changeLog;
      const file = formData.get('file');
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Missing file in multipart payload' }, { status: 400 });
      }
      filePath = `${doc.id}/v-${Date.now()}-${file.name}`;
      const fileBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from(DOCUMENTS_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });
      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    } else {
      const body = await req.json();
      filePath = body.fileUrl || null;
      changeLog = body.changeLog || changeLog;
    }

    if (!filePath) {
      return NextResponse.json({ error: 'fileUrl or multipart file is required' }, { status: 400 });
    }

    const { data: lastVersion } = await supabaseAdmin
      .from('document_versions')
      .select('version_number')
      .eq('document_id', doc.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (lastVersion?.version_number ?? 0) + 1;

    const { error: versionError } = await supabaseAdmin.from('document_versions').insert({
      document_id: doc.id,
      version_number: nextVersion,
      file_url: filePath,
      uploaded_by: auth.userId,
      change_log: changeLog,
    });

    if (versionError) {
      return NextResponse.json({ error: versionError.message }, { status: 500 });
    }

    const { data: versions } = await supabaseAdmin
      .from('document_versions')
      .select('version_number, uploaded_at')
      .eq('document_id', doc.id)
      .order('version_number', { ascending: true });

    return NextResponse.json({
      document: {
        _id: doc.id,
        title: doc.title,
        type: doc.type,
        ownerId: doc.owner_id,
        workflowId: doc.workflow_id ?? undefined,
        isPublic: doc.is_public,
        tags: doc.tags ?? [],
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        versions: (versions ?? []).map((v) => ({
          versionNumber: v.version_number,
          uploadedAt: v.uploaded_at,
        })),
      },
    });
  });
}
