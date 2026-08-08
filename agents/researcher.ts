import OpenAI from 'openai';
import { ResearcherOutputSchema } from '@/lib/schemas';
import fs from 'fs';
import path from 'path';

export async function runResearcherAgent(openai: OpenAI, topicTitle: string, coreAngle: string) {
  const promptPath = path.join(process.cwd(), 'prompts', 'researcher.txt');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Topic: "${topicTitle}"\nCore Angle: "${coreAngle}"` },
    ],
    response_format: { type: 'json_object' },
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || '{}');
  return ResearcherOutputSchema.parse(rawJson);
}
