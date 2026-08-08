'use client';

import { useCreatorStore } from '@/lib/store';
import { AgentCard } from './AgentCard';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export function AgentPipeline() {
  const { agents, activeAgentIndex } = useCreatorStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Multi-Agent Workflow
        </h2>
        <span className="text-[11px] font-mono text-gray-400">
          {agents.filter((a) => a.status === 'done').length} / {agents.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent, index) => (
          <AgentCard key={agent.name} agent={agent} isActive={activeAgentIndex === index} />
        ))}
      </div>
    </div>
  );
}
