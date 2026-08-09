import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AgentName, AgentState, ContentPackage } from '@/types';

export interface SavedCampaign {
  id: string;
  createdAt: string;
  goal: string;
  package: ContentPackage;
}

export const DEFAULT_AGENTS: AgentState[] = [
  {
    name: 'Planner',
    title: 'Content Strategy Planner',
    description: 'Deconstructs goal into sub-tasks & defines strategic hook angle',
    status: 'idle',
    reasoning: '',
    output: '',
  },
  {
    name: 'Researcher',
    title: 'Market Trends Researcher',
    description: 'Surfaces key industry insights, stats & high-engagement hooks',
    status: 'idle',
    reasoning: '',
    output: '',
  },
  {
    name: 'Writer',
    title: 'Multi-Format Copywriter',
    description: 'Drafts LinkedIn post, X thread & structured blog outline',
    status: 'idle',
    reasoning: '',
    output: '',
  },
  {
    name: 'Reviewer',
    title: 'Quality & Engagement Critic',
    description: 'Evaluates hook strength, clarity, readability & virality score',
    status: 'idle',
    reasoning: '',
    output: '',
  },
  {
    name: 'Improver',
    title: 'Content Polish Engine',
    description: 'Applies reviewer feedback to revise and optimize draft quality',
    status: 'idle',
    reasoning: '',
    output: '',
  },
  {
    name: 'Publisher',
    title: 'Asset & Hashtag Packager',
    description: 'Generates visual prompt, hashtag stack & publish summary',
    status: 'idle',
    reasoning: '',
    output: '',
  },
];

interface LogEntry {
  id: string;
  timestamp: string;
  agent: AgentName;
  text: string;
  type: 'info' | 'token' | 'reasoning' | 'success' | 'error';
}

interface CreatorStore {
  goal: string;
  runId: string | null;
  pipelineState: 'idle' | 'running' | 'completed' | 'error';
  agents: AgentState[];
  activeAgentIndex: number;
  liveLogs: LogEntry[];
  finalPackage: ContentPackage | null;
  selectedTab: string;
  elapsedTime: number;
  savedCampaigns: SavedCampaign[];

  setGoal: (goal: string) => void;
  setSelectedTab: (tab: string) => void;
  startPipeline: () => void;
  updateAgentStatus: (name: AgentName, status: AgentState['status'], reasoning?: string) => void;
  appendAgentToken: (name: AgentName, token: string) => void;
  completeAgent: (name: AgentName, output: string, reasoning: string) => void;
  setFinalPackage: (pkg: ContentPackage) => void;
  setPipelineError: (error: string) => void;
  addLog: (agent: AgentName, text: string, type?: LogEntry['type']) => void;
  resetPipeline: () => void;
  tickTimer: () => void;

  loadSavedCampaign: (id: string) => void;
  deleteSavedCampaign: (id: string) => void;
  clearAllSavedCampaigns: () => void;
}

