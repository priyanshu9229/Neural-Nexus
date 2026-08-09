'use client';

import { useEffect } from 'react';
import { useCreatorStore } from '@/lib/store';
import { OutputWorkspace } from '@/components/output/OutputWorkspace';
import { generateMockContentPackage } from '@/agents/mockGenerator';
import Link from 'next/link';
import { Sparkles, ArrowLeft, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgentName } from '@/types';

export default function ResultsPage() {
  const { finalPackage, goal, savedCampaigns, loadSavedCampaign, setFinalPackage, setGoal, completeAgent } = useCreatorStore();

  useEffect(() => {
    if (!finalPackage) {
      if (savedCampaigns && savedCampaigns.length > 0) {
        loadSavedCampaign(savedCampaigns[0].id);
      } else {
        const demoGoal = 'AI Autonomous Agent Systems 2026';
        const mockData = generateMockContentPackage(demoGoal);
        setGoal(demoGoal);
        setFinalPackage(mockData.finalPackage);
        
        const agentMap: Record<AgentName, { output: string; reasoning: string }> = {
          Planner: mockData.planner,
          Researcher: mockData.researcher,
          Writer: mockData.writer,
          Reviewer: mockData.reviewer,
          Improver: mockData.improver,
          Publisher: mockData.publisher,
        };

        (Object.keys(agentMap) as AgentName[]).forEach((agent) => {
          completeAgent(agent, agentMap[agent].output, agentMap[agent].reasoning);
        });
      }
    }
  }, [finalPackage, savedCampaigns, loadSavedCampaign, setFinalPackage, setGoal, completeAgent]);

  useEffect(() => {
    if (finalPackage) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#3b82f6', '#10b981'],
      });
    }
  }, [finalPackage]);

  return (
    <div className="space-y-8 py-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Deliverables Package <FileCheck className="w-5 h-5 text-emerald-400" />
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Goal: <span className="text-purple-300 italic">"{goal || 'AI Autonomous Agent Systems 2026'}"</span>
            </p>
          </div>
        </div>

        <Link
          href="/studio"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate New Campaign
        </Link>
      </div>

      <OutputWorkspace />
    </div>
  );
}
