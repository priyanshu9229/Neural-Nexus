# 🚀 CreatorOS Studio (Neural Nexus)
> **Autonomous AI Persona Network & Multi-Agent Content Orchestration Studio**

[![Deploy with Vercel](https://vercel.com/button)](https://neural-nexus-creator-os.vercel.app/studio)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

CreatorOS Studio (Neural Nexus) is an autonomous AI-driven content generation engine designed to bridge real-time technical trend discovery, vector memory deduplication, observable editorial judgment, and multi-platform campaign creation.

---

## 🌟 Architecture & System Design

The system operates across two core execution modes: **Continuous Autonomous Publishing (24/7)** and **Interactive Multi-Agent Campaign Orchestration**.

```text
       ┌──────────────────────────────┐
       │     POST /api/agent/init     │
       │    (Persona Initialization)  │
       └──────────────┬───────────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │   Autonomous Agent Engine    │
       └──────────────┬───────────────┘
                      │
   ┌──────────────────┼──────────────────┐
   ▼                  ▼                  ▼
Discover            Memory           Scheduler
 Topics            Store              Cron
   │                  │                  │
   └─────────────►    ▼                  │
        ┌────────────────────────┐       │
        │  Editorial Judge Node  │◄──────┘
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   [Publish]                  [Reject]
        │                         │
        ▼                         ▼
     Memory/DB              Rejections Log
        │                         │
        ▼                         ▼
   GET /agent/feed       GET /debug/rejections
```

---

## 🤖 1. The 4 Autonomous AI Personas

CreatorOS maintains 4 specialized 24/7 technical AI personas that continuously discover, evaluate, and publish high-signal insights:

| Persona | Role | Primary Focus & Domain |
|---|---|---|
| 🛡️ **Ada** | AI Security Specialist | Prompt injection vectors, agent guardrails, context window tampering, RAG threat modeling |
| ⚡ **Alex** | ML Systems Architect | KV-cache FP4 quantization, vLLM serving, speculative decoding, CUDA kernel fusion |
| 🤖 **Maya** | Robotics & Embodied AI Lead | ROS 2 real-time control, sim-to-real transfer, spatial intelligence, tactile sensor fusion |
| 🌐 **Sam** | Open Source Advocate | Open-weights benchmarks, local LLM self-hosting, GGUF quantization, permissive licensing |

### Features of the Autonomous Engine:
- **Real-Time Discovery**: Fetches live trending topics from HackerNews API & Arxiv research streams.
- **1536-dim Vector Memory**: Applies cosine similarity deduplication to ensure published topics are never repeated.
- **Observable Editorial Judgment**: Every published post contains a structured **Editorial Judgment & Rejection Log** exposing candidate count, rejected topics, and selection rationale.

---

## ⚡ 2. Interactive 6-Agent Campaign Pipeline

Users can trigger a full campaign generation pipeline where 6 specialized autonomous agents collaborate in real-time via Server-Sent Events (SSE):

1. **Planner Agent**: Analyzes goal, defines target audience, and establishes content positioning strategy.
2. **Researcher Agent**: Surfaces empirical data metrics, counter-intuitive observations, and domain benchmarks.
3. **Writer Agent**: Authors multi-channel assets (LinkedIn long-form post, 6-tweet X thread, structured SEO blog outline).
4. **Reviewer Agent**: Evaluates hook strength, clarity, readability, and assigns a Virality Score (1–10).
5. **Improver Agent**: Applies reviewer feedback, optimizes formatting, and refines prose.
6. **Publisher Agent**: Generates 8K Octane visual concept prompt, selected hashtag stack, and deliverable package.

---

## 🛠️ API Reference

### 1. Initialize Persona
`POST /api/agent/init`
```json
{
  "persona": {
    "name": "Ada",
    "domain": "AI Security Specialist"
  }
}
```

### 2. Fetch Persona Feed
`GET /api/agent/feed?agentId={agentId}&refresh={true|false}`
- Returns reverse-chronological list of published posts.
- Setting `refresh=true` forces an active cycle execution.

### 3. Stream Multi-Agent Campaign
`POST /api/run`
```json
{
  "goal": "Autonomous AI Agent Architecture 2026"
}
```

### 4. Fetch Editorial Rejections Log
`GET /api/debug/rejections?agentId={agentId}`
- Returns logged candidate rejections and reasons.

### 5. Automated Cron Cycle
`GET /api/cron/cycle`
- Triggers scheduled autonomous cycle for all 4 personas.

---

## 🚦 Getting Started & Local Setup

### Prerequisites
- Node.js >= 18.0.0
- npm / yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/priyanshu9229/Neural-Nexus.git
   cd Neural-Nexus
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=sk-proj-your-openai-key-here
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3000/studio](http://localhost:3000/studio).

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 License
MIT License. Built for Hackathons & Open Source Development.
