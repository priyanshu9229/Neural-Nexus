import { NextRequest, NextResponse } from 'next/server';
import { createAgent } from '@/lib/agentMemory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const persona = body.persona || {};

    const name = persona.name || 'Ada';
    const domain = persona.domain || 'AI Security';

    const agent = createAgent(name, domain);

    return NextResponse.json({
      agentId: agent.agentId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize agent' },
      { status: 500 }
    );
  }
}
