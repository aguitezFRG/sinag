import { NextRequest, NextResponse } from 'next/server';
import { documents, users, currentUser } from '@/lib/dummy-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId');
  const mine = searchParams.get('mine') === 'true';
  const pendingReview = searchParams.get('pendingReview') === 'true';
  const limit = parseInt(searchParams.get('limit') || '0', 10);

  let result = documents.map((doc) => {
    const owner = users.find((u) => u._id === doc.ownerId);
    return {
      ...doc,
      ownerName: owner ? `${owner.profile.firstName} ${owner.profile.lastName}` : 'Unknown',
    };
  });

  if (mine && currentUser) {
    const userId = currentUser._id;
    result = result.filter((d) => d.ownerId === userId);
  }
  if (ownerId) {
    result = result.filter((d) => d.ownerId === ownerId);
  }
  if (pendingReview) {
    // For demo: treat all documents as pending review if no explicit reviewStatus
    result = result.filter((d) => !(d as any).reviewStatus || (d as any).reviewStatus === 'pending');
  }
  if (limit > 0) {
    result = result.slice(0, limit);
  }

  return NextResponse.json({ documents: result });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  let title: string;
  let type: string;
  let tags: string[] = [];
  let isPublic = false;
  let workflowId: string | undefined;

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    title = (formData.get('title') as string) || 'Untitled';
    type = (formData.get('type') as string) || 'proposal';
    const tagsRaw = formData.get('tags') as string;
    if (tagsRaw) tags = tagsRaw.split(',').map((t) => t.trim());
    isPublic = formData.get('isPublic') === 'true';
    workflowId = (formData.get('workflowId') as string) || undefined;
  } else {
    const body = await req.json();
    title = body.title || 'Untitled';
    type = body.type || 'proposal';
    tags = body.tags || [];
    isPublic = body.isPublic ?? false;
    workflowId = body.workflowId;
  }

  const doc = {
    _id: `d${Date.now()}`,
    title,
    type,
    ownerId: currentUser?._id ?? 'u1',
    workflowId,
    versions: [],
    isPublic,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  documents.push(doc as any);
  return NextResponse.json({ document: doc });
}
