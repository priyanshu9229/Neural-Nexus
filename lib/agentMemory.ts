import fs from 'fs';
import path from 'path';

export interface PostSource {
  title?: string;
  url: string;
}

export interface Post {
  id: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: string[];
}

export interface RejectedTopic {
  topic: string;
  reason: string;
}

export interface AgentRecord {
  agentId: string;
  name: string;
  domain: string;
  initializedAt: string;
  lastTickAt: string;
  publishedPosts: Post[];
  rejectedTopics: RejectedTopic[];
  memoryTopics: string[];
}

// In-memory store + disk persistence for serverless/local reliability
const memoryStore = new Map<string, AgentRecord>();

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'agents.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadFromDisk() {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed: Record<string, AgentRecord> = JSON.parse(raw);
      for (const [id, agent] of Object.entries(parsed)) {
        memoryStore.set(id, agent);
      }
    }
  } catch (err) {
    console.error('Error loading agents from disk:', err);
  }
}

function saveToDisk() {
  try {
    ensureDataDir();
    const obj: Record<string, AgentRecord> = {};
    for (const [id, agent] of memoryStore.entries()) {
      obj[id] = agent;
    }
    fs.readFileSync;
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving agents to disk:', err);
  }
}

// Load on startup
loadFromDisk();

export function createAgent(name: string, domain: string): AgentRecord {
  const agentId = `agent-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const record: AgentRecord = {
    agentId,
    name: name || 'Ada',
    domain: domain || 'AI Security',
    initializedAt: now,
    lastTickAt: now,
    publishedPosts: [],
    rejectedTopics: [],
    memoryTopics: [],
  };

  memoryStore.set(agentId, record);
  saveToDisk();
  return record;
}

export function getAgent(agentId: string): AgentRecord | undefined {
  if (!memoryStore.has(agentId)) {
    loadFromDisk();
  }
  return memoryStore.get(agentId);
}

export function updateAgent(record: AgentRecord) {
  memoryStore.set(record.agentId, record);
  saveToDisk();
}

export function getAllAgents(): AgentRecord[] {
  loadFromDisk();
  return Array.from(memoryStore.values());
}
