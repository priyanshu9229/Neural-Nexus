# PROMPTS.md — Authentic AI Development & Prompt Log

This document records key AI prompts, architectural decisions, and iteration history during the development of **CreatorOS**.

---

## Prompt 1 — Project Initialization & Architecture Blueprint

**Goal:** Establish project vision, tech stack, multi-agent workflow architecture, and 2-phase execution plan.

**Rationale:** Needed a clear blueprint outlining the 6 specialized agents, data flow, UI requirements, and judging criteria alignment before writing code.

**Prompt Used:**
> "Design an autonomous AI content studio named CreatorOS. It should take a single goal input and run 6 agents: Planner, Researcher, Writer, Reviewer, Improver, Publisher. Define Next.js 15 app router structure, Zustand state, design tokens, and SSE streaming pipeline."

**Outcome:** Created `implementation_plan.md` and initial `README.md` defining the dark glassmorphic UI, agent responsibilities, and stream-based architecture.

---

## Prompt 2 — UI Shell & Glassmorphic Design System

**Goal:** Build modern landing page and live studio execution dashboard with smooth animations.

**Rationale:** Judges will review the UI execution first. Needed high visual polish with gradient borders, status indicators, and live activity feeds.

**Prompt Used:**
> "Create Next.js 15 components for CreatorOS using Tailwind CSS and Framer Motion: Landing page hero with animated gradient badges, Studio layout with active agent steppers, live terminal output feed, and tabbed final content cards."

**Outcome:** Implemented `app/page.tsx`, `app/studio/page.tsx`, `AgentPipeline`, `AgentLiveFeed`, `ReasoningPanel`, and `OutputWorkspace`.

---

## Prompt 3 — Agent System Prompts & Zod Schemas

**Goal:** Design precise system prompts for all 6 agents to ensure structured, high-quality content generation.

**Rationale:** Autonomous agents must produce predictable, parsable outputs. Loose prompts lead to malformed JSON or inconsistent tone.

**Prompt Used:**
> "Write system prompts and Zod schemas for 6 agents: Planner (breaks goal into subtasks), Researcher (surfaces insights/trends), Writer (drafts LinkedIn/Twitter/Blog), Reviewer (critiques content), Improver (applies feedback), and Publisher (generates hashtags & image prompts)."

**Outcome:** Created prompt templates in `prompts/` and Zod output schemas in `lib/schemas.ts`.

---

## Prompt 4 — Server-Sent Events (SSE) Orchestrator

**Goal:** Build streaming backend endpoint `app/api/run/route.ts` that chains 6 OpenAI model calls and streams real-time progress to the frontend.

**Rationale:** Users need immediate visual feedback while agents execute. SSE provides low-latency token streaming without complex WebSocket infrastructure.

**Prompt Used:**
> "Implement a Next.js App Router route handler for GET/POST /api/run that executes 6 agents sequentially using OpenAI Chat Completions streaming, yielding SSE events for token streams, status updates, and reasoning explanations."

**Outcome:** Created `app/api/run/route.ts` and `agents/orchestrator.ts`.

---

## Prompt 5 — Transparency Reasoning Panel ("Why I Made This Decision")

**Goal:** Surface the AI's internal decision-making process for every completed agent task.

**Rationale:** Making autonomous reasoning visible transforms a black-box generator into an interpretable AI assistant.

**Prompt Used:**
> "Enhance each agent prompt to output a 'reasoning' field explaining why specific structural, stylistic, or topical choices were made. Render this in an expandable accordion on each AgentCard."

**Outcome:** Built `ReasoningPanel.tsx` showing actionable agent decisions during demo runs.
