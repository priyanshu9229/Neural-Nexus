import { z } from 'zod';

export const PlannerOutputSchema = z.object({
  topicTitle: z.string(),
  targetAudience: z.string(),
  coreAngle: z.string(),
  tasks: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      assignedAgent: z.string(),
      description: z.string(),
    })
  ),
  reasoning: z.string(),
});

export const ResearcherOutputSchema = z.object({
  insights: z.array(z.string()),
  trends: z.array(z.string()),
  dataPoints: z.array(z.string()),
  keyHooks: z.array(z.string()),
  reasoning: z.string(),
});

export const WriterOutputSchema = z.object({
  linkedinDraft: z.string(),
  twitterThreadDraft: z.array(z.string()),
  blogOutlineDraft: z.object({
    title: z.string(),
    targetAudience: z.string(),
    sections: z.array(
      z.object({
        heading: z.string(),
        points: z.array(z.string()),
      })
    ),
  }),
  reasoning: z.string(),
});

export const ReviewerOutputSchema = z.object({
  hookScore: z.number().min(1).max(10),
  clarityScore: z.number().min(1).max(10),
  engagementScore: z.number().min(1).max(10),
  overallScore: z.number().min(1).max(10),
  strengths: z.array(z.string()),
  critiqueNotes: z.array(z.string()),
  actionableFixes: z.array(z.string()),
  reasoning: z.string(),
});

export const ImproverOutputSchema = z.object({
  improvedLinkedinPost: z.string(),
  improvedTwitterThread: z.array(z.string()),
  improvedBlogOutline: z.object({
    title: z.string(),
    targetAudience: z.string(),
    sections: z.array(
      z.object({
        heading: z.string(),
        points: z.array(z.string()),
      })
    ),
  }),
  improvementsMade: z.array(z.string()),
  reasoning: z.string(),
});

export const PublisherOutputSchema = z.object({
  finalTitle: z.string(),
  executiveSummary: z.string(),
  hashtags: z.array(z.string()),
  imagePrompt: z.string(),
  publishingChecklist: z.array(z.string()),
  reasoning: z.string(),
});
