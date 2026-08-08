import { ContentPackage } from '@/types';

export function generateMockContentPackage(goal: string): {
  planner: { output: string; reasoning: string };
  researcher: { output: string; reasoning: string };
  writer: { output: string; reasoning: string };
  reviewer: { output: string; reasoning: string };
  improver: { output: string; reasoning: string };
  publisher: { output: string; reasoning: string };
  finalPackage: ContentPackage;
} {
  const cleanGoal = goal.trim() || 'AI in Healthcare';
  const topic = cleanGoal.replace(/^(create|make|write|generate)\s+/i, '');

  const plannerReasoning = `Selected a high-contrast thesis angle on '${topic}' to maximize LinkedIn comment velocity and X bookmarking. Divided execution into 5 specialized sub-tasks prioritizing statistical proof and actionable takeaways.`;

  const researcherReasoning = `Cross-referenced top 10 trending discussions on '${topic}'. Surfaced 3 counter-intuitive metrics to anchor the hook, ensuring maximum credibility among senior decision-makers.`;

  const writerReasoning = `Adopted a 'Problem → Shock Metric → Solution → Takeaway' framework for LinkedIn, and a 6-tweet narrative arc for X starting with a strong pattern-interrupt line.`;

  const reviewerReasoning = `Evaluated initial draft at 8.4/10 overall. Increased Hook Score from 7 to 9 by removing passive intro phrases and shortening the first paragraph to under 12 words.`;

  const improverReasoning = `Applied all 3 Reviewer critique points: added bold visual breaks, inserted concrete data metrics into Tweet 3, and tightened the blog H2 headings for SEO.`;

  const publisherReasoning = `Designed a futuristic glassmorphic image prompt with 8K Octane Render lighting and selected a 10-tag hashtag stack targeting both high-volume and niche industry keywords.`;

  const linkedinPost = `The biggest revolution in ${topic} isn't coming in 5 years.

It's happening right now in production systems across top global enterprises.

Here are 3 counter-intuitive observations most leaders are missing:

1. **Automation isn't replacing talent—it's elevating bandwidth.**
Teams implementing AI workflows report a 4.2x increase in throughput without increasing headcount.

2. **The leverage gap is widening fast.**
Companies adopting domain-specific AI models are out-pacing legacy competitors by 68% in speed-to-market.

3. **Data hygiene is the ultimate moat.**
Models are cheap; proprietary contextual data pipelines are priceless.

---

💡 **Key Takeaway:**
Don't wait for permission to modernize. Start by automating your highest-friction internal workflow today.

What's your team's biggest bottleneck right now? Drop a comment below 👇

#${topic.replace(/\s+/g, '')} #FutureOfWork #Innovation #AIStrategy`;

  const twitterThread = [
    `90% of leaders are looking at ${topic} the wrong way.\n\nHere is what the top 1% are actually building in 2026 🧵👇`,
    `1/ The Shift:\n\nWe moved from simple prompt wrappers to autonomous multi-agent pipelines.\n\nInstead of 1 prompt doing everything poorly, 6 micro-agents collaborate with specialized roles.`,
    `2/ The Metric:\n\nInternal benchmark tests show multi-agent systems increase output quality by 310% while reducing hallucination rates to near zero.`,
    `3/ The Architecture:\n\nPlanner ➔ Researcher ➔ Writer ➔ Reviewer ➔ Improver ➔ Publisher.\n\nSelf-critique loop is the secret sauce.`,
    `4/ Actionable Step:\n\nAudit your daily workflows today. Map out every step that can be automated with an agentic pipeline.`,
    `5/ If you found this valuable:\n\n1. Follow for daily insights on ${topic}\n2. Repost the first tweet below to share with your network 🔁`
  ];

  const blogOutline = {
    title: `The Definitive Guide to ${topic}: Strategies, Frameworks & Future Trends`,
    targetAudience: `Founders, Executives, Product Leaders, and AI Engineers`,
    sections: [
      {
        heading: `1. Executive Summary & Market Landscape`,
        points: [
          `Current state of ${topic} adoption across Fortune 500 companies`,
          `Key economic drivers accelerating shift toward autonomous automation`,
        ],
      },
      {
        heading: `2. Strategic Multi-Agent Frameworks`,
        points: [
          `Deconstructing the Planner-Researcher-Critic architecture`,
          `Ensuring deterministic schema validation with Zod and TypeScript`,
        ],
      },
      {
        heading: `3. Measuring Impact & ROI Metrics`,
        points: [
          `Throughput velocity vs. quality control benchmarks`,
          `Cost-per-generation analysis vs. traditional content operations`,
        ],
      },
      {
        heading: `4. Implementation Roadmap for 2026 & Beyond`,
        points: [
          `Phase 1: Internal workflow discovery and schema design`,
          `Phase 2: Continuous evaluation and human-in-the-loop review`,
        ],
      },
    ],
  };

  const hashtags = [
    `#${topic.replace(/\s+/g, '')}`,
    '#AIAutomation',
    '#ContentStrategy',
    '#ProductivityHack',
    '#DigitalTransformation',
    '#FutureOfTech',
    '#TechTrends2026',
    '#Leadership',
  ];

  const imagePrompt = `Hyper-realistic 3D isometric render representing ${topic}, futuristic digital workspace glowing with cyan and neon purple glassmorphism nodes, volumetric cinematic studio lighting, Octane render 8K resolution, elegant dark background, ultra-detailed --ar 16:9 --v 6.0`;

  const finalPackage: ContentPackage = {
    title: `Autonomous Content Suite: ${topic}`,
    summary: `Complete 5-asset distribution package created for "${cleanGoal}" using a 6-agent autonomous self-critiquing loop.`,
    linkedinPost,
    twitterThread,
    blogOutline,
    hashtags,
    imagePrompt,
    keyInsights: [
      `Throughput velocity increases by 4.2x with specialized agent loops.`,
      `Multi-format distribution across LinkedIn, X, and Blog amplifies reach by 380%.`,
      `Self-critique loops eliminate tone inconsistency and formatting errors.`,
    ],
    critiqueNotes: [
      `Original draft hook was slightly generic; revised to a bold pattern-interrupt statement.`,
      `Added white space line breaks for high mobile readability.`,
      `Inserted actionable 3-part bullet structure to boost bookmark rates.`,
    ],
    improvementsMade: [
      `Elevated overall hook score from 7.4/10 to 9.2/10.`,
      `Added Midjourney v6 photorealistic visual asset prompt.`,
      `Included multi-tier hashtag stack targeting high-volume keywords.`,
    ],
  };

  return {
    planner: {
      output: `[PLANNER AGENT OUTPUT]\nTopic Title: ${topic}\nTarget Audience: Business Leaders & Creators\nCore Hook Angle: Counter-Intuitive Production Metrics\nTasks:\n1. [Researcher] Extract top 3 industry statistics for ${topic}\n2. [Writer] Draft LinkedIn post, 6-tweet thread & blog outline\n3. [Reviewer] Score readability, hook strength & virality\n4. [Improver] Apply critique to double engagement rate\n5. [Publisher] Package final assets, hashtags & Midjourney prompt`,
      reasoning: plannerReasoning,
    },
    researcher: {
      output: `[RESEARCHER AGENT OUTPUT]\nSurfaced Insights:\n• 84% of creators spend >4 hours per multi-format post manually.\n• Posts starting with counter-intuitive metrics have 2.8x higher engagement.\n• Multi-agent workflows reduce content production time from 4h to 45 seconds.\nKey Hooks Identified:\n- "90% of leaders are looking at ${topic} wrong."\n- "The leverage gap is widening fast."`,
      reasoning: researcherReasoning,
    },
    writer: {
      output: `[WRITER AGENT OUTPUT]\nGenerated initial drafts:\n- LinkedIn Post (310 words)\n- X Thread (6 tweets)\n- Blog Outline (4 H2 sections)`,
      reasoning: writerReasoning,
    },
    reviewer: {
      output: `[REVIEWER AGENT OUTPUT]\nScores:\nHook: 8/10 | Clarity: 9/10 | Engagement: 7/10 | Overall: 8/10\nCritique:\n- Increase line spacing on LinkedIn draft for mobile readers.\n- Make Tweet #1 more punchy to improve thread drop-off rate.`,
      reasoning: reviewerReasoning,
    },
    improver: {
      output: `[IMPROVER AGENT OUTPUT]\nApplied Reviewer feedback:\n- Redrafted LinkedIn hook into a 12-word punchy sentence.\n- Added visual bullet structure & bold metrics.\n- Enhanced blog headings with target SEO keywords.`,
      reasoning: improverReasoning,
    },
    publisher: {
      output: `[PUBLISHER AGENT OUTPUT]\nFinalized package:\n- Curated 8 strategic hashtags\n- Crafted Midjourney v6 Photorealistic Image Prompt\n- Generated executive summary & export payload`,
      reasoning: publisherReasoning,
    },
    finalPackage,
  };
}
