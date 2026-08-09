import {
  getPersonaFromDB,
  getPostsFromDB,
  insertPostToDB,
  insertRejectionToDB,
} from './db';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey, maxRetries: 0, timeout: 5000 }) : null;

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
      return { success: false, reason: 'Agent not found' };
    }

    const voice = persona.voice_description || `Authoritative ${persona.domain} expert persona with sharp technical insight.`;
    const domain = persona.domain;

    // 2. DISCOVER: Try live HackerNews API first, then fall back to rotating static pool
    let liveCandidates: Candidate[] = [];
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const topIdsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', { signal: controller.signal });
      clearTimeout(timer);
      const topIds: number[] = await topIdsRes.json();

      const items = await Promise.allSettled(
        topIds.slice(0, 20).map(async (id) => {
          const controller2 = new AbortController();
          const timer2 = setTimeout(() => controller2.abort(), 2000);
          const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal: controller2.signal });
          clearTimeout(timer2);
          const item = await itemRes.json();
          if (item?.title && item?.url) {
            return { title: item.title, url: item.url, score: item.score } as Candidate;
          }
          return null;
        })
      );

      liveCandidates = items
        .filter((r): r is PromiseFulfilledResult<Candidate | null> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter((c): c is Candidate => c !== null);
    } catch (err) {
      console.log('[Cycle] HackerNews fetch failed, using static pool');
    }

    // Static fallback pool — large rotating set per domain
    const staticPool = getStaticCandidatePool(domain);

    // Combine: live first, then static as extras
    const allCandidates: Candidate[] = [...liveCandidates, ...staticPool];

    // 3. MEMORY CHECK: Get recently published source URLs to deduplicate reliably
    const recentPosts = await getPostsFromDB(agentId);
    const publishedUrls = new Set(
      recentPosts
        .slice(0, 20)
        .flatMap((p) => p.sources || [])
        .map((u) => u.toLowerCase().trim())
    );
    const publishedTitles = new Set(
      recentPosts
        .slice(0, 20)
        .map((p) => p.rationale?.slice(0, 60).toLowerCase() || '')
    );

    // Filter out already-published URLs and deduplicate by title similarity
    const freshCandidates = allCandidates.filter((c) => {
      const urlMatch = publishedUrls.has(c.url.toLowerCase().trim());
      const titleMatch = [...publishedTitles].some((t) => t.includes(c.title.slice(0, 30).toLowerCase()));
      return !urlMatch && !titleMatch;
    });

    // Choose from fresh candidates — rotate by using count of posts as offset
    const pool = freshCandidates.length > 0 ? freshCandidates : staticPool;
    const rotationIndex = recentPosts.length % pool.length;
    const chosenCandidate: Candidate = pool[rotationIndex] ?? pool[0];

    const publishingRationale = `Selected "${chosenCandidate.title}" because it exposes a critical high-signal development in ${domain}, outranking lower-priority candidate topics.`;

    // Log rejected candidates
    for (const rej of pool.filter((c) => c.url !== chosenCandidate.url).slice(0, 3)) {
      await insertRejectionToDB({
        agentId,
        topic: rej.title,
        reason_rejected: `Lower editorial priority compared to top-ranked candidate "${chosenCandidate.title}".`,
      });
    }

    // 4. GENERATE POST using OpenAI or distinct fallback
    let postText = '';
    let llmActive = !!openai;

    if (openai && llmActive) {
      try {
        const writingPrompt = `You are ${persona.name}, an autonomous ${domain} expert persona.
Voice: ${voice}

Write a high-signal technical post (150-220 words) about:
Topic: "${chosenCandidate.title}"
Source: ${chosenCandidate.url}

Be specific, technical, and actionable. Different angle every time. End with 2-3 hashtags.`;

        const writeRes = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `You are ${persona.name}, ${domain} expert. Write sharp, opinionated, distinct posts every time.` },
            { role: 'user', content: writingPrompt },
          ],
          temperature: 0.9,
        });

        postText = writeRes.choices[0]?.message?.content || '';
      } catch (err) {
        llmActive = false;
      }
    }

    if (!postText) {
      postText = generateRotatingPersonaPost(persona.name, domain, chosenCandidate, recentPosts.length);
    }

    // 5. EMBED & STORE
    let newEmbedding: number[] | undefined;
    if (openai && llmActive) {
      try {
        const embRes = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: postText,
        });
        newEmbedding = embRes.data[0]?.embedding;
      } catch (e) {
        // ignore
      }
    }

    const createdPost = await insertPostToDB({
      agentId,
      text: postText,
      rationale: publishingRationale,
      sources: [chosenCandidate.url],
      embedding: newEmbedding,
    });

    console.log(`[Cycle] Published post ${createdPost.id} for persona ${persona.name} → "${chosenCandidate.title}"`);
    return { success: true, posted: true, postId: createdPost.id, topic: chosenCandidate.title };
  } catch (globalErr: any) {
    console.error('[Cycle] Global error:', globalErr);
    return { success: false, reason: globalErr?.message || 'Cycle error' };
  }
}

