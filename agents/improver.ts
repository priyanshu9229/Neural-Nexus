import OpenAI from 'openai';
import { ImproverOutputSchema } from '@/lib/schemas';
import fs from 'fs';
import path from 'path';

export async function runImproverAgent(
  openai: OpenAI,
  linkedinDraft: string,
  twitterDraft: string[],
  actionableFixes: string[]
) {
  const promptPath = path.join(process.cwd(), 'prompts', 'improver.txt');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

  const userContent = `Original LinkedIn: "${linkedinDraft}"\nOriginal Tweets: ${JSON.stringify(
    twitterDraft
  )}\nReviewer Fixes: ${JSON.stringify(actionableFixes)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || '{}');
  return ImproverOutputSchema.parse(rawJson);
}
