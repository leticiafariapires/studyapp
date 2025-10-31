-- Criar tabela para provas, trabalhos e atividades das matérias
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

-- Remover referências a sessões de estudo para workspaces de faculdade
-- (As sessões continuam existindo para workspaces de concurso, mas não aparecem para faculdade)
