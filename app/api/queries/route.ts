import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { processQuery } from '@/lib/ai-service';
import { z } from 'zod';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(value: unknown): boolean {
  return typeof value === 'string' && UUID_RE.test(value);
}

const querySchema = z.object({
  query: z.string().min(1),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    if (!isUuid(auth.userId)) {
      return NextResponse.json({ error: 'Authenticated user id must be UUID' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parseResult = querySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues }, { status: 400 });
    }
    const data = parseResult.data;

    let result: Awaited<ReturnType<typeof processQuery>>;
    try {
      result = await processQuery(data.query, data.sessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process query';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const { stream, meta } = result;
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null;
    const userAgent = req.headers.get('user-agent') || null;
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        const enqueue = (obj: unknown) =>
          controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

        let accumulated = '';
        try {
          for await (const chunk of stream) {
            accumulated += chunk;
            enqueue({ type: 'chunk', text: chunk });
          }

          // Persist after stream completes
          const { data: queryRow, error: queryInsertError } = await supabaseAdmin
            .from('ai_queries')
            .insert({
              user_id: auth.userId,
              session_id: meta.sessionId,
              query: data.query,
              response: accumulated,
              intent: meta.intent,
              is_flagged: false,
            })
            .select('id, user_id, session_id, query, response, intent, is_flagged, created_at')
            .single();

          if (queryInsertError) {
            console.error('[queries] ai_queries insert failed:', queryInsertError.message, queryInsertError.details ?? '');
          }

          if (queryRow && meta.sources.length > 0) {
            const { error: sourcesInsertError } = await supabaseAdmin.from('ai_query_sources').insert(
              meta.sources.map((source) => ({
                ai_query_id: queryRow.id,
                title: source.title || null,
                source_type: source.type || null,
                url: source.url || null,
              }))
            );
            if (sourcesInsertError) {
              console.error('[queries] ai_query_sources insert failed:', sourcesInsertError.message, sourcesInsertError.details ?? '');
            }
          }

          await supabaseAdmin.from('audit_logs').insert({
            user_id: auth.userId,
            action: 'ai_query',
            resource: 'queries',
            resource_id: queryRow?.id ?? null,
            details: {
              query: data.query,
              intent: meta.intent,
              sessionId: meta.sessionId,
              sourceCount: meta.sources.length,
            },
            ip_address: ipAddress,
            user_agent: userAgent,
          });

          enqueue({
            type: 'meta',
            intent: meta.intent,
            sessionId: meta.sessionId,
            sources: meta.sources,
            advisoryDisclaimer: meta.advisoryDisclaimer,
            queryId: queryRow?.id ?? null,
            // Backward-compat shape for any consumers reading data.query.*
            query: queryRow
              ? {
                  _id: queryRow.id,
                  userId: queryRow.user_id,
                  sessionId: queryRow.session_id,
                  query: queryRow.query,
                  response: queryRow.response,
                  intent: queryRow.intent,
                  isFlagged: queryRow.is_flagged,
                  createdAt: queryRow.created_at,
                  sources: meta.sources,
                }
              : null,
            // Top-level response for consumers reading data.response
            response: accumulated,
          });
        } catch (err) {
          enqueue({
            type: 'error',
            message: err instanceof Error ? err.message : 'Stream failed',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  });
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, auth) => {
    if (!isUuid(auth.userId)) {
      return NextResponse.json({ queries: [] });
    }
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    let query = supabaseAdmin
      .from('ai_queries')
      .select(
        `
          id,
          user_id,
          session_id,
          query,
          response,
          intent,
          is_flagged,
          created_at,
          ai_query_sources ( title, source_type, url )
        `
      )
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (limit > 0) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type QuerySourceRow = { title: string | null; source_type: string | null; url: string | null };
    type QueryRow = {
      id: string;
      user_id: string;
      session_id: string;
      query: string;
      response: string;
      intent: string;
      is_flagged: boolean;
      created_at: string;
      ai_query_sources: QuerySourceRow[] | null;
    };

    const queries = ((data ?? []) as QueryRow[]).map((row) => ({
      _id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      query: row.query,
      response: row.response,
      intent: row.intent,
      isFlagged: row.is_flagged,
      createdAt: row.created_at,
      sources: (row.ai_query_sources ?? []).map((source) => ({
        title: source.title,
        type: source.source_type,
        url: source.url,
      })),
    }));

    return NextResponse.json({ queries });
  });
}
