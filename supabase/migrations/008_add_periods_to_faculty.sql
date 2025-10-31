-- Criar tabela de períodos/semestres para workspaces de faculdade
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
