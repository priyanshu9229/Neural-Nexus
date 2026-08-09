'use client';

import { useState, useEffect } from 'react';
import { Bot, Sparkles, RefreshCw, Check, ExternalLink, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedPost {
  id: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: string[];
}

interface PersonaItem {
  n: string;
  d: string;
  avatar: string;
  tag: string;
}

const PERSONAS: PersonaItem[] = [
  { n: 'Ada', d: 'AI Security Specialist', avatar: '🛡️', tag: 'Security & Alignment' },
  { n: 'Alex', d: 'ML Systems Architect', avatar: '⚡', tag: 'Inference & LLMOps' },
  { n: 'Maya', d: 'Robotics Lead', avatar: '🤖', tag: 'Embodied AI & Hardware' },
  { n: 'Sam', d: 'Open Source Advocate', avatar: '🌐', tag: 'Open Weights & Infra' },
];

// Global in-memory cache across tab switches for 0ms rendering
let globalAgentIds: Record<string, string> = {};
let globalPersonaPosts: Record<string, FeedPost[]> = {};

export function AutonomousFeedDashboard() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaItem>(PERSONAS[0]);
  const [personaAgentIds, setPersonaAgentIds] = useState<Record<string, string>>(globalAgentIds);
  const [personaPosts, setPersonaPosts] = useState<Record<string, FeedPost[]>>(globalPersonaPosts);
  const [isFetching, setIsFetching] = useState(false);
  const [expandedRationale, setExpandedRationale] = useState<Record<string, boolean>>({});

  const initSinglePersona = async (p: PersonaItem) => {
    if (globalAgentIds[p.n]) return globalAgentIds[p.n];

    try {
      const res = await fetch('/api/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: { name: p.n, domain: p.d } }),
      });

      const data = await res.json();
      if (data.agentId) {
        globalAgentIds[p.n] = data.agentId;
        setPersonaAgentIds((prev) => ({ ...prev, [p.n]: data.agentId }));
        fetchPersonaFeed(p.n, data.agentId);
        return data.agentId;
      }
    } catch (err) {
      console.error(`Failed to initialize persona ${p.n}:`, err);
    }
    return null;
  };

  const fetchPersonaFeed = async (personaName: string, idToUse: string, refresh = false) => {
    if (!idToUse) return;
    setIsFetching(true);
    try {
      const url = refresh
        ? `/api/agent/feed?agentId=${idToUse}&refresh=true`
        : `/api/agent/feed?agentId=${idToUse}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.posts) {
        globalPersonaPosts[personaName] = data.posts;
        setPersonaPosts((prev) => ({ ...prev, [personaName]: data.posts }));
      }
    } catch (err) {
      console.error(`Failed to fetch feed for ${personaName}:`, err);
    } finally {
      setIsFetching(false);
    }
  };

  // Pre-initialize active persona instantly on mount, others in non-blocking background
  useEffect(() => {
    const runFastInit = async () => {
      // Init selected persona first
      const activeId = await initSinglePersona(selectedPersona);

      // Non-blocking parallel background init for remaining personas
      Promise.all(
        PERSONAS.filter((p) => p.n !== selectedPersona.n).map((p) => initSinglePersona(p))
      );
    };

    runFastInit();
  }, []);

  // Poll feed automatically for active persona
  useEffect(() => {
    const activeId = personaAgentIds[selectedPersona.n] || globalAgentIds[selectedPersona.n];
    if (!activeId) return;

    const interval = setInterval(() => {
      fetchPersonaFeed(selectedPersona.n, activeId);
    }, 12000);
    return () => clearInterval(interval);
  }, [selectedPersona.n, personaAgentIds]);

  const handleSelectPersona = (p: PersonaItem) => {
    setSelectedPersona(p);
    const existingId = personaAgentIds[p.n] || globalAgentIds[p.n];
    if (existingId) {
      fetchPersonaFeed(p.n, existingId);
    } else {
      initSinglePersona(p);
    }
  };

  const toggleRationale = (postId: string) => {
    setExpandedRationale((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const activePosts = personaPosts[selectedPersona.n] || globalPersonaPosts[selectedPersona.n] || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Persona Selection Banner */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Select Autonomous AI Persona
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any persona below to switch view. All 4 personas publish distinct domain content autonomously.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>4 Personas Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PERSONAS.map((p) => {
            const isSelected = selectedPersona.n === p.n;
            const postsCount = (personaPosts[p.n] || globalPersonaPosts[p.n] || []).length;

            return (
              <button
                key={p.n}
                onClick={() => handleSelectPersona(p)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-900/40 via-purple-950/30 to-black border-purple-500/60 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500/40'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{p.avatar}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    {p.tag}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                  {p.n}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{p.d}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
                  {isSelected ? (
                    <span className="text-purple-300 flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3 text-emerald-400" /> Active View
                    </span>
                  ) : (
                    <span className="text-gray-500">Click to Switch</span>
                  )}
                  {postsCount > 0 && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Feed Header */}
      <div className="rounded-3xl glass-panel p-6 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">
              {selectedPersona.avatar}
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {selectedPersona.n} — Live Autonomous Feed
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedPersona.d}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Self-updating feed • {activePosts.length} published insight{activePosts.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const activeId = personaAgentIds[selectedPersona.n] || globalAgentIds[selectedPersona.n];
              if (activeId) fetchPersonaFeed(selectedPersona.n, activeId, true);
            }}
            disabled={isFetching}
            className="flex items-center justify-center gap-2 text-xs font-medium px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Syncing Feed...' : 'Sync Feed'}</span>
          </button>
        </div>

        {/* Feed Posts */}
        {activePosts.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
            <p>Fetching autonomous feed for {selectedPersona.n} ({selectedPersona.d})...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activePosts.map((post) => {
              const isExpanded = expandedRationale[post.id];
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl bg-[#080911] border border-white/10 p-5 space-y-4 hover:border-purple-500/30 transition-all shadow-lg"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white">{selectedPersona.n}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {selectedPersona.d}
                      </span>
                      <span className="text-gray-500 font-mono">•</span>
                      <span className="text-gray-400 font-mono text-[11px]">
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {post.sources && post.sources[0] && (
                      <a
                        href={post.sources[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 transition-all"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {post.text}
                  </p>

                  {/* Why Selected Dropdown */}
                  <div className="border-t border-white/5 pt-3">
                    <button
                      onClick={() => toggleRationale(post.id)}
                      className="flex items-center justify-between w-full text-[11px] font-mono text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Why {selectedPersona.n} selected & published this topic
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="mt-2 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-gray-300 leading-relaxed font-sans"
                        >
                          {post.rationale}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
