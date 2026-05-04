import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processQuery } from '@/lib/ai-service';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  query: z.string().trim().min(1),
  sessionId: z.string().optional(),
});

async function collectStream(stream: AsyncIterable<string>): Promise<string> {
  let response = '';
  for await (const chunk of stream) {
    response += chunk;
  }
  return response;
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const result = await processQuery(parsed.data.query, parsed.data.sessionId);
    const response = await collectStream(result.stream);

    return NextResponse.json({
      response,
      intent: result.meta.intent,
      sessionId: result.meta.sessionId,
      sources: result.meta.sources,
      advisoryDisclaimer: result.meta.advisoryDisclaimer,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process query';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
