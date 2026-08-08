import OpenAI from 'openai';
import { PlannerOutputSchema } from '@/lib/schemas';
import fs from 'fs';
import path from 'path';

export async function runPlannerAgent(openai: OpenAI, goal: string) {
  const promptPath = path.join(process.cwd(), 'prompts', 'planner.txt');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Goal: "${goal}"` },
    ],
    response_format: { type: 'json_object' },
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || '{}');
  return PlannerOutputSchema.parse(rawJson);
}
