import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      .select('id, title')
      .eq('id', id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    try {
      const body = await req.json();
      const { feedback, status } = body;

      const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
        user_id: auth.userId,
        action: 'update',
        resource: 'document',
        resource_id: id,
        details: {
          feedback,
          status: status || 'reviewed',
          title: doc.title,
        },
        user_agent: req.headers.get('user-agent') || null,
        ip_address:
          req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          req.headers.get('x-real-ip') ||
          null,
      });

      if (auditError) {
        return NextResponse.json({ error: auditError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  }, ['adviser']);
}
