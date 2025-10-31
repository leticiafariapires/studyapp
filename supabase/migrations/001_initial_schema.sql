-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  prefs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('concurso', 'faculdade', 'taf', 'custom')),
  active BOOLEAN DEFAULT true,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects (Matérias)
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics (Tópicos) - hierarchical
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions (Questões)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  statement TEXT NOT NULL,
  choices JSONB DEFAULT '[]'::jsonb,
  answer_correct INTEGER,
  answer_user INTEGER,
  spent_seconds INTEGER DEFAULT 0,
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Readings (Leituras)
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  isbn TEXT,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  cover_url TEXT,
  stars INTEGER CHECK (stars >= 0 AND stars <= 5),
  review TEXT,
  comments TEXT,
  date_published TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAF Trainings (Treinos TAF)
CREATE TABLE taf_trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  training_date DATE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('caminhada', 'corrida', 'circuito', 'forca')),
  distance_m INTEGER DEFAULT 0,
  time_s INTEGER DEFAULT 0,
  modality TEXT DEFAULT 'na',
  pushups INTEGER DEFAULT 0,
  situps INTEGER DEFAULT 0,
  bar_time_s INTEGER DEFAULT 0,
  jump_cm INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Sessions (Sessões de estudo/treino)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('study', 'reading', 'training')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE taf_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for workspaces
CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for subjects
CREATE POLICY "Users can view subjects from own workspaces"
  ON subjects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = subjects.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert subjects in own workspaces"
  ON subjects FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = subjects.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update subjects in own workspaces"
  ON subjects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = subjects.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete subjects in own workspaces"
  ON subjects FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = subjects.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

-- RLS Policies for topics
CREATE POLICY "Users can view topics from own workspaces"
  ON topics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM subjects
    JOIN workspaces ON workspaces.id = subjects.workspace_id
    WHERE subjects.id = topics.subject_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert topics in own workspaces"
  ON topics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM subjects
    JOIN workspaces ON workspaces.id = subjects.workspace_id
    WHERE subjects.id = topics.subject_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update topics in own workspaces"
  ON topics FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM subjects
    JOIN workspaces ON workspaces.id = subjects.workspace_id
    WHERE subjects.id = topics.subject_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete topics in own workspaces"
  ON topics FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM subjects
    JOIN workspaces ON workspaces.id = subjects.workspace_id
    WHERE subjects.id = topics.subject_id
    AND workspaces.owner_id = auth.uid()
  ));

-- RLS Policies for questions
CREATE POLICY "Users can view questions from own workspaces"
  ON questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = questions.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert questions in own workspaces"
  ON questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = questions.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update questions in own workspaces"
  ON questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = questions.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete questions in own workspaces"
  ON questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = questions.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

-- RLS Policies for readings
CREATE POLICY "Users can view readings from own workspaces"
  ON readings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = readings.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert readings in own workspaces"
  ON readings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = readings.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update readings in own workspaces"
  ON readings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = readings.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete readings in own workspaces"
  ON readings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = readings.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

-- RLS Policies for taf_trainings
CREATE POLICY "Users can view taf_trainings from own workspaces"
  ON taf_trainings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = taf_trainings.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert taf_trainings in own workspaces"
  ON taf_trainings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = taf_trainings.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update taf_trainings in own workspaces"
  ON taf_trainings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = taf_trainings.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete taf_trainings in own workspaces"
  ON taf_trainings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workspaces
    WHERE workspaces.id = taf_trainings.workspace_id
    AND workspaces.owner_id = auth.uid()
  ));

-- RLS Policies for sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_subjects_workspace ON subjects(workspace_id);
CREATE INDEX idx_topics_subject ON topics(subject_id);
CREATE INDEX idx_questions_workspace ON questions(workspace_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_readings_workspace ON readings(workspace_id);
CREATE INDEX idx_taf_trainings_workspace ON taf_trainings(workspace_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_workspace ON sessions(workspace_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_readings_updated_at BEFORE UPDATE ON readings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taf_trainings_updated_at BEFORE UPDATE ON taf_trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
