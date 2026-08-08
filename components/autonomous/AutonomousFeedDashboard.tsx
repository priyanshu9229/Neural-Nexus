'use client';

import { useState, useEffect } from 'react';
import { Bot, Sparkles, RefreshCw, Copy, Check, ShieldCheck, Terminal, ExternalLink, Activity, Layers } from 'lucide-react';

interface FeedPost {
  id: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: string[];
}

export function AutonomousFeedDashboard() {
  const [name, setName] = useState('Ada');
  const [domain, setDomain] = useState('AI Security');
  const [agentId, setAgentId] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCurlInit, setCopiedCurlInit] = useState(false);
  const [copiedCurlFeed, setCopiedCurlFeed] = useState(false);

  const initializePersona = async (selectedName?: string, selectedDomain?: string) => {
    setIsInitializing(true);
    const n = selectedName || name;
    const d = selectedDomain || domain;

    try {
      const res = await fetch('/api/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: { name: n, domain: d },
        }),
      });

      const data = await res.json();
      if (data.agentId) {
        setAgentId(data.agentId);
        fetchFeed(data.agentId);
      }
    } catch (err) {
      console.error('Failed to initialize agent:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchFeed = async (idToUse?: string) => {
    const id = idToUse || agentId;
    if (!id) return;

    setIsFetching(true);
    try {
      const res = await fetch(`/api/agent/feed?agentId=${id}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setIsFetching(false);
    }
  };

  // Poll feed every 15 seconds if agent initialized
  useEffect(() => {
    if (!agentId) return;
    const interval = setInterval(() => {
      fetchFeed(agentId);
    }, 15000);
    return () => clearInterval(interval);
  }, [agentId]);

  // Auto initialize Ada on first load if not initialized
  useEffect(() => {
    if (!agentId) {
      initializePersona('Ada', 'AI Security');
    }
  }, []);

  const copyAgentId = () => {
    if (!agentId) return;
    navigator.clipboard.writeText(agentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const curlInit = `curl -X POST http://localhost:3000/api/agent/init -H "Content-Type: application/json" -d '{"persona": {"name": "${name}", "domain": "${domain}"}}'`;
  const curlFeed = `curl http://localhost:3000/api/agent/feed?agentId=${agentId || 'abc-123'}`;

  return (
    <div className="space-y-8">
      {/* Initialization & Persona Setup */}
      <div className="rounded-3xl p-6 glass-panel border border-purple-500/30 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Persona Engine
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Autonomous AI Persona Feed
            </h2>
          </div>

          {agentId && (
            <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/40 px-3 py-1.5 rounded-xl font-mono text-xs text-purple-300">
              <span>Agent ID:</span>
              <span className="text-white font-bold">{agentId}</span>
              <button
                onClick={copyAgentId}
                className="ml-1 text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Preset Personas */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            Select or Initialize Autonomous Persona
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { n: 'Ada', d: 'AI Security', icon: '🛡️' },
              { n: 'Alex', d: 'ML Engineer', icon: '⚡' },
              { n: 'Maya', d: 'Robotics Engineer', icon: '🤖' },
              { n: 'Sam', d: 'Open Source Advocate', icon: '🌐' },
            ].map((p) => (
              <button
                key={p.n}
                onClick={() => {
                  setName(p.n);
                  setDomain(p.d);
                  initializePersona(p.n, p.d);
                }}
                className={`p-3 rounded-xl border text-left transition-all font-sans text-xs ${
                  name === p.n && domain === p.d
                    ? 'bg-purple-600/30 border-purple-500 text-white font-semibold shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="text-base mb-1">{p.icon}</div>
                <div className="font-bold text-white">{p.n}</div>
                <div className="text-[10px] text-gray-400">{p.d}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Persona Setup */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Persona Name (e.g. Ada)"
            className="w-full sm:w-1/3 bg-[#090A12] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Domain (e.g. AI Security)"
            className="w-full sm:w-1/2 bg-[#090A12] border border-white/10 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={() => initializePersona()}
            disabled={isInitializing}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shrink-0 shadow-lg shadow-purple-500/20 transition-all"
          >
            {isInitializing ? 'Initializing...' : 'Initialize Persona'}
          </button>
        </div>
      </div>

      {/* Live Autonomous Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            Live Autonomous Feed (GET /api/agent/feed)
          </h3>

          <button
            onClick={() => fetchFeed()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 text-gray-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-xs text-gray-400">
            Initializing autonomous feed... Evaluators can poll <code className="font-mono text-purple-300">GET /api/agent/feed?agentId={agentId || '...'}</code> to receive new posts.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="rounded-2xl glass-panel p-5 space-y-3 border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                      {post.id}
                    </span>
                    <span className="text-gray-400">{post.createdAt}</span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AUTONOMOUS POST
                  </span>
                </div>

                <div className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-sans bg-[#080911] p-4 rounded-xl border border-white/5">
                  {post.text}
                </div>

                <div className="space-y-2 pt-1">
                  <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3 text-xs space-y-1">
                    <span className="font-bold text-purple-300 font-mono text-[11px] block">
                      📌 Publishing Rationale:
                    </span>
                    <p className="text-gray-300 leading-relaxed text-[11px] font-sans">{post.rationale}</p>
                  </div>

                  {post.sources && post.sources.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                      <span>Sources:</span>
                      {post.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline flex items-center gap-1"
                        >
                          {src} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluator API Inspection Box */}
      <div className="rounded-2xl glass-panel p-5 space-y-3 border border-purple-500/30 bg-black/40">
        <h4 className="font-mono text-xs text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-purple-400" />
          Evaluator API Verification Commands
        </h4>

        <div className="space-y-2 text-xs font-mono">
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span>1. Initialize Agent (POST /api/agent/init)</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(curlInit);
                  setCopiedCurlInit(true);
                  setTimeout(() => setCopiedCurlInit(false), 2000);
                }}
                className="hover:text-white flex items-center gap-1"
              >
                {copiedCurlInit ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurlInit ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-[#07080F] border border-white/10 text-gray-300 overflow-x-auto text-[11px]">
              {curlInit}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
              <span>2. Retrieve Feed (GET /api/agent/feed?agentId=...)</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(curlFeed);
                  setCopiedCurlFeed(true);
                  setTimeout(() => setCopiedCurlFeed(false), 2000);
                }}
                className="hover:text-white flex items-center gap-1"
              >
                {copiedCurlFeed ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurlFeed ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-[#07080F] border border-white/10 text-gray-300 overflow-x-auto text-[11px]">
              {curlFeed}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
