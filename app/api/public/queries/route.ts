import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processQuery } from '@/lib/ai-service';

/**
 * Public guest-mode query endpoint for the mini chatbot.
 *
 * - No authentication required.
 * - Streams the same NDJSON protocol as /api/queries so the client can
 *   share a single transport.
 * - Does NOT persist conversations to the database (the `ai_queries` table
 *   requires a `user_id` and we never want unauthenticated traffic creating
 *   audit-log noise). Guests therefore get single-turn responses without
 *   server-side history.
 * - Lightly rate-limited by query length to keep abuse cost bounded.
 */
const guestQuerySchema = z.object({
  query: z.string().min(1).max(800),
  sessionId: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parse = guestQuerySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues }, { status: 400 });
  }
  const { query, sessionId } = parse.data;

  let result: Awaited<ReturnType<typeof processQuery>>;
  try {
    result = await processQuery(query, sessionId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process query';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { stream, meta } = result;
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
        enqueue({
          type: 'meta',
          intent: meta.intent,
          sessionId: meta.sessionId,
          sources: meta.sources,
          advisoryDisclaimer: meta.advisoryDisclaimer,
          response: accumulated,
          guest: true,
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
}
