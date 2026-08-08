import OpenAI from 'openai';
import { WriterOutputSchema } from '@/lib/schemas';
import fs from 'fs';
import path from 'path';

export async function runWriterAgent(
  openai: OpenAI,
  topicTitle: string,
  insights: string[],
  dataPoints: string[]
) {
  const promptPath = path.join(process.cwd(), 'prompts', 'writer.txt');
  const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

  const userContent = `Topic: "${topicTitle}"\nKey Insights: ${JSON.stringify(insights)}\nData Points: ${JSON.stringify(dataPoints)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || '{}');
  return WriterOutputSchema.parse(rawJson);
}