export const useCreatorStore = create<CreatorStore>()(
  persist(
    (set, get) => ({
      goal: '',
      runId: null,
      pipelineState: 'idle',
      agents: DEFAULT_AGENTS,
      activeAgentIndex: -1,
      liveLogs: [],
      finalPackage: null,
      selectedTab: 'linkedin',
      elapsedTime: 0,
      savedCampaigns: [],

      setGoal: (goal) => set({ goal }),
      setSelectedTab: (selectedTab) => set({ selectedTab }),

      startPipeline: () => {
        const runId = Math.random().toString(36).substring(2, 9);
        set({
          runId,
          pipelineState: 'running',
          activeAgentIndex: 0,
          elapsedTime: 0,
          liveLogs: [],
          finalPackage: null,
          agents: DEFAULT_AGENTS.map((agent, i) => ({
            ...agent,
            status: i === 0 ? 'running' : 'pending',
            reasoning: '',
            output: '',
            startedAt: i === 0 ? Date.now() : undefined,
          })),
        });
        get().addLog('Planner', '🚀 Pipeline initialized. Dispatching Goal to Planner Agent...', 'info');
      },

      updateAgentStatus: (name, status, reasoning) => {
        set((state) => {
          const idx = state.agents.findIndex((a) => a.name === name);
          if (idx === -1) return state;

          const newAgents = [...state.agents];
          newAgents[idx] = {
            ...newAgents[idx],
            status,
            reasoning: reasoning !== undefined ? reasoning : newAgents[idx].reasoning,
            startedAt: status === 'running' ? Date.now() : newAgents[idx].startedAt,
            finishedAt: status === 'done' || status === 'error' ? Date.now() : newAgents[idx].finishedAt,
          };

          const activeIdx = status === 'running' ? idx : state.activeAgentIndex;

          return {
            agents: newAgents,
            activeAgentIndex: activeIdx,
          };
        });
      },

      appendAgentToken: (name, token) => {
        set((state) => {
          const idx = state.agents.findIndex((a) => a.name === name);
          if (idx === -1) return state;

          const newAgents = [...state.agents];
          newAgents[idx] = {
            ...newAgents[idx],
            output: newAgents[idx].output + token,
          };

          return { agents: newAgents };
        });
      },

      completeAgent: (name, output, reasoning) => {
        set((state) => {
          const idx = state.agents.findIndex((a) => a.name === name);
          if (idx === -1) return state;

          const now = Date.now();
          const newAgents = [...state.agents];
          const start = newAgents[idx].startedAt || now;

          newAgents[idx] = {
            ...newAgents[idx],
            status: 'done',
            output,
            reasoning,
            finishedAt: now,
            durationMs: now - start,
          };

          const nextIdx = idx + 1;
          if (nextIdx < newAgents.length) {
            newAgents[nextIdx] = {
              ...newAgents[nextIdx],
              status: 'running',
              startedAt: now,
            };
          }

          return {
            agents: newAgents,
            activeAgentIndex: nextIdx < newAgents.length ? nextIdx : idx,
          };
        });
      },

      setFinalPackage: (pkg) => {
        const currentGoal = get().goal || pkg.title || 'Campaign Deliverables';
        const newCampaign: SavedCampaign = {
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
          goal: currentGoal,
          package: pkg,
        };

        const prevCampaigns = get().savedCampaigns || [];
        const filtered = prevCampaigns.filter((c) => c.package.title !== pkg.title);
        const updatedCampaigns = [newCampaign, ...filtered].slice(0, 20);

        set({
          finalPackage: pkg,
          pipelineState: 'completed',
          activeAgentIndex: 5,
          savedCampaigns: updatedCampaigns,
        });
        get().addLog('Publisher', '🎉 Complete Content Package finalized & saved to local history!', 'success');
      },

      setPipelineError: (error) => {
        set({ pipelineState: 'error' });
        get().addLog('Planner', `❌ Pipeline encountered an error: ${error}`, 'error');
      },

      addLog: (agent, text, type = 'token') => {
        const entry: LogEntry = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          agent,
          text,
          type,
        };
        set((state) => ({ liveLogs: [...state.liveLogs.slice(-150), entry] }));
      },

      resetPipeline: () => {
        set({
          pipelineState: 'idle',
          agents: DEFAULT_AGENTS,
          activeAgentIndex: -1,
          liveLogs: [],
          finalPackage: null,
          elapsedTime: 0,
        });
      },

      tickTimer: () => {
        set((state) => (state.pipelineState === 'running' ? { elapsedTime: state.elapsedTime + 1 } : {}));
      },

      loadSavedCampaign: (id) => {
        const campaign = get().savedCampaigns.find((c) => c.id === id);
        if (campaign) {
          set({
            finalPackage: campaign.package,
            goal: campaign.goal,
            pipelineState: 'completed',
            selectedTab: 'linkedin',
          });
        }
      },

      deleteSavedCampaign: (id) => {
        set((state) => {
          const updated = state.savedCampaigns.filter((c) => c.id !== id);
          const isCurrentDeleted = state.finalPackage && !updated.some((c) => c.package.title === state.finalPackage?.title);
          return {
            savedCampaigns: updated,
            finalPackage: isCurrentDeleted ? (updated[0]?.package || null) : state.finalPackage,
          };
        });
      },

      clearAllSavedCampaigns: () => {
        set({ savedCampaigns: [], finalPackage: null, pipelineState: 'idle' });
      },
    }),
    {
      name: 'creator_os_studio_store_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as any))),
      partialize: (state) => ({
        goal: state.goal,
        runId: state.runId,
        pipelineState: state.pipelineState,
        agents: state.agents,
        activeAgentIndex: state.activeAgentIndex,
        liveLogs: state.liveLogs,
        finalPackage: state.finalPackage,
        selectedTab: state.selectedTab,
        savedCampaigns: state.savedCampaigns,
      }),
    }
  )
);
