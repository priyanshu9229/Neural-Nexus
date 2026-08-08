import OpenAI from 'openai';
import { PublisherOutputSchema } from '@/lib/schemas';
import fs from 'fs';
import path from 'path';

export async function runPublisherAgent(
  openai: OpenAI,
  polishedLinkedin: string,
  topicTitle: string
) {
  const promptPath = path.join(process.cwd(), 'prompts', 'publisher.txt');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

  const userContent = `Topic: "${topicTitle}"\nPolished LinkedIn Post:\n"${polishedLinkedin}"`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || '{}');
  return PublisherOutputSchema.parse(rawJson);
}
