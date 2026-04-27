import { NextRequest, NextResponse } from 'next/server';
import { documents, guidanceResources, workflows, users } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type');

  const query = q.toLowerCase();
  const results: any[] = [];

  if (!type || type === 'document') {
    results.push(
      ...documents
        .filter((d) => d.title.toLowerCase().includes(query) || d.tags.some((t) => t.includes(query)))
        .map((d) => ({ ...d, resultType: 'document' }))
    );
  }

  if (!type || type === 'guidance') {
    results.push(
      ...guidanceResources
        .filter((g) => g.isActive)
        .filter(
          (g) =>
            g.title.toLowerCase().includes(query) ||
            g.content.toLowerCase().includes(query) ||
            g.tags.some((t) => t.includes(query))
        )
        .map((g) => ({ ...g, resultType: 'guidance' }))
    );
  }

  if (!type || type === 'workflow') {
    results.push(
      ...workflows
        .filter((w) => w.title.toLowerCase().includes(query))
        .map((w) => ({ ...w, resultType: 'workflow' }))
    );
  }

  if (!type || type === 'user') {
    results.push(
      ...users
        .filter(
          (u) =>
            u.profile.firstName.toLowerCase().includes(query) ||
            u.profile.lastName.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        )
        .map((u) => ({ ...u, resultType: 'user' }))
    );
  }

  return NextResponse.json({ results, total: results.length });
}
