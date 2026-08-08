import { NextRequest, NextResponse } from 'next/server';
import { getAllPersonasFromDB } from '@/lib/db';
import { runCycle } from '@/lib/cycle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization') || req.headers.get('x-cron-secret');

    // Secret protection check
    if (cronSecret && authHeader !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const personas = await getAllPersonasFromDB();
    const results = [];

    for (const persona of personas) {
      const res = await runCycle(persona.agentId);
      results.push({ agentId: persona.agentId, ...res });
    }

    return NextResponse.json({
      processedCount: personas.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Cron error' }, { status: 500 });
  }
}
