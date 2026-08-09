import { NextRequest, NextResponse } from 'next/server';
import { insertPersonaToDB } from '@/lib/db';
import { runCycle } from '@/lib/cycle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const personaData = body.persona || {};

    const name = personaData.name || 'Ada';
    const domain = personaData.domain || 'AI Security';
    const voice_description = personaData.voice_description || `Authoritative ${domain} expert persona with sharp technical insight.`;
    const editorial_criteria = personaData.editorial_criteria || [
      `Must reveal high-signal technical depth in ${domain}.`,
      'Must offer actionable insights for engineering leads.',
      'Reject hype, generic announcements, or low-quality clickbait.',
    ];

    // Insert persona into DB
    const persona = await insertPersonaToDB({
      name,
      domain,
      voice_description,
      editorial_criteria,
    });

    // Run initial cycle to generate starting post for persona
    await runCycle(persona.agentId);

    return NextResponse.json({
      agentId: persona.agentId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize agent' },
      { status: 500 }
    );
  }
}
