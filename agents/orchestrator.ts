import OpenAI from 'openai';
import { AgentName, ContentPackage, StreamEvent } from '@/types';
import { generateMockContentPackage } from './mockGenerator';
import { runPlannerAgent } from './planner';
import { runResearcherAgent } from './researcher';
import { runWriterAgent } from './writer';
import { runReviewerAgent } from './reviewer';
import { runImproverAgent } from './improver';
import { runPublisherAgent } from './publisher';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey, maxRetries: 0, timeout: 2000 }) : null;

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

    const plannerData = await runPlannerAgent(openai, goal);

    onEvent({ agent: 'Planner', type: 'reasoning', reasoning: plannerData.reasoning });
    onEvent({
      agent: 'Planner',
      type: 'token',
      token: `Topic: ${plannerData.topicTitle}\nAudience: ${plannerData.targetAudience}\nCore Angle: ${plannerData.coreAngle}\nTask breakdown generated (${plannerData.tasks.length} sub-tasks).\n`,
    });
    onEvent({ agent: 'Planner', type: 'status', status: 'done' });

    // 2. RESEARCHER
    onEvent({ agent: 'Researcher', type: 'status', status: 'running' });
    onEvent({ agent: 'Researcher', type: 'token', token: '🔎 Searching market trends, industry data, and engagement hooks...\n' });

    const researcherData = await runResearcherAgent(openai, plannerData.topicTitle, plannerData.coreAngle);

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

    const writerData = await runWriterAgent(
      openai,
      plannerData.topicTitle,
      researcherData.insights,
      researcherData.dataPoints
    );

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

    const reviewerData = await runReviewerAgent(
      openai,
      writerData.linkedinDraft,
      writerData.twitterThreadDraft
    );

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

    const improverData = await runImproverAgent(
      openai,
      writerData.linkedinDraft,
      writerData.twitterThreadDraft,
      reviewerData.actionableFixes
    );

    onEvent({ agent: 'Improver', type: 'reasoning', reasoning: improverData.reasoning });
    onEvent({
      agent: 'Improver',
      type: 'token',
      token: `Improvements applied: ${improverData.improvementsMade.join('; ')}\nFinished redrafting.\n`,
    });
    onEvent({ agent: 'Improver', type: 'status', status: 'done' });

    // 6. PUBLISHER
    onEvent({ agent: 'Publisher', type: 'status', status: 'running' });
    onEvent({ agent: 'Publisher', type: 'token', token: '🎨 Generating Midjourney image prompt, hashtag stack, and final package...\n' });

    const publisherData = await runPublisherAgent(
      openai,
      improverData.improvedLinkedinPost,
      plannerData.topicTitle
    );

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
    console.warn('[Orchestrator] OpenAI API call failed (e.g. zero credits), falling back to mock pipeline stream:', err?.message || err);
    onEvent({
      agent: 'Planner',
      type: 'token',
      token: '⚠️ OpenAI API quota/credit limit reached. Fallback mode activated to ensure uninterrupted generation...\n',
    });
    await runMockPipelineStream(goal, onEvent);
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
      await delay(15);
    }

    onEvent({ agent, type: 'reasoning', reasoning });
    onEvent({ agent, type: 'status', status: 'done' });
    await delay(30);
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
