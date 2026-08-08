import OpenAI from 'openai';
import { AgentName, ContentPackage, StreamEvent } from '@/types';
import { generateMockContentPackage } from './mockGenerator';
import {
  PlannerOutputSchema,
  ResearcherOutputSchema,
  WriterOutputSchema,
  ReviewerOutputSchema,
  ImproverOutputSchema,
  PublisherOutputSchema,
} from '@/lib/schemas';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function runAgentPipelineStream(
  goal: string,
  onEvent: (event: StreamEvent) => void
) {
  if (!openai) {
    // Fallback: Run realistic streaming simulation using mock generator
    await runMockPipelineStream(goal, onEvent);
    return;
  }

  try {
    // 1. PLANNER
    onEvent({ agent: 'Planner', type: 'status', status: 'running' });
    onEvent({ agent: 'Planner', type: 'token', token: '🤔 Analyzing goal and constructing content strategy...\n' });

    const plannerPrompt = `Goal: "${goal}"\nDeconstruct this goal into a strategic topic title, target audience, core hook angle, and 5 sub-tasks. Return JSON matching PlannerOutputSchema.`;
    const plannerRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are the Content Strategy Planner Agent for CreatorOS.' },
        { role: 'user', content: plannerPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const plannerJson = JSON.parse(plannerRes.choices[0]?.message?.content || '{}');
    const plannerData = PlannerOutputSchema.parse(plannerJson);

    onEvent({ agent: 'Planner', type: 'reasoning', reasoning: plannerData.reasoning });
    onEvent({
      agent: 'Planner',
      type: 'token',
      token: `Topic: ${plannerData.topicTitle}\nAudience: ${plannerData.targetAudience}\nCore Angle: ${plannerData.coreAngle}\nTask breakdown generated.\n`,
    });
    onEvent({ agent: 'Planner', type: 'status', status: 'done' });

    // 2. RESEARCHER
    onEvent({ agent: 'Researcher', type: 'status', status: 'running' });
    onEvent({ agent: 'Researcher', type: 'token', token: '🔎 Searching trends, statistics, and industry data...\n' });

    const researcherPrompt = `Topic: "${plannerData.topicTitle}", Core Angle: "${plannerData.coreAngle}"\nSurface 3 insights, 3 trends, 2 data points, and 3 key hooks. Return JSON matching ResearcherOutputSchema.`;
    const researcherRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are the Market Trends Researcher Agent for CreatorOS.' },
        { role: 'user', content: researcherPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const researcherJson = JSON.parse(researcherRes.choices[0]?.message?.content || '{}');
    const researcherData = ResearcherOutputSchema.parse(researcherJson);

    onEvent({ agent: 'Researcher', type: 'reasoning', reasoning: researcherData.reasoning });
    onEvent({
      agent: 'Researcher',
      type: 'token',
      token: `Insights found: ${researcherData.insights.length}\nTrends surfaced: ${researcherData.trends.length}\nData points: ${researcherData.dataPoints.join('; ')}\n`,
    });
    onEvent({ agent: 'Researcher', type: 'status', status: 'done' });

    // 3. WRITER
    onEvent({ agent: 'Writer', type: 'status', status: 'running' });
    onEvent({ agent: 'Writer', type: 'token', token: '✍️ Drafting LinkedIn post, X thread, and blog outline...\n' });

    const writerPrompt = `Topic: "${plannerData.topicTitle}", Insights: ${JSON.stringify(
      researcherData.insights
    )}, Data Points: ${JSON.stringify(researcherData.dataPoints)}\nDraft a LinkedIn post, X thread (5-7 tweets), and structured blog outline. Return JSON matching WriterOutputSchema.`;
    const writerRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are the Multi-Format Copywriter Agent for CreatorOS.' },
        { role: 'user', content: writerPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const writerJson = JSON.parse(writerRes.choices[0]?.message?.content || '{}');
    const writerData = WriterOutputSchema.parse(writerJson);

    onEvent({ agent: 'Writer', type: 'reasoning', reasoning: writerData.reasoning });
    onEvent({
      agent: 'Writer',
      type: 'token',
      token: `Drafted LinkedIn post (${writerData.linkedinDraft.length} chars), Twitter thread (${writerData.twitterThreadDraft.length} tweets), and Blog outline (${writerData.blogOutlineDraft.sections.length} sections).\n`,
    });
    onEvent({ agent: 'Writer', type: 'status', status: 'done' });

    // 4. REVIEWER
    onEvent({ agent: 'Reviewer', type: 'status', status: 'running' });
    onEvent({ agent: 'Reviewer', type: 'token', token: '⚖️ Evaluating hook strength, clarity, readability, and virality...\n' });

    const reviewerPrompt = `Evaluate this LinkedIn post: "${writerData.linkedinDraft}" and X thread: "${writerData.twitterThreadDraft.join(' | ')}". Return JSON matching ReviewerOutputSchema.`;
    const reviewerRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are the Quality & Engagement Critic Agent for CreatorOS.' },
        { role: 'user', content: reviewerPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const reviewerJson = JSON.parse(reviewerRes.choices[0]?.message?.content || '{}');
    const reviewerData = ReviewerOutputSchema.parse(reviewerJson);

    onEvent({ agent: 'Reviewer', type: 'reasoning', reasoning: reviewerData.reasoning });
    onEvent({
      agent: 'Reviewer',
      type: 'token',
      token: `Hook Score: ${reviewerData.hookScore}/10 | Overall Score: ${reviewerData.overallScore}/10\nCritique: ${reviewerData.critiqueNotes.join('; ')}\nFixes required: ${reviewerData.actionableFixes.length}\n`,
    });
    onEvent({ agent: 'Reviewer', type: 'status', status: 'done' });

    // 5. IMPROVER
    onEvent({ agent: 'Improver', type: 'status', status: 'running' });
    onEvent({ agent: 'Improver', type: 'token', token: '⚡ Applying reviewer critique to polish and elevate output...\n' });

    const improverPrompt = `Original LinkedIn: "${writerData.linkedinDraft}"\nOriginal Tweets: ${JSON.stringify(
      writerData.twitterThreadDraft
    )}\nReviewer Fixes: ${JSON.stringify(reviewerData.actionableFixes)}\nApply all fixes to produce improved LinkedIn post, X thread, and blog outline. Return JSON matching ImproverOutputSchema.`;
    const improverRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are the Content Polish Engine Agent for CreatorOS.' },
        { role: 'user', content: improverPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const improverJson = JSON.parse(improverRes.choices[0]?.message?.content || '{}');
    const improverData = ImproverOutputSchema.parse(improverJson);

    onEvent({ agent: 'Improver', type: 'reasoning', reasoning: improverData.reasoning });
    onEvent({
      agent: 'Improver',
      type: 'token',
      token: `Improvements applied: ${improverData.improvementsMade.join('; ')}\nFinished redrafting.\n`,
    });
    onEvent({ agent: 'Improver', type: 'status', status: 'done' });

    // 6. PUBLISHER
    onEvent({ agent: 'Publisher', type: 'status', status: 'running' });
    onEvent({ agent: 'Publisher', type: 'token', token: '🎨 Generating image prompts, hashtag stack, and final package...\n' });

    const publisherPrompt = `Polished LinkedIn: "${improverData.improvedLinkedinPost}"\nGenerate final title, summary, 8 hashtags, Midjourney image prompt, and checklist. Return JSON matching PublisherOutputSchema.`;
    const publisherRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are the Asset & Hashtag Packager Agent for CreatorOS.' },
        { role: 'user', content: publisherPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const publisherJson = JSON.parse(publisherRes.choices[0]?.message?.content || '{}');
    const publisherData = PublisherOutputSchema.parse(publisherJson);

    onEvent({ agent: 'Publisher', type: 'reasoning', reasoning: publisherData.reasoning });
    onEvent({
      agent: 'Publisher',
      type: 'token',
      token: `Hashtags: ${publisherData.hashtags.join(' ')}\nImage Prompt: ${publisherData.imagePrompt.slice(0, 60)}...\nPackaging complete!\n`,
    });
    onEvent({ agent: 'Publisher', type: 'status', status: 'done' });

    // ASSEMBLE FINAL PACKAGE
    const finalPackage: ContentPackage = {
      title: publisherData.finalTitle || plannerData.topicTitle,
      summary: publisherData.executiveSummary || `Complete content package for ${goal}`,
      linkedinPost: improverData.improvedLinkedinPost,
      twitterThread: improverData.improvedTwitterThread,
      blogOutline: improverData.improvedBlogOutline,
      hashtags: publisherData.hashtags,
      imagePrompt: publisherData.imagePrompt,
      keyInsights: researcherData.insights,
      critiqueNotes: reviewerData.critiqueNotes,
      improvementsMade: improverData.improvementsMade,
    };

    onEvent({
      agent: 'Publisher',
      type: 'final_package',
      package: finalPackage,
    });
  } catch (err: any) {
    onEvent({
      agent: 'Planner',
      type: 'error',
      error: err?.message || 'Error executing agent pipeline',
    });
  }
}

async function runMockPipelineStream(
  goal: string,
  onEvent: (event: StreamEvent) => void
) {
  const mockData = generateMockContentPackage(goal);
  const agents: AgentName[] = ['Planner', 'Researcher', 'Writer', 'Reviewer', 'Improver', 'Publisher'];

  const agentOutputs: Record<AgentName, { output: string; reasoning: string }> = {
    Planner: mockData.planner,
    Researcher: mockData.researcher,
    Writer: mockData.writer,
    Reviewer: mockData.reviewer,
    Improver: mockData.improver,
    Publisher: mockData.publisher,
  };

  for (const agent of agents) {
    onEvent({ agent, type: 'status', status: 'running' });

    const { output, reasoning } = agentOutputs[agent];
    const lines = output.split('\n');

    for (const line of lines) {
      onEvent({ agent, type: 'token', token: line + '\n' });
      await delay(120);
    }

    onEvent({ agent, type: 'reasoning', reasoning });
    onEvent({ agent, type: 'status', status: 'done' });
    await delay(200);
  }

  onEvent({
    agent: 'Publisher',
    type: 'final_package',
    package: mockData.finalPackage,
  });
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
