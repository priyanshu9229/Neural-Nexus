'use client';

import { PresetGoal } from '@/types';
import { Sparkles, HeartPulse, Code, Rocket, TrendingUp } from 'lucide-react';

const PRESETS: PresetGoal[] = [
  {
    id: 'healthcare',
    title: 'AI in Healthcare',
    category: 'Industry Deep Dive',
    goal: 'Create LinkedIn and Twitter content about AI transforming diagnostics and patient care in healthcare.',
    iconName: 'HeartPulse',
  },
  {
    id: 'multiagent',
    title: 'Multi-Agent AI Systems',
    category: 'Technical Architecture',
    goal: 'Write viral developer posts explaining how multi-agent self-critiquing loops outperform single prompt wrappers.',
    iconName: 'Code',
  },
  {
    id: 'saas',
    title: 'SaaS Growth & AI Leverage',
    category: 'Founder Strategy',
    goal: 'Generate LinkedIn post and X thread on how modern B2B startups achieve 10x leverage with AI automation.',
    iconName: 'Rocket',
  },
  {
    id: 'trends',
    title: 'Future of Tech 2026',
    category: 'Macro Trends',
    goal: 'Research key technology trends in 2026 and write a comprehensive social campaign for tech leaders.',
    iconName: 'TrendingUp',
  },
];

interface PresetGoalsProps {
  onSelectGoal: (goal: string) => void;
}

export function PresetGoals({ onSelectGoal }: PresetGoalsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Or Try Demo Preset Goal
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectGoal(preset.goal)}
            className="text-left p-3 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase">{preset.category}</span>
              <Sparkles className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h4 className="text-xs font-semibold text-white group-hover:text-purple-200 transition-colors">
              {preset.title}
            </h4>
          </button>
        ))}
      </div>
    </div>
  );
}
