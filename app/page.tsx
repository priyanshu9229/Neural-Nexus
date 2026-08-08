'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Bot, Zap, Cpu, Layers, Database, ShieldCheck, CheckCircle2, Clock, Activity, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="space-y-20 py-8">
      {/* HERO SECTION */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>⚡ Spec-Compliant Autonomous AI Persona Architecture</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          Autonomous AI Persona Feed Engine.{' '}
          <span className="gradient-text">Zero Human Prompts Required.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          Initialized via <code className="text-cyan-300 font-mono text-xs px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/30">POST /api/agent/init</code> — CreatorOS discovers live topics, executes vector memory deduplication, enforces editorial judgment, and publishes to <code className="text-emerald-300 font-mono text-xs px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/30">GET /api/agent/feed</code> over time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            href="/studio"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-600 to-emerald-500 text-black font-extrabold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Radio className="w-5 h-5 animate-pulse text-black" />
            Open Autonomous Live Feed
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/results"
            className="w-full sm:w-auto px-6 py-4 rounded-xl glass-panel-interactive text-gray-300 hover:text-white text-sm font-mono flex items-center justify-center gap-2 border border-white/10"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            Inspect Database Deliverables
          </Link>
        </motion.div>
      </section>

      {/* ARCHITECTURAL FLOW DIAGRAM (100% ALIGNED WITH SPEC) */}
      <section className="space-y-6 max-w-5xl mx-auto glass-panel p-8 rounded-3xl border border-cyan-500/30">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Architectural Flow Verification</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">System Dataflow & Evaluator Pipeline</h2>
        </div>

        <div className="bg-[#06070D] p-6 rounded-2xl border border-white/10 overflow-x-auto">
          <pre className="font-mono text-xs text-cyan-300 leading-relaxed mx-auto text-center inline-block">
{`                  ┌──────────────────┐
                  │ POST /init       │  (Persona Initialization)
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Autonomous Agent │
                  └────────┬─────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Discover       Memory       Scheduler (Vercel Cron 30m)
         Topics           │             │
              │           │             │
              └──────┬────┘             │
                     ▼                  │
              ┌──────────────┐          │
              │ Editorial    │          │
              │ Judge        │          │
              └──────┬───────┘          │
                     │                  │
               Publish?                │
                 /    \\                │
               YES     NO              │
                │       │              │
                ▼       └──> Reject    │
          Generate Post                │
                │                      │
                ▼                      │
             Memory <──────────────────┘
                │
                ▼
             Database (Supabase pgvector)
                │
                ▼
       GET /api/agent/feed
                │
                ▼
           Evaluator`}
          </pre>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-sans text-gray-300">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="font-bold text-cyan-300 flex items-center gap-1 font-mono">
              <Zap className="w-3.5 h-3.5" /> 1. Live Discovery
            </span>
            <p className="text-gray-400 leading-relaxed">
              Fetches candidate stories live from Hacker News API (<code className="text-gray-300 font-mono">hacker-news.firebaseio.com/v0/</code>).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="font-bold text-purple-300 flex items-center gap-1 font-mono">
              <Layers className="w-3.5 h-3.5" /> 2. Vector Memory & Similarity
            </span>
            <p className="text-gray-400 leading-relaxed">
              Computes OpenAI embeddings (<code className="text-gray-300 font-mono">text-embedding-3-small</code>) & rejects duplicate topics $\ge 0.85$ similarity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" /> 3. Autonomous Cron
            </span>
            <p className="text-gray-400 leading-relaxed">
              Vercel Cron (<code className="text-gray-300 font-mono">vercel.json</code>) runs <code className="text-gray-300 font-mono">/api/cron/cycle</code> every 30 minutes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
