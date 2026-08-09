import { NextRequest, NextResponse } from 'next/server';
import { getPersonaFromDB, getPostsFromDB } from '@/lib/db';
import { runCycle } from '@/lib/cycle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const refresh = searchParams.get('refresh') === 'true';

    if (!agentId) {
      return NextResponse.json({ error: 'agentId parameter is required' }, { status: 400 });
    }

    const persona = await getPersonaFromDB(agentId);
    if (!persona) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    let dbPosts = await getPostsFromDB(agentId);

    // Run a new cycle if: no posts exist yet, OR user explicitly clicked Sync Feed
    if (dbPosts.length === 0 || refresh) {
      await runCycle(agentId);
      dbPosts = await getPostsFromDB(agentId);
    }

    return NextResponse.json({
      posts: dbPosts.map((p) => ({
        id: p.id,
        createdAt: new Date(p.created_at).toISOString(),
        text: p.text,
        rationale: p.rationale,
        sources: p.sources || [],
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
