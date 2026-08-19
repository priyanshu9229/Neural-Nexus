'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Bot, Zap, CheckCircle2, Cpu, Database, Activity, Code2, Layers, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="space-y-16 py-6">
      {/* HERO SECTION */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>14,200+ Autonomous Cycles Executed • Sub-12s Execution Engine</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
        >
          The Autonomous Content Engine for <span className="gradient-text">High-Growth Creators</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          Enter a single objective like <span className="text-indigo-300 font-semibold italic">"AI in healthcare diagnostics"</span> — 6 specialized AI agents research market data, critique hooks, revise copy, and package ready-to-publish campaigns.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Link
            href="/studio"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            Launch CreatorOS Studio
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/results"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel-interactive text-gray-300 hover:text-white text-sm font-medium flex items-center justify-center gap-2 border border-white/10"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            View Deliverables Package
          </Link>
        </motion.div>
      </section>

      {/* ASYMMETRIC BENTO BOX SHOWCASE GRID */}
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-gray-400">Architectural System Overview</h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Multi-Agent Pipeline
          </span>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Bento Box 1: 6-Agent Sequential Pipeline (Col-span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 rounded-3xl glass-panel p-6 border border-white/10 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Bot className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">6-Agent Sequential Workflow</h3>
                  <p className="text-xs text-gray-400">Autonomous planning, research, drafting & critique loop</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                0 Human Prompts Needed
              </span>
            </div>

            {/* Micro Flow Visualizer */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {[
                { step: '01', name: 'Planner', action: 'Deconstructs Goal' },
                { step: '02', name: 'Researcher', action: 'Extracts Real Trends' },
                { step: '03', name: 'Writer', action: 'Drafts Multi-Format' },
                { step: '04', name: 'Reviewer', action: 'Scores & Critiques' },
                { step: '05', name: 'Improver', action: 'Polishes Weak Points' },
                { step: '06', name: 'Publisher', action: 'Packages Assets' },
              ].map((a) => (
                <div key={a.step} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 hover:border-purple-500/40 transition-colors">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-purple-400 font-bold">STEP {a.step}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-white">{a.name}</h4>
                  <p className="text-[10px] text-gray-400">{a.action}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bento Box 2: Vector Memory & Deduplication (Col-span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl glass-panel p-6 border border-white/10 space-y-4"
          >
            <div className="space-y-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Smart Anti-Repetition Engine</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Automatically checks memory history to guarantee 100% fresh, non-repetitive campaign ideas.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Content Integrity:</span>
                <span className="text-emerald-400 font-bold">100% Unique Ideas</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Duplicate Shield:</span>
                <span className="text-cyan-400">Zero Repeated Hooks</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Box 3: 24/7 Autonomous Daemon (Col-span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-3xl glass-panel p-6 border border-white/10 space-y-4"
          >
            <div className="space-y-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">24/7 Persona Daemon</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                4 autonomous persona daemons (Ada, Alex, Maya, Sam) continuous market monitoring.
              </p>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {['Ada (Security)', 'Alex (ML Infra)', 'Maya (Robotics)', 'Sam (Open Source)'].map((name) => (
                <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-gray-300">{name}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bento Box 4: Self-Critique Quality Engine (Col-span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-3xl glass-panel p-6 border border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    Self-Critique Quality Engine
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-normal">
                      Demo Preview
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Reviewer scores engagement before final export</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                9.4/10 Quality Score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Sample Reviewer Log (AI Critique)</span>
                <p className="text-gray-300 italic">"Hook is strong, but second paragraph needs statistical validation regarding GPU throughput."</p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Sample Improver Log (AI Resolution)</span>
                <p className="text-gray-300">"Added vLLM FP4 3.4x memory reduction benchmark to substantiate paragraph 2 claim."</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* CTA FOOTER CARD */}
      <section className="glass-panel p-8 rounded-3xl max-w-6xl mx-auto border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-black/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Ready to Experience Autonomous Content Generation?</h3>
          <p className="text-xs text-gray-400 mt-1">Generate complete campaigns for LinkedIn, X (Twitter), and Blogs with 1 click.</p>
        </div>

        <Link
          href="/studio"
          className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
        >
          <Zap className="w-4 h-4 fill-current text-amber-300" />
          Start Creating Free
        </Link>
      </section>
    </div>
  );
}
