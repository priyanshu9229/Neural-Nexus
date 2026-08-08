'use client';

import { useRef, useEffect } from 'react';
import { useCreatorStore } from '@/lib/store';
import { Terminal, ShieldCheck, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function AgentLiveFeed() {
  const { liveLogs, pipelineState } = useCreatorStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveLogs]);

  const copyFullLog = () => {
    const text = liveLogs.map((l) => `[${l.timestamp}] [${l.agent}] ${l.text}`).join('');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAgentColor = (name: string) => {
    switch (name) {
      case 'Planner':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'Researcher':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'Writer':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Reviewer':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Improver':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Publisher':
        return 'text-pink-400 border-pink-500/30 bg-pink-500/10';
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 glass-panel overflow-hidden flex flex-col h-[380px]">
      {/* Terminal Bar */}
      <div className="px-4 py-2.5 bg-black/60 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            Agent Activity Live Feed (SSE Stream)
          </span>
        </div>

        <button
          onClick={copyFullLog}
          disabled={liveLogs.length === 0}
          className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 hover:border-white/20 transition-all disabled:opacity-40"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy Log'}</span>
        </button>
      </div>

      {/* Console Output Scroll Container */}
      <div className="p-4 font-mono text-xs overflow-y-auto flex-1 space-y-1.5 bg-[#07080E]">
        {liveLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <Terminal className="w-8 h-8 opacity-40 text-purple-400" />
            <p className="text-center max-w-sm">Enter a goal above and click "Launch Agent Pipeline" to watch 6 AI agents stream real-time activity.</p>
          </div>
        ) : (
          liveLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed hover:bg-white/[0.02] p-0.5 rounded">
              <span className="text-[10px] text-gray-500 select-none shrink-0 pt-0.5">{log.timestamp}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold shrink-0 uppercase tracking-wide ${getAgentColor(
                  log.agent
                )}`}
              >
                {log.agent}
              </span>
              <span
                className={`flex-1 whitespace-pre-wrap ${
                  log.type === 'error'
                    ? 'text-rose-400 font-bold'
                    : log.type === 'success'
                    ? 'text-emerald-400 font-medium'
                    : log.type === 'reasoning'
                    ? 'text-amber-300 italic'
                    : 'text-gray-300'
                }`}
              >
                {log.text}
              </span>
            </div>
          ))
        )}
        {pipelineState === 'running' && (
          <div className="flex items-center gap-2 text-purple-400 text-xs pt-1 font-mono animate-pulse">
            <span className="w-2 h-4 bg-purple-400 inline-block animate-bounce" />
            <span>Streaming tokens from active agent...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