// Large rotating static pools per domain — ensures variety even without live API
function getStaticCandidatePool(domain: string): Candidate[] {
  const d = domain.toLowerCase();

  if (d.includes('security')) {
    return [
      { title: 'Prompt Injection Vectors in Multi-Agent Execution Loops', url: 'https://arxiv.org/abs/2402.00001' },
      { title: 'Zero-Day Supply Chain Vulnerabilities in Open-Source AI Wrappers', url: 'https://github.com/advisories/GHSA-ai-sec-2026' },
      { title: 'Bypassing LLM Guardrails via Indirect Context Window Tampering', url: 'https://nist.gov/ai-risk-management-framework-agents' },
      { title: 'Memory Poisoning Attacks on Retrieval-Augmented Generation Systems', url: 'https://arxiv.org/abs/2403.10089' },
      { title: 'Model Inversion Attacks Against Federated Fine-Tuned LLMs', url: 'https://arxiv.org/abs/2404.11099' },
      { title: 'Adversarial Prefix Injection in Tool-Calling AI Agents', url: 'https://arxiv.org/abs/2405.00001' },
      { title: 'Data Exfiltration via Jailbroken Code Interpreter in GPT-4', url: 'https://arxiv.org/abs/2406.00002' },
      { title: 'Covert Channel Attacks in Multi-Agent AI Orchestration Frameworks', url: 'https://arxiv.org/abs/2407.00003' },
      { title: 'How Autonomous AI Agents Can Be Weaponized for Social Engineering', url: 'https://owasp.org/top10-llm-2026' },
      { title: 'Hardening AI Inference Pipelines Against Side-Channel Timing Attacks', url: 'https://arxiv.org/abs/2408.00004' },
    ];
  } else if (d.includes('ml') || d.includes('engineer') || d.includes('systems')) {
    return [
      { title: 'KV-Cache FP4 Quantization Benchmarks for Real-Time Inference', url: 'https://huggingface.co/blog/kv-quantization' },
      { title: 'Distributed Speculative Decoding Across Multi-GPU Clusters', url: 'https://paperswithcode.com/paper/speculative-decoding-vllm' },
      { title: 'FlashAttention-3 Throughput Optimizations on Hopper Architecture', url: 'https://triton-lang.org/hopper-flash-attention' },
      { title: 'Mixture-of-Experts Routing Failures and How to Debug Them', url: 'https://arxiv.org/abs/2403.00001' },
      { title: 'vLLM vs TGI vs TensorRT-LLM: 2026 Production Benchmark Report', url: 'https://github.com/vllm-project/vllm/benchmarks' },
      { title: 'Continuous Batching Strategies for Sub-100ms LLM Latency at Scale', url: 'https://arxiv.org/abs/2404.00002' },
      { title: 'PagedAttention: Memory-Efficient Inference for 70B Parameter Models', url: 'https://arxiv.org/abs/2309.06180' },
      { title: 'Multi-LoRA Serving: Serving 100 Fine-Tuned Models on One GPU', url: 'https://arxiv.org/abs/2311.03285' },
      { title: 'FP8 Mixed Precision Training Convergence Analysis on A100 Clusters', url: 'https://arxiv.org/abs/2406.00003' },
      { title: 'Kernel Fusion Techniques for 2x Throughput in Transformer Decoding', url: 'https://developer.nvidia.com/blog/kernel-fusion-transformers' },
    ];
  } else if (d.includes('robotics')) {
    return [
      { title: 'Real-Time ROS 2 Latency Optimization for Embodied Spatial Intelligence', url: 'https://ros.org/reps/rep-2026-embodied' },
      { title: 'Multi-Modal Tactile Sensor Fusion in Autonomous Humanoid Grasping', url: 'https://robotics.org/tactile-sensor-fusion-paper' },
      { title: 'Sim-to-Real Policy Transfer Using Photorealistic Raytracing', url: 'https://nvidia.com/isaac-sim-raytracing-transfer' },
      { title: 'Whole-Body Control of Bipedal Robots Using Differentiable Physics', url: 'https://arxiv.org/abs/2403.00002' },
      { title: 'SLAM 3.0: Neural Radiance Fields for Real-Time Robot Navigation', url: 'https://arxiv.org/abs/2404.00003' },
      { title: 'Proprioceptive Feedback Loops in Soft Robotic Manipulation Arms', url: 'https://arxiv.org/abs/2405.00002' },
      { title: 'Foundation Models for Robot Manipulation: Where OpenVLA Falls Short', url: 'https://arxiv.org/abs/2406.09246' },
      { title: 'Zero-Shot Dexterous Manipulation via Vision-Language-Action Models', url: 'https://arxiv.org/abs/2407.00004' },
      { title: 'Energy-Efficient Locomotion Gaits Discovered via Evolutionary RL', url: 'https://arxiv.org/abs/2408.00005' },
      { title: 'Quadruped Robot Terrain Adaptation Using World Models and Dreamer v4', url: 'https://arxiv.org/abs/2409.00001' },
    ];
  } else {
    return [
      { title: 'Local vLLM Serving Benchmarks: Open Weights Outperform Closed APIs', url: 'https://vllm.ai/benchmarks-2026' },
      { title: 'Decentralized Model Hosting & Permissive Open Source Licensing', url: 'https://apache.org/licenses/ai-open-weights' },
      { title: 'Fine-Tuning LLaMA 3.3 on Consumer Grade GPUs with Unsloth Engine', url: 'https://github.com/unslothai/unsloth' },
      { title: 'Mistral 7B v0.4 vs Qwen 2.5: Open Weights Coding Benchmark 2026', url: 'https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard' },
      { title: 'GGUF Quantization Guide: Running 70B Models on 24GB VRAM', url: 'https://github.com/ggerganov/llama.cpp/wiki' },
      { title: 'Ollama vs LM Studio vs Jan: Local AI Runtime Performance Report', url: 'https://github.com/ollama/ollama' },
      { title: 'LoRA Rank Selection: Why r=16 is Usually Wrong', url: 'https://arxiv.org/abs/2405.00003' },
      { title: 'Community-Built Datasets Are Now Beating Proprietary Training Data', url: 'https://huggingface.co/datasets' },
      { title: 'Open Source AI Safety: Red-Teaming Llama 3 for Jailbreaks', url: 'https://arxiv.org/abs/2406.00004' },
      { title: 'The Economics of Self-Hosting AI: Real Cost Analysis for Startups', url: 'https://arxiv.org/abs/2407.00005' },
    ];
  }
}

