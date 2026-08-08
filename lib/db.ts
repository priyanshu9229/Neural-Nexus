import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

// In-Memory & Local Disk fallback when Supabase is initializing
const LOCAL_DATA_DIR = path.join(process.cwd(), '.data');
const LOCAL_DB_FILE = path.join(LOCAL_DATA_DIR, 'db.json');

interface LocalDB {
  personas: Record<string, DBPersona>;
  posts: DBPost[];
  rejections: DBRejection[];
}

function loadLocalDB(): LocalDB {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LOCAL_DB_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading local DB:', e);
  }
  return { personas: {}, posts: [], rejections: [] };
}

function saveLocalDB(data: LocalDB) {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local DB:', e);
  }
}

// Database helper operations
export async function getPersonaFromDB(agentId: string): Promise<DBPersona | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('agentId', agentId)
      .single();
    if (data && !error) return data as DBPersona;
  }
  const db = loadLocalDB();
  return db.personas[agentId] || null;
}

export async function insertPersonaToDB(persona: Omit<DBPersona, 'agentId' | 'created_at'> & { agentId?: string }): Promise<DBPersona> {
  const agentId = persona.agentId || crypto.randomUUID();
  const created_at = new Date().toISOString();
  const newPersona: DBPersona = { ...persona, agentId, created_at };

  if (supabase) {
    const { data, error } = await supabase
      .from('personas')
      .insert([newPersona])
      .select()
      .single();
    if (data && !error) return data as DBPersona;
  }

  const db = loadLocalDB();
  db.personas[agentId] = newPersona;
  saveLocalDB(db);
  return newPersona;
}

export async function getPostsFromDB(agentId: string): Promise<DBPost[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('id, agentId, text, rationale, sources, created_at')
      .eq('agentId', agentId)
      .order('created_at', { ascending: false });
    if (data && !error) return data as DBPost[];
  }

  const db = loadLocalDB();
  return db.posts
    .filter((p) => p.agentId === agentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function insertPostToDB(post: Omit<DBPost, 'id' | 'created_at'> & { id?: string }): Promise<DBPost> {
  const id = post.id || crypto.randomUUID();
  const created_at = new Date().toISOString();
  const newPost: DBPost = { ...post, id, created_at };

  if (supabase) {
    const { data, error } = await supabase.from('posts').insert([newPost]).select().single();
    if (data && !error) return data as DBPost;
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
    const { data, error } = await supabase.from('rejections').insert([newRejection]).select().single();
    if (data && !error) return data as DBRejection;
  }

  const db = loadLocalDB();
  db.rejections.unshift(newRejection);
  saveLocalDB(db);
  return newRejection;
}

export async function getRejectionsFromDB(agentId: string): Promise<DBRejection[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('rejections')
      .select('*')
      .eq('agentId', agentId)
      .order('created_at', { ascending: false });
    if (data && !error) return data as DBRejection[];
  }

  const db = loadLocalDB();
  return db.rejections
    .filter((r) => r.agentId === agentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getAllPersonasFromDB(): Promise<DBPersona[]> {
  if (supabase) {
    const { data, error } = await supabase.from('personas').select('*');
    if (data && !error) return data as DBPersona[];
  }

  const db = loadLocalDB();
  return Object.values(db.personas);
}
