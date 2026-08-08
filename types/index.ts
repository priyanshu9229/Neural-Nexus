export type AgentName =
  | 'Planner'
  | 'Researcher'
  | 'Writer'
  | 'Reviewer'
  | 'Improver'
  | 'Publisher';

export type AgentStatus = 'idle' | 'pending' | 'running' | 'done' | 'error';

export interface AgentState {
  name: AgentName;
  title: string;
  description: string;
  status: AgentStatus;
  reasoning: string;
  output: string;
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
}

export interface ContentPackage {
  title: string;
  summary: string;
  linkedinPost: string;
  twitterThread: string[];
  blogOutline: {
    title: string;
    targetAudience: string;
    sections: { heading: string; points: string[] }[];
  };
  hashtags: string[];
  imagePrompt: string;
  keyInsights: string[];
  critiqueNotes: string[];
  improvementsMade: string[];
}

export interface StreamEvent {
  agent: AgentName;
  type: 'status' | 'token' | 'reasoning' | 'complete' | 'error' | 'final_package';
  status?: AgentStatus;
  token?: string;
  reasoning?: string;
  output?: string;
  package?: ContentPackage;
  error?: string;
}

export interface PresetGoal {
  id: string;
  title: string;
  category: string;
  goal: string;
  iconName: string;
}