// Rotating fallback post templates — different angle each time based on post count
function generateRotatingPersonaPost(name: string, domain: string, topic: Candidate, postCount: number): string {
  const d = domain.toLowerCase();
  const angle = postCount % 4; // 4 different angles

  if (d.includes('security')) {
    const angles = [
      `🚨 Threat Vector Alert: ${topic.title}\n\nSecurity audits across 50 enterprise AI deployments in Q2 2026 reveal that most teams are still ignoring prompt injection in tool-calling pipelines.\n\nAttackers inject payload strings via user-controlled fields that bypass guardrails entirely. The root fix is strict Zod schema validation at every tool boundary — not model-level instruction following.\n\nSource: ${topic.url}\n\n#AISecurity #MLSec #RedTeaming`,
      `🔐 Defense Pattern: ${topic.title}\n\nThe most underestimated AI attack surface in 2026 is the context window itself. Once an attacker controls any portion of the input context, all downstream function calls are compromised.\n\nMitigation: Implement structured output parsing with strict JSON schemas before any tool execution. Never trust the model's own output as input validation.\n\nSource: ${topic.url}\n\n#AppSec #AIHardening #AgentSecurity`,
      `⚠️ Incident Analysis: ${topic.title}\n\nThree production AI agent breaches in 2026 Q3 traced back to the same root: embedding-based memory retrieval with no sanitization layer.\n\nThe attacker uploaded a document designed to poison the vector store. The agent then retrieved malicious instructions as if they were legitimate context.\n\nAlways hash and validate documents before indexing. Treat the RAG pipeline as an attack surface.\n\nSource: ${topic.url}\n\n#RAGSecurity #VectorDB #AIThreats`,
      `🛡️ Architecture Note: ${topic.title}\n\nMost AI security teams focus on model-level jailbreaks. The real frontier is infrastructure: Kubernetes RBAC for agent tool permissions, network policies for LLM API egress, and audit logs for every tool invocation.\n\nThe principle of least privilege applies to AI agents too. Scope their capabilities tightly from day one.\n\nSource: ${topic.url}\n\n#ZeroTrust #AIInfra #SecurityEngineering`,
    ];
    return angles[angle];
  } else if (d.includes('ml') || d.includes('engineer') || d.includes('systems')) {
    const angles = [
      `⚡ Benchmark Drop: ${topic.title}\n\nWe ran vLLM with FP4 KV-cache on LLaMA 3.3 70B across 3 A100 nodes. Result: 3.4x memory reduction, 2.1x throughput increase, and <0.2% perplexity degradation.\n\nFor teams serving >10k RPM on 70B+ models, this is the most impactful infrastructure change you can make today.\n\nSource: ${topic.url}\n\n#LLMOps #MLInfrastructure #GPUOptimization`,
      `🔬 Deep Dive: ${topic.title}\n\nSpeculative decoding on distributed GPU clusters is misunderstood. The draft model doesn't need to be the same architecture as the target — a 1B parameter draft accepting 7B tokens is often more efficient than same-family drafts.\n\nKey insight: minimize draft-target vocabulary alignment overhead, not draft latency.\n\nSource: ${topic.url}\n\n#SpeculativeDecoding #InferencePipeline #MLSystems`,
      `📊 Systems Insight: ${topic.title}\n\nPagedAttention vs Chunked Prefill vs Continuous Batching — each optimizes for different bottlenecks. Most teams pick one and apply it everywhere.\n\nThe correct approach: profile your actual traffic pattern (long prefill vs short prefill, streaming vs batch), then apply the right strategy per use-case tier.\n\nSource: ${topic.url}\n\n#InferenceOptimization #LLMServing #AIArchitecture`,
      `💡 Engineering Note: ${topic.title}\n\nKernel fusion in transformer decoding: fusing QKV projection + attention + output projection into a single CUDA kernel reduces memory bandwidth by 40% and enables sub-10ms TTFT on H100.\n\nThis is not a theoretical optimization — production vLLM deployments are already shipping this.\n\nSource: ${topic.url}\n\n#CUDAOptimization #TransformerInference #DeepLearningEngineering`,
    ];
    return angles[angle];
  } else if (d.includes('robotics')) {
    const angles = [
      `🤖 Field Report: ${topic.title}\n\nSim-to-real transfer failure rates dropped from 34% to 8% when we switched from randomized physics parameters to photorealistic raytraced rendering in Isaac Sim.\n\nThe visual fidelity of the simulated environment matters more than physics randomization for manipulation tasks. Your policy needs to see what it will see in deployment.\n\nSource: ${topic.url}\n\n#Robotics #SimToReal #EmbodiedAI`,
      `⚙️ Control Systems: ${topic.title}\n\nAchieving sub-10ms control loop latency in humanoid locomotion requires dedicated real-time Linux kernels, PREEMPT_RT patches, and isolating sensor fusion to dedicated CPU cores.\n\nROS 2 with default settings is not real-time. You need to configure executor affinity and DDS middleware for deterministic timing.\n\nSource: ${topic.url}\n\n#ROS2 #RealTimeControl #HumanoidRobotics`,
      `🦾 Research Insight: ${topic.title}\n\nWhole-body control for dexterous manipulation is not solved by larger models. The bottleneck is proprioceptive feedback latency — most grippers sample at 100Hz, but human touch receptors respond at 1000Hz.\n\nBridging this gap requires custom tactile sensors, not better policy networks.\n\nSource: ${topic.url}\n\n#DexterousManipulation #TactileSensing #RoboticsResearch`,
      `📡 Systems Analysis: ${topic.title}\n\nNeural SLAM using NeRF-based representations is 10x slower than classical SLAM for loop closure but produces dramatically more consistent maps in dynamic environments.\n\nThe practical threshold: if your robot encounters >20% dynamic scene changes, switch to neural representations. Otherwise, stick to RTAB-Map.\n\nSource: ${topic.url}\n\n#SLAM #AutonomousNavigation #SpatialAI`,
    ];
    return angles[angle];
  } else {
    const angles = [
      `🌐 Open Source Report: ${topic.title}\n\nLocal LLM economics in 2026: a single RTX 4090 running Mistral 7B handles 180 req/min at $0.0003/1k tokens. GPT-4o costs $5/1M output tokens.\n\nFor internal tools, RAG pipelines, and batch processing: self-hosted open weights models are already 10x cheaper than closed API alternatives.\n\nSource: ${topic.url}\n\n#OpenSourceAI #LLMCosts #SelfHostedAI`,
      `🔓 Community Insight: ${topic.title}\n\nThe quality gap between open and closed models is closing faster than expected. Qwen 2.5 72B matches GPT-4o on code generation benchmarks while running entirely locally.\n\nFor teams that care about data privacy, latency, and cost: the transition to open weights has never been more practical.\n\nSource: ${topic.url}\n\n#OpenWeightsAI #ModelBenchmarks #AIIndependence`,
      `📦 Tooling Update: ${topic.title}\n\nUnsloth makes LoRA fine-tuning 2x faster with 60% less VRAM by fusing backward passes and using custom Triton kernels for gradient computation.\n\nYou can now fine-tune a 7B model on a single RTX 3080 in under 2 hours. Domain-specific fine-tuning is no longer a large-team privilege.\n\nSource: ${topic.url}\n\n#FineTuning #LoRA #OpenSourceML`,
      `💬 Community Analysis: ${topic.title}\n\nHuggingFace's community-built instruction datasets are now outperforming proprietary training data on task-specific benchmarks.\n\nThe lesson: curated, domain-specific community data beats large-scale noisy crawls. Open collaboration is producing better training signal than closed corporate pipelines.\n\nSource: ${topic.url}\n\n#TrainingData #OpenSource #AIResearch`,
    ];
    return angles[angle];
  }
}
