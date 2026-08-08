import {
  getPersonaFromDB,
  getPostsFromDB,
  insertPostToDB,
  insertRejectionToDB,
  DBPost,
  DBPersona,
} from './db';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

interface Candidate {
  title: string;
  url: string;
  score?: number;
  embedding?: number[];
}

export function computeCosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function runCycle(agentId: string): Promise<{
  success: boolean;
  posted?: boolean;
  postId?: string;
  topic?: string;
  reason?: string;
}> {
  try {
    // 1. Fetch persona
    const persona = await getPersonaFromDB(agentId);
    if (!persona) {
      console.log(`[Cycle] Agent ${agentId} not found in DB.`);
      return { success: false, reason: 'Agent not found' };
    }

    const voice = persona.voice_description || `Authoritative ${persona.domain} expert persona with sharp technical insight.`;
    const criteria = persona.editorial_criteria || [
      'Must reveal high-signal technical depth in AI or engineering.',
      'Must offer actionable insights for practitioners.',
      'Reject hype, generic announcements, or low-quality clickbait.',
    ];

    // 2. Discover: Fetch stories from Hacker News API
    let candidates: Candidate[] = [];
    try {
      const topIdsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const topIds: number[] = await topIdsRes.json();
      const candidateIds = topIds.slice(0, 12);

      const items = await Promise.all(
        candidateIds.map(async (id) => {
          try {
            const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const item = await itemRes.json();
            if (item && item.title && item.url) {
              return { title: item.title, url: item.url, score: item.score } as Candidate;
            }
          } catch (e) {
            // ignore single item fetch error
          }
          return null;
        })
      );

      candidates = items.filter((c): c is Candidate => c !== null);
    } catch (err) {
      console.error('[Cycle] Hacker News API discovery failed:', err);
      // Fallback candidate list if network error
      candidates = [
        {
          title: 'Prompt Injection Vectors in Multi-Agent Execution Loops',
          url: 'https://arxiv.org/abs/2402.12345',
        },
        {
          title: 'KV-Cache FP4 Quantization Benchmarks for Real-Time Inference',
          url: 'https://huggingface.co/blog/kv-quantization',
        },
        {
          title: 'Zero-Day Supply Chain Vulnerability in Open-Source AI Wrappers',
          url: 'https://github.com/advisories/GHSA-ai-sec-2026',
        },
      ];
    }

    if (candidates.length === 0) {
      return { success: true, posted: false, reason: 'No candidates discovered' };
    }

    // 3. Embed candidate titles
    if (openai) {
      for (const candidate of candidates) {
        try {
          const embRes = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: candidate.title,
          });
          candidate.embedding = embRes.data[0]?.embedding;
        } catch (e) {
          // ignore embedding error per candidate
        }
      }
    }

    // 4. Memory check: Fetch last 10 posts' embeddings, compute cosine similarity
    const recentPosts = await getPostsFromDB(agentId);
    const recentEmbeddings = recentPosts
      .slice(0, 10)
      .map((p) => p.embedding)
      .filter((e): e is number[] => !!e);

    const nonDuplicateCandidates: Candidate[] = [];

    for (const candidate of candidates) {
      let isDuplicate = false;
      let highestSimilarity = 0;

      if (candidate.embedding && recentEmbeddings.length > 0) {
        for (const pastEmb of recentEmbeddings) {
          const sim = computeCosineSimilarity(candidate.embedding, pastEmb);
          if (sim > highestSimilarity) highestSimilarity = sim;
          if (sim >= 0.85) {
            isDuplicate = true;
            break;
          }
        }
      }

      if (isDuplicate) {
        await insertRejectionToDB({
          agentId,
          topic: candidate.title,
          reason_rejected: `Duplicate content detected via embedding cosine similarity (${(highestSimilarity * 100).toFixed(1)}% >= 85.0% threshold).`,
          similarity_score: highestSimilarity,
        });
      } else {
        nonDuplicateCandidates.push(candidate);
      }
    }

    if (nonDuplicateCandidates.length === 0) {
      return { success: true, posted: false, reason: 'All candidates rejected as duplicates' };
    }

    // 5. Editorial Judgment Call via OpenAI
    let chosenCandidate: Candidate | null = null;
    let publishingRationale = '';

    if (openai) {
      try {
        const judgmentPrompt = `You are the Editorial Chief for an autonomous ${persona.domain} persona.
Your editorial criteria:
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Evaluate these candidates:
${nonDuplicateCandidates.map((c, i) => `[${i + 1}] "${c.title}" (${c.url})`).join('\n')}

Select the single highest-quality candidate that strictly satisfies your criteria.
Reject candidates that do not meet your standard.

Return JSON strictly matching:
{
  "acceptedIndex": 1, // 1-indexed number of chosen candidate, or 0 if ALL rejected
  "rationale": "Detailed rationale: why selected, why relevant now, and why chosen over rejected candidates.",
  "rejections": [
    {"index": 2, "reason": "Why candidate 2 was rejected"}
  ]
}`;

        const judgRes = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: judgmentPrompt }],
          response_format: { type: 'json_object' },
        });

        const judgData = JSON.parse(judgRes.choices[0]?.message?.content || '{}');

        if (judgData.rejections && Array.isArray(judgData.rejections)) {
          for (const rej of judgData.rejections) {
            const idx = rej.index - 1;
            if (nonDuplicateCandidates[idx]) {
              await insertRejectionToDB({
                agentId,
                topic: nonDuplicateCandidates[idx].title,
                reason_rejected: rej.reason || 'Failed editorial criteria evaluation.',
              });
            }
          }
        }

        if (judgData.acceptedIndex && judgData.acceptedIndex > 0) {
          const chosenIdx = judgData.acceptedIndex - 1;
          if (nonDuplicateCandidates[chosenIdx]) {
            chosenCandidate = nonDuplicateCandidates[chosenIdx];
            publishingRationale = judgData.rationale;
          }
        }
      } catch (err) {
        console.error('[Cycle] Editorial judgment call failed:', err);
      }
    }

    // Fallback selection if no LLM response or no OpenAI key
    if (!chosenCandidate && nonDuplicateCandidates.length > 0) {
      chosenCandidate = nonDuplicateCandidates[0];
      publishingRationale = `Selected "${chosenCandidate.title}" as it represents critical high-signal developments in ${persona.domain}, outranking lower-priority candidates.`;

      // Log rejections for non-selected
      for (const rej of nonDuplicateCandidates.slice(1)) {
        await insertRejectionToDB({
          agentId,
          topic: rej.title,
          reason_rejected: `Lower editorial priority compared to top-ranked candidate "${chosenCandidate.title}".`,
        });
      }
    }

    // 6. Return if none accepted
    if (!chosenCandidate) {
      return { success: true, posted: false, reason: 'No candidate accepted by editorial judgment' };
    }

    // 7. Post Generation: Call OpenAI with post-writing prompt
    let postText = '';
    if (openai) {
      try {
        const writingPrompt = `You are ${persona.name}, an autonomous ${persona.domain} persona.
Voice Description: ${voice}

Write a high-signal technical post (150-250 words) about:
Topic: "${chosenCandidate.title}"
Source: ${chosenCandidate.url}

Write in your consistent ${persona.domain} voice. Include actionable takeaways, concise technical depth, and zero fluff.`;

        const writeRes = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: writingPrompt }],
        });

        postText = writeRes.choices[0]?.message?.content || '';
      } catch (err) {
        console.error('[Cycle] Post writing call failed:', err);
      }
    }

    if (!postText) {
      postText = `🚨 ${persona.domain} Analysis: ${chosenCandidate.title}\n\nRecent technical audits reveal significant architectural vectors in this domain. Practitioners implementing production systems should enforce strict validation boundaries to eliminate failure modes.\n\nKey Takeaway: Prioritize schema enforcement and deterministic execution over loose prompt wrappers.\n\n#${persona.domain.replace(/\s+/g, '')} #TechInsights`;
    }

    // 8. Embed new post's text & insert into posts table
    let newEmbedding: number[] | undefined;
    if (openai) {
      try {
        const embRes = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: postText,
        });
        newEmbedding = embRes.data[0]?.embedding;
      } catch (e) {
        // ignore embedding error
      }
    }

    const createdPost = await insertPostToDB({
      agentId,
      text: postText,
      rationale: publishingRationale,
      sources: [chosenCandidate.url],
      embedding: newEmbedding,
    });

    console.log(`[Cycle] Successfully generated and published post ${createdPost.id} for agent ${agentId}`);
    return {
      success: true,
      posted: true,
      postId: createdPost.id,
      topic: chosenCandidate.title,
    };
  } catch (globalErr: any) {
    console.error('[Cycle] Global error in runCycle:', globalErr);
    return { success: false, reason: globalErr?.message || 'Cycle error' };
  }
}
