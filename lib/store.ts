import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AgentName, AgentState, ContentPackage } from '@/types';

export interface SavedCampaign {
  id: string;
  timestamp: string;
  goal: string;
  package: ContentPackage;
}

const DEFAULT_AGENTS: AgentState[] = [
  {
    name: 'Planner',
    title: 'Content Strategy Planner',
    description: 'Deconstructs goal, defines target persona, and establishes core hook angle',
    status: 'idle',
    reasoning: '',
    output: '',
  },
  {
    name: 'Researcher',
    title: 'Data & Metric Researcher',
    description: 'Extracts real-time trends, key market data, and counter-intuitive insights',
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
  theme: 'dark' | 'light';

  setGoal: (goal: string) => void;
  setSelectedTab: (tab: string) => void;
  toggleTheme: () => void;
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
      theme: 'dark',

      setGoal: (goal) => set({ goal }),
      setSelectedTab: (selectedTab) => set({ selectedTab }),
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        if (typeof document !== 'undefined') {
          if (next === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        }
      },

      startPipeline: () => {
        const runId = Math.random().toString(36).substring(2, 9);
        set({
          runId,
          pipelineState: 'running',
          activeAgentIndex: 0,
          elapsedTime: 0,
          liveLogs: [],
          finalPackage: null,
          agents: DEFAULT_AGENTS.map((a, i) =>
            i === 0 ? { ...a, status: 'running' } : { ...a, status: 'pending', reasoning: '', output: '' }
          ),
        });
      },

      updateAgentStatus: (name, status, reasoning) => {
        const { agents } = get();
        const index = agents.findIndex((a) => a.name === name);
        if (index === -1) return;

        const updated = [...agents];
        updated[index] = {
          ...updated[index],
          status,
          ...(reasoning !== undefined ? { reasoning } : {}),
        };

        let nextIndex = get().activeAgentIndex;
        if (status === 'running') {
          nextIndex = index;
        } else if (status === 'done' && index < agents.length - 1) {
          nextIndex = index + 1;
          if (updated[nextIndex].status === 'pending') {
            updated[nextIndex].status = 'running';
          }
        }

        set({ agents: updated, activeAgentIndex: nextIndex });
      },

      appendAgentToken: (name, token) => {
        const { agents } = get();
        const index = agents.findIndex((a) => a.name === name);
        if (index === -1) return;

        const updated = [...agents];
        updated[index] = {
          ...updated[index],
          output: (updated[index].output || '') + token,
        };

        set({ agents: updated });
      },

      completeAgent: (name, output, reasoning) => {
        const { agents } = get();
        const index = agents.findIndex((a) => a.name === name);
        if (index === -1) return;

        const updated = [...agents];
        updated[index] = {
          ...updated[index],
          status: 'done',
          output,
          reasoning,
        };

        const nextIndex = index < agents.length - 1 ? index + 1 : index;
        if (nextIndex > index && updated[nextIndex].status === 'pending') {
          updated[nextIndex].status = 'running';
        }

        set({ agents: updated, activeAgentIndex: nextIndex });
      },

      setFinalPackage: (pkg) => {
        const goal = get().goal;
        const savedCampaigns = get().savedCampaigns;

        const newCampaign: SavedCampaign = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          goal,
          package: pkg,
        };

        const filtered = savedCampaigns.filter((c) => c.package.title !== pkg.title);
        const updatedSaved = [newCampaign, ...filtered].slice(0, 20);

        set({
          finalPackage: pkg,
          pipelineState: 'completed',
          savedCampaigns: updatedSaved,
        });
      },

      setPipelineError: (error) => {
        const { agents, activeAgentIndex } = get();
        const updated = [...agents];
        if (activeAgentIndex >= 0 && activeAgentIndex < agents.length) {
          updated[activeAgentIndex].status = 'error';
        }
        set({ pipelineState: 'error', agents: updated });
        get().addLog('Publisher', `⚠️ Pipeline Error: ${error}`, 'error');
      },

      addLog: (agent, text, type = 'info') => {
        const newLog: LogEntry = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          agent,
          text,
          type,
        };
        set((state) => ({ liveLogs: [...state.liveLogs, newLog] }));
      },

      resetPipeline: () => {
        set({
          pipelineState: 'idle',
          activeAgentIndex: -1,
          liveLogs: [],
          finalPackage: null,
          elapsedTime: 0,
          agents: DEFAULT_AGENTS.map((a) => ({ ...a, status: 'pending', reasoning: '', output: '' })),
        });
      },

      tickTimer: () => {
        set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
      },

      loadSavedCampaign: (id) => {
        const campaign = get().savedCampaigns.find((c) => c.id === id);
        if (campaign) {
          set({
            finalPackage: campaign.package,
            goal: campaign.goal,
          });
        }
      },

      deleteSavedCampaign: (id) => {
        const filtered = get().savedCampaigns.filter((c) => c.id !== id);
        set({ savedCampaigns: filtered });
        if (filtered.length > 0) {
          set({
            finalPackage: filtered[0].package,
            goal: filtered[0].goal,
          });
        } else {
          set({
            finalPackage: null,
          });
        }
      },

      clearAllSavedCampaigns: () => {
        set({
          savedCampaigns: [],
          finalPackage: null,
        });
      },
    }),
    {
      name: 'creator-os-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
