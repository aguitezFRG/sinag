import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;

    const { data: post, error } = await supabaseAdmin
      .from('forum_posts')
      .select('id, title, content, likes_count, comments_count, created_at, updated_at, user_id, is_deleted')
      .eq('id', id)
      .single();

    if (error || !post || post.is_deleted)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const { data: comments } = await supabaseAdmin
      .from('forum_comments')
      .select('id, content, likes_count, created_at, updated_at, user_id, parent_comment_id, is_deleted')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    const allComments = (comments ?? []).filter((c: { is_deleted: boolean }) => !c.is_deleted);

    const userIds = Array.from(new Set([post.user_id, ...allComments.map((c: { user_id: string }) => c.user_id)]));
    const { data: users } = await supabaseAdmin
      .from('users').select('id, first_name, last_name, role').in('id', userIds);
    const userMap = new Map((users ?? []).map((u: { id: string; first_name: string; last_name: string; role: string }) => [u.id, u]));

    const commentIds = allComments.map((c: { id: string }) => c.id);
    const [{ data: postLike }, { data: commentLikes }] = await Promise.all([
      supabaseAdmin.from('forum_likes').select('id').eq('user_id', auth.userId).eq('post_id', id).maybeSingle(),
      commentIds.length
        ? supabaseAdmin.from('forum_likes').select('comment_id').eq('user_id', auth.userId).in('comment_id', commentIds)
        : Promise.resolve({ data: [] }),
    ]);
    const likedCommentSet = new Set((commentLikes ?? []).map((l: { comment_id: string }) => l.comment_id));

    const makeAuthor = (userId: string) => {
      const u = userMap.get(userId) as { id: string; first_name: string; last_name: string; role: string } | undefined;
      return u ? { id: u.id, name: `${u.first_name} ${u.last_name}`, role: u.role } : { id: userId, name: 'Unknown', role: 'unknown' };
    };

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        likesCount: post.likes_count,
        commentsCount: post.comments_count,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        isLiked: !!postLike,
        isOwner: post.user_id === auth.userId,
        author: makeAuthor(post.user_id),
      },
      comments: allComments.map((c: { id: string; content: string; likes_count: number; created_at: string; updated_at: string; parent_comment_id: string | null; user_id: string }) => ({
        id: c.id,
        content: c.content,
        likesCount: c.likes_count,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        parentCommentId: c.parent_comment_id,
        isLiked: likedCommentSet.has(c.id),
        isOwner: c.user_id === auth.userId,
        author: makeAuthor(c.user_id),
      })),
    });
  });
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;
    const body = await req.json();
    const title = (body.title ?? '').trim();
    const content = (body.content ?? '').trim();

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: 'Title too long (max 200 chars)' }, { status: 400 });

    const { data: existing } = await supabaseAdmin
      .from('forum_posts').select('user_id, is_deleted').eq('id', id).single();

    if (!existing || existing.is_deleted)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    if (existing.user_id !== auth.userId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: updated, error } = await supabaseAdmin
      .from('forum_posts').update({ title, content }).eq('id', id)
      .select('id, title, content, updated_at').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: updated });
  });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  return withAuth(req, async (_req, auth) => {
    const { id } = await params;

    const { data: existing } = await supabaseAdmin
      .from('forum_posts').select('user_id, is_deleted').eq('id', id).single();

    if (!existing || existing.is_deleted)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const canDelete = existing.user_id === auth.userId || auth.role === 'admin';
    if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { error } = await supabaseAdmin
      .from('forum_posts').update({ is_deleted: true }).eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  });
}
