import { NextRequest, NextResponse } from 'next/server';
import { aiQueries, auditLogs, currentUser } from '@/lib/dummy-data';
import { processQuery } from '@/lib/ai-service';
import { z } from 'zod';

const querySchema = z.object({
  query: z.string().min(1),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = querySchema.parse(body);

    const result = processQuery(data.query, data.sessionId);

    const newQuery = {
      _id: `q${Date.now()}`,
      userId: currentUser?._id ?? 'u1',
      sessionId: result.sessionId,
      query: data.query,
      response: result.response,
      sources: result.sources,
      intent: result.intent,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    };

    aiQueries.push(newQuery);

    auditLogs.push({
      _id: `al-${Date.now()}`,
      userId: currentUser?._id ?? 'u1',
      action: 'ai_query',
      resource: 'queries',
      resourceId: newQuery._id,
      details: {
        query: data.query,
        intent: result.intent,
        sessionId: result.sessionId,
        sourceCount: result.sources.length,
      },
      ipAddress: '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    } as never);

    return NextResponse.json({
      response: result.response,
      sources: result.sources,
      intent: result.intent,
      advisoryDisclaimer: result.advisoryDisclaimer,
      sessionId: result.sessionId,
      query: newQuery,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '0', 10);
  const userId = currentUser?._id ?? 'u1';
  let userQueries = aiQueries.filter((q) => q.userId === userId);
  if (limit > 0) {
    userQueries = userQueries.slice(-limit);
  }
  return NextResponse.json({ queries: userQueries });
}
