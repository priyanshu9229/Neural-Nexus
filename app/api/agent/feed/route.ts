import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/agentMemory';
import { tickAgentFeed } from '@/lib/autonomousEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ posts: [] });
    }

    const agent = getAgent(agentId);

    if (!agent) {
      return NextResponse.json({ posts: [] });
    }

    // Trigger autonomous feed tick (generates new posts over time autonomously)
    const posts = await tickAgentFeed(agent);

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        createdAt: p.createdAt,
        text: p.text,
        rationale: p.rationale,
        sources: p.sources,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ posts: [] });
  }
}
