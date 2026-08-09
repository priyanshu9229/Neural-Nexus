import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface DBPersona {
  agentId: string;
  name: string;
  domain: string;
  voice_description: string;
  editorial_criteria: string[];
  created_at: string;
}

export interface DBPost {
  id: string;
  agentId: string;
  text: string;
  rationale: string;
  sources: string[];
  embedding?: number[];
  created_at: string;
}

export interface DBRejection {
  id: string;
  agentId: string;
  topic: string;
  reason_rejected: string;
  similarity_score?: number;
  created_at: string;
}

interface LocalDB {
  personas: Record<string, DBPersona>;
  posts: DBPost[];
  rejections: DBRejection[];
}

// Global in-memory singleton for serverless runtime resilience
declare global {
  var __GLOBAL_DB__: LocalDB | undefined;
}

function getTmpDbPath(): string {
  try {
    return path.join(os.tmpdir(), 'creator_os_db.json');
  } catch {
    return path.join(process.cwd(), '.data', 'db.json');
  }
}

function loadLocalDB(): LocalDB {
  if (globalThis.__GLOBAL_DB__) {
    return globalThis.__GLOBAL_DB__;
  }

  const tmpPath = getTmpDbPath();
  try {
    if (fs.existsSync(tmpPath)) {
      const data = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      globalThis.__GLOBAL_DB__ = data;
      return data;
    }
  } catch (e) {
    // Ignore read errors
  }

  const initial: LocalDB = { personas: {}, posts: [], rejections: [] };
  globalThis.__GLOBAL_DB__ = initial;
  return initial;
}

function saveLocalDB(data: LocalDB) {
  globalThis.__GLOBAL_DB__ = data;
  const tmpPath = getTmpDbPath();
  try {
    const dir = path.dirname(tmpPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Ignore write errors on read-only serverless file systems
  }
}

// Timeout wrapper set to 3000ms to allow Supabase queries to finish on serverless lambdas
async function withFastTimeout<T>(promiseLike: PromiseLike<T>, ms = 3000): Promise<T | null> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });

  try {
    const res = (await Promise.race([Promise.resolve(promiseLike), timeoutPromise])) as T | null;
    clearTimeout(timer!);
    return res;
  } catch {
    clearTimeout(timer!);
    return null;
  }
}

// Database helper operations
export async function getPersonaFromDB(agentId: string): Promise<DBPersona | null> {
  if (supabase) {
    const supabaseRes = await withFastTimeout(
      supabase.from('personas').select('*').eq('agentId', agentId).single()
    );
    if (supabaseRes && 'data' in supabaseRes && supabaseRes.data && !supabaseRes.error) {
      return supabaseRes.data as DBPersona;
    }
  }
  const db = loadLocalDB();
  return db.personas[agentId] || null;
}

export async function insertPersonaToDB(persona: Omit<DBPersona, 'agentId' | 'created_at'> & { agentId?: string }): Promise<DBPersona> {
  const agentId = persona.agentId || crypto.randomUUID();
  const created_at = new Date().toISOString();
  const newPersona: DBPersona = { ...persona, agentId, created_at };

  if (supabase) {
    const supabaseRes = await withFastTimeout(
      supabase.from('personas').insert([newPersona]).select().single()
    );
    if (supabaseRes && 'data' in supabaseRes && supabaseRes.data && !supabaseRes.error) {
      const db = loadLocalDB();
      db.personas[agentId] = newPersona;
      saveLocalDB(db);
      return supabaseRes.data as DBPersona;
    }
  }

  const db = loadLocalDB();
  db.personas[agentId] = newPersona;
  saveLocalDB(db);
  return newPersona;
}

export async function getPostsFromDB(agentId: string): Promise<DBPost[]> {
  if (supabase) {
    const supabaseRes = await withFastTimeout(
      supabase.from('posts').select('*').eq('agentId', agentId).order('created_at', { ascending: false })
    );
    if (supabaseRes && 'data' in supabaseRes && supabaseRes.data && !supabaseRes.error) {
      return supabaseRes.data as DBPost[];
    }
  }

  const db = loadLocalDB();
  return db.posts.filter((p) => p.agentId === agentId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function insertPostToDB(post: Omit<DBPost, 'id' | 'created_at'> & { id?: string }): Promise<DBPost> {
  const id = post.id || crypto.randomUUID();
  const created_at = new Date().toISOString();
  const newPost: DBPost = { ...post, id, created_at };

  if (supabase) {
    const supabaseRes = await withFastTimeout(
      supabase.from('posts').insert([newPost]).select().single()
    );
    if (supabaseRes && 'data' in supabaseRes && supabaseRes.data && !supabaseRes.error) {
      const db = loadLocalDB();
      db.posts.unshift(newPost);
      saveLocalDB(db);
      return supabaseRes.data as DBPost;
    }
  }

  const db = loadLocalDB();
  db.posts.unshift(newPost);
  saveLocalDB(db);
  return newPost;
}

export async function insertRejectionToDB(rejection: Omit<DBRejection, 'id' | 'created_at'> & { id?: string }): Promise<DBRejection> {
  const id = rejection.id || crypto.randomUUID();
  const created_at = new Date().toISOString();
  const newRejection: DBRejection = { ...rejection, id, created_at };

  if (supabase) {
    const supabaseRes = await withFastTimeout(
      supabase.from('rejections').insert([newRejection]).select().single()
    );
    if (supabaseRes && 'data' in supabaseRes && supabaseRes.data && !supabaseRes.error) {
      const db = loadLocalDB();
      db.rejections.unshift(newRejection);
      saveLocalDB(db);
      return supabaseRes.data as DBRejection;
    }
  }

  const db = loadLocalDB();
  db.rejections.unshift(newRejection);
  saveLocalDB(db);
  return newRejection;
}

export async function getRejectionsFromDB(agentId: string): Promise<DBRejection[]> {
  if (supabase) {
    const supabaseRes = await withFastTimeout(
      supabase.from('rejections').select('*').eq('agentId', agentId).order('created_at', { ascending: false })
    );
    if (supabaseRes && 'data' in supabaseRes && supabaseRes.data && !supabaseRes.error) {
      return supabaseRes.data as DBRejection[];
    }
  }

  const db = loadLocalDB();
  return db.rejections.filter((r) => r.agentId === agentId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getAllPersonasFromDB(): Promise<DBPersona[]> {
  if (supabase) {
    const supabaseRes = await withFastTimeout(
      supabase.from('personas').select('*')
    );
    if (supabaseRes && 'data' in supabaseRes && supabaseRes.data && !supabaseRes.error) {
      return supabaseRes.data as DBPersona[];
    }
  }

  const db = loadLocalDB();
  return Object.values(db.personas);
}
