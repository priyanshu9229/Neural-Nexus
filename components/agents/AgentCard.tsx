'use client';

import { AgentState } from '@/types';
import { ReasoningPanel } from './ReasoningPanel';
import {
  FileText,
  Search,
  PenTool,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  Clock,
  AlertTriangle,
  CircleDashed,
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  Planner: FileText,
  Researcher: Search,
  Writer: PenTool,
  Reviewer: CheckCircle2,
  Improver: Sparkles,
  Publisher: Send,
};

interface AgentCardProps {
  agent: AgentState;
  isActive: boolean;
}

export function AgentCard({ agent, isActive }: AgentCardProps) {
  const Icon = iconMap[agent.name] || FileText;

  const getStatusBadge = () => {
    switch (agent.status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
            RUNNING
          </span>
        );
      case 'done':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            DONE
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            ERROR
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10 font-mono">
            <CircleDashed className="w-3 h-3 text-gray-500" />
            PENDING
          </span>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 transition-all duration-300 relative overflow-hidden ${
        isActive
          ? 'bg-purple-950/40 border-2 border-purple-500/70 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500/30'
          : agent.status === 'done'
          ? 'bg-white/[0.03] border border-white/15 hover:border-emerald-500/30'
          : 'bg-white/[0.01] border border-white/5 opacity-70'
      }`}
    >
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/50'
                : agent.status === 'done'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white tracking-tight">{agent.title}</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{agent.description}</p>
          </div>
        </div>

        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Reasoning Panel */}
      {agent.reasoning && (
        <ReasoningPanel agentName={agent.name} reasoning={agent.reasoning} defaultExpanded={isActive} />
      )}
    </motion.div>
  );
}
