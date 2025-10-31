-- Criar tabelas para funcionalidades de matérias da faculdade

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
CREATE INDEX IF NOT EXISTS idx_faculty_readings_status ON faculty_readings(status);
CREATE INDEX IF NOT EXISTS idx_faculty_notes_subject ON faculty_notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_faculty_notes_important ON faculty_notes(is_important);
