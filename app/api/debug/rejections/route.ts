import { NextRequest, NextResponse } from 'next/server';
import { getRejectionsFromDB } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization') || req.headers.get('x-cron-secret');

    if (cronSecret && authHeader !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const rejections = await getRejectionsFromDB(agentId);

    return NextResponse.json({
      agentId,
      rejectionsCount: rejections.length,
      rejections: rejections.map((r) => ({
        id: r.id,
        topic: r.topic,
        reason: r.reason_rejected,
        similarityScore: r.similarity_score ?? null,
        createdAt: r.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error fetching rejections' }, { status: 500 });
  }
}
