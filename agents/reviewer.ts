import OpenAI from 'openai';
import { ReviewerOutputSchema } from '@/lib/schemas';
import fs from 'fs';
import path from 'path';

export async function runReviewerAgent(
  openai: OpenAI,
  linkedinDraft: string,
  twitterDraft: string[]
) {
  const promptPath = path.join(process.cwd(), 'prompts', 'reviewer.txt');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

  const userContent = `LinkedIn Draft:\n"${linkedinDraft}"\n\nX Thread Draft:\n"${twitterDraft.join(' | ')}"`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || '{}');
  return ReviewerOutputSchema.parse(rawJson);
}
