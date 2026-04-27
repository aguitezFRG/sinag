import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { guidanceResources } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const q = searchParams.get('q');

    let result = guidanceResources.filter((g) => g.isActive);

    if (category) result = result.filter((g) => g.category === category);
    if (tag) result = result.filter((g) => g.tags.includes(tag));
    if (q) {
      const query = q.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.content.toLowerCase().includes(query) ||
          g.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ resources: result });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (_req, _auth) => {
    const body = await req.json();
    const resource = {
      _id: `g${Date.now()}`,
      ...body,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    guidanceResources.push(resource as any);
    return NextResponse.json({ resource });
  }, ['coordinator', 'admin']);
}
