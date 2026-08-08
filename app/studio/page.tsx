'use client';

import { useEffect, useState } from 'react';
import { useCreatorStore } from '@/lib/store';
import { AgentPipeline } from '@/components/agents/AgentPipeline';
import { AgentLiveFeed } from '@/components/agents/AgentLiveFeed';
import { OutputWorkspace } from '@/components/output/OutputWorkspace';
import { PresetGoals } from '@/components/studio/PresetGoals';
import { AutonomousFeedDashboard } from '@/components/autonomous/AutonomousFeedDashboard';
import { Sparkles, Play, RefreshCw, Clock, AlertCircle, Bot, Radio, Zap } from 'lucide-react';
import { StreamEvent } from '@/types';
import { formatTime } from '@/lib/utils';

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'autonomous' | 'interactive'>('autonomous');

  const {
    goal,
    setGoal,
    pipelineState,
    startPipeline,
    updateAgentStatus,
    appendAgentToken,
    completeAgent,
    setFinalPackage,
    setPipelineError,
    addLog,
    resetPipeline,
    elapsedTime,
    tickTimer,
  } = useCreatorStore();

  const [inputError, setInputError] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pipelineState === 'running') {
      interval = setInterval(() => tickTimer(), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pipelineState, tickTimer]);

  const handleLaunch = async () => {
    if (!goal.trim()) {
      setInputError('Please enter a content goal first (or select a preset below).');
      return;
    }
    setInputError('');
    startPipeline();

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by server response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            try {
              const event: StreamEvent = JSON.parse(jsonStr);
              processStreamEvent(event);
            } catch (err) {
              console.error('Failed to parse SSE event:', jsonStr);
            }
          }
        }
      }
    } catch (err: any) {
      setPipelineError(err?.message || 'Failed to communicate with AI agent stream.');
    }
  };

  const processStreamEvent = (event: StreamEvent) => {
    const { agent, type, status, token, reasoning, package: pkg, error } = event;

    if (type === 'status' && status) {
      updateAgentStatus(agent, status, reasoning);
      addLog(agent, `Agent status changed to [${status.toUpperCase()}]`, 'info');
    } else if (type === 'token' && token) {
      appendAgentToken(agent, token);
      addLog(agent, token, 'token');
    } else if (type === 'reasoning' && reasoning) {
      updateAgentStatus(agent, 'done', reasoning);
      addLog(agent, `💡 Reasoning: ${reasoning}`, 'reasoning');
    } else if (type === 'final_package' && pkg) {
      setFinalPackage(pkg);
    } else if (type === 'error' && error) {
      setPipelineError(error);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Studio Navigation & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              CreatorOS <span className="gradient-text">Studio</span>
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Choose between live autonomous AI persona feeds or generating custom multi-platform campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('autonomous')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'autonomous'
                ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Autonomous Persona Feed
          </button>

          <button
            onClick={() => setActiveTab('interactive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'interactive'
                ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            Custom Campaign Studio
          </button>
        </div>
      </div>

      {activeTab === 'autonomous' ? (
        <AutonomousFeedDashboard />
      ) : (
        <div className="space-y-8">
          {/* Goal Input Section */}
          <div className="rounded-3xl p-6 glass-panel border border-purple-500/30 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Define Content Goal
              </label>
              <span className="text-[11px] font-mono text-gray-500">Triggers 6 AI Agents</span>
            </div>

            <div className="space-y-2">
              <textarea
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  if (inputError) setInputError('');
                }}
                placeholder="e.g. Create LinkedIn content about AI in healthcare..."
                rows={3}
                disabled={pipelineState === 'running'}
                className="w-full bg-[#090A12] border border-white/10 focus:border-purple-500 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none font-sans disabled:opacity-50"
              />

              {inputError && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {inputError}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <PresetGoals onSelectGoal={(selectedGoal) => setGoal(selectedGoal)} />

              <button
                onClick={handleLaunch}
                disabled={pipelineState === 'running'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
              >
                <Play className={`w-4 h-4 fill-current ${pipelineState === 'running' ? 'animate-spin' : ''}`} />
                <span>{pipelineState === 'running' ? 'Agents Operating...' : 'Launch Agent Pipeline'}</span>
              </button>
            </div>
          </div>

          <AgentPipeline />

          <div className="grid grid-cols-1 gap-6">
            <AgentLiveFeed />
            <OutputWorkspace />
          </div>
        </div>
      )}
    </div>
  );
}
