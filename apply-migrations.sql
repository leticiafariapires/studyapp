-- Script para aplicar todas as migrações necessárias para o Planner
-- Execute este arquivo no seu banco de dados Supabase

-- 1. Adicionar tipo 'planner' aos tipos de workspace permitidos
ALTER TABLE workspaces 
DROP CONSTRAINT IF EXISTS workspaces_type_check;

ALTER TABLE workspaces 
ADD CONSTRAINT workspaces_type_check 
CHECK (type IN ('concurso', 'faculdade', 'taf', 'planner', 'custom'));

-- 2. Criar tabela de categorias do planner
CREATE TABLE IF NOT EXISTS planner_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de tarefas do planner
CREATE TABLE IF NOT EXISTS planner_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES planner_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')) DEFAULT 'todo',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reminder_date TIMESTAMP WITH TIME ZONE,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de eventos do calendário
CREATE TABLE IF NOT EXISTS planner_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES planner_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_all_day BOOLEAN DEFAULT false,
  reminder_minutes INTEGER,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de notas
CREATE TABLE IF NOT EXISTS planner_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES planner_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  color TEXT DEFAULT '#fef3c7',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_planner_categories_workspace ON planner_categories(workspace_id);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_workspace ON planner_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_status ON planner_tasks(status);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_due_date ON planner_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_planner_events_workspace ON planner_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_planner_events_dates ON planner_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_planner_notes_workspace ON planner_notes(workspace_id);

-- Concluído! As tabelas do Planner foram criadas com sucesso.
