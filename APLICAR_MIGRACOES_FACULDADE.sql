-- ========================================
-- MIGRAÇÃO COMPLETA - FACULDADE
-- Execute este arquivo completo no Supabase SQL Editor
-- ========================================

-- ========================================
-- 1. CRIAR TABELAS FACULDADE (Tópicos, Leituras, Anotações)
-- ========================================

-- Tabela de tópicos/temas das aulas
CREATE TABLE IF NOT EXISTS faculty_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  class_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leituras sugeridas
CREATE TABLE IF NOT EXISTS faculty_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  type TEXT CHECK (type IN ('book', 'article', 'paper', 'website', 'other')) DEFAULT 'book',
  url TEXT,
  isbn TEXT,
  pages TEXT,
  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anotações/notas de estudo
CREATE TABLE IF NOT EXISTS faculty_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_faculty_topics_subject ON faculty_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_faculty_topics_date ON faculty_topics(class_date);
CREATE INDEX IF NOT EXISTS idx_faculty_readings_subject ON faculty_readings(subject_id);
CREATE INDEX IF NOT EXISTS idx_faculty_readings_status ON faculty_readings(is_completed);
CREATE INDEX IF NOT EXISTS idx_faculty_notes_subject ON faculty_notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_faculty_notes_important ON faculty_notes(is_important);

-- ========================================
-- 2. REMOVER TIPO 'CUSTOM' DOS WORKSPACES
-- ========================================

ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS workspaces_type_check;

ALTER TABLE workspaces ADD CONSTRAINT workspaces_type_check 
CHECK (type IN ('concurso', 'faculdade', 'taf', 'planner'));

-- ========================================
-- 3. CRIAR ESTRUTURA DE PERÍODOS/SEMESTRES
-- ========================================

-- Criar tabela de períodos/semestres
CREATE TABLE IF NOT EXISTS faculty_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna period_id na tabela subjects
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS period_id UUID REFERENCES faculty_periods(id) ON DELETE SET NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_faculty_periods_workspace ON faculty_periods(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subjects_period ON subjects(period_id);

-- Garantir que apenas um período seja atual por workspace
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_current_period_per_workspace 
ON faculty_periods(workspace_id) 
WHERE is_current = true;

-- ========================================
-- 4. CRIAR TABELA DE AVALIAÇÕES (Provas, Trabalhos, Atividades)
-- ========================================

CREATE TABLE IF NOT EXISTS faculty_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('exam', 'assignment', 'project', 'quiz', 'presentation', 'other')) DEFAULT 'exam',
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  weight DECIMAL(5,2), -- Peso da avaliação (ex: 0.30 para 30%)
  grade DECIMAL(5,2), -- Nota obtida
  max_grade DECIMAL(5,2) DEFAULT 10.0, -- Nota máxima
  status TEXT CHECK (status IN ('pending', 'completed', 'graded')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_subject ON faculty_assessments(subject_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_due_date ON faculty_assessments(due_date);
CREATE INDEX IF NOT EXISTS idx_faculty_assessments_type ON faculty_assessments(type);

-- ========================================
-- PRONTO! 
-- ========================================
-- Agora você pode usar todas as funcionalidades da Faculdade:
-- - Tópicos
-- - Leituras Sugeridas
-- - Anotações
-- - Avaliações (Provas, Trabalhos, Projetos)
-- - Períodos/Semestres (opcional)
-- 
-- Tipo "Personalizado" foi removido
-- Apenas tipos permitidos: concurso, faculdade, taf, planner
-- ========================================
