-- CreatorOS / Persona Feed Agent - Supabase Vector Schema
-- Execute in Supabase SQL Editor:

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Personas table
CREATE TABLE IF NOT EXISTS personas (
  "agentId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  voice_description TEXT,
  editorial_criteria TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Posts table with pgvector(1536) for embeddings
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "agentId" UUID REFERENCES personas("agentId") ON DELETE CASCADE,
  text TEXT NOT NULL,
  rationale TEXT NOT NULL,
  sources TEXT[] NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Rejections table
CREATE TABLE IF NOT EXISTS rejections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "agentId" UUID REFERENCES personas("agentId") ON DELETE CASCADE,
  topic TEXT NOT NULL,
  reason_rejected TEXT NOT NULL,
  similarity_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
