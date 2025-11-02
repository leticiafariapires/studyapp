-- ===================================================================
-- EXECUTAR NO SUPABASE SQL EDITOR - TUDO DE UMA VEZ
-- ===================================================================

-- PARTE 1: Adicionar campo completed na tabela topics
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

COMMENT ON COLUMN topics.completed IS 'Indica se o tópico foi estudado e concluído';
COMMENT ON COLUMN topics.completed_at IS 'Data e hora em que o tópico foi marcado como concluído';

-- PARTE 2: Adicionar campo completed na tabela subject_topics (caso essa seja a usada)
ALTER TABLE subject_topics 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

ALTER TABLE subject_topics 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Copiar valores de is_completed para completed (se existir)
UPDATE subject_topics 
SET completed = is_completed 
WHERE is_completed IS NOT NULL AND is_completed = TRUE;

COMMENT ON COLUMN subject_topics.completed IS 'Indica se o tópico foi estudado e concluído';

-- PARTE 3: Adicionar campo peso nas matérias
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 3 CHECK (weight >= 1 AND weight <= 5);

COMMENT ON COLUMN subjects.weight IS 'Peso da matéria de 1 a 5, baseado na importância no edital';

-- PARTE 4: Criar tabela de revisões programadas
CREATE TABLE IF NOT EXISTS topic_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  completion_date TIMESTAMPTZ NOT NULL,
  revision_number INTEGER NOT NULL DEFAULT 1,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_topic_revisions_topic_id ON topic_revisions(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_revisions_workspace_id ON topic_revisions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_topic_revisions_scheduled_date ON topic_revisions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_topic_revisions_completed ON topic_revisions(completed);

-- RLS
ALTER TABLE topic_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own topic revisions" ON topic_revisions;
CREATE POLICY "Users can view their own topic revisions"
  ON topic_revisions FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own topic revisions" ON topic_revisions;
CREATE POLICY "Users can insert their own topic revisions"
  ON topic_revisions FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own topic revisions" ON topic_revisions;
CREATE POLICY "Users can update their own topic revisions"
  ON topic_revisions FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own topic revisions" ON topic_revisions;
CREATE POLICY "Users can delete their own topic revisions"
  ON topic_revisions FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- PARTE 5: Função para calcular revisões
CREATE OR REPLACE FUNCTION calculate_revision_schedule(
  p_topic_id UUID,
  p_workspace_id UUID,
  p_completion_date TIMESTAMPTZ,
  p_subject_weight INTEGER DEFAULT 3
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_intervals INTEGER[] := ARRAY[1, 3, 7, 15, 30, 60];
  v_interval INTEGER;
  v_revision_number INTEGER;
BEGIN
  DELETE FROM topic_revisions WHERE topic_id = p_topic_id;
  
  FOREACH v_interval IN ARRAY v_intervals
  LOOP
    v_revision_number := array_position(v_intervals, v_interval);
    
    IF p_subject_weight = 5 THEN
      v_interval := ROUND(v_interval * 0.8);
    ELSIF p_subject_weight = 4 THEN
      v_interval := ROUND(v_interval * 0.9);
    ELSIF p_subject_weight = 2 THEN
      v_interval := ROUND(v_interval * 1.1);
    ELSIF p_subject_weight = 1 THEN
      v_interval := ROUND(v_interval * 1.2);
    END IF;
    
    INSERT INTO topic_revisions (
      topic_id,
      workspace_id,
      completion_date,
      revision_number,
      scheduled_date
    ) VALUES (
      p_topic_id,
      p_workspace_id,
      p_completion_date,
      v_revision_number,
      p_completion_date + (v_interval || ' days')::INTERVAL
    );
  END LOOP;
END;
$$;

-- PARTE 6: Função trigger para topics
CREATE OR REPLACE FUNCTION create_revisions_on_topic_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_subject_weight INTEGER;
  v_workspace_id UUID;
BEGIN
  IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
    SELECT s.weight, s.workspace_id INTO v_subject_weight, v_workspace_id
    FROM subjects s
    WHERE s.id = NEW.subject_id;
    
    PERFORM calculate_revision_schedule(
      NEW.id,
      v_workspace_id,
      NOW(),
      COALESCE(v_subject_weight, 3)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- PARTE 7: Criar triggers
DROP TRIGGER IF EXISTS trigger_create_revisions ON topics;
CREATE TRIGGER trigger_create_revisions
  AFTER INSERT OR UPDATE OF completed
  ON topics
  FOR EACH ROW
  EXECUTE FUNCTION create_revisions_on_topic_completion();

DROP TRIGGER IF EXISTS trigger_create_revisions_subject_topics ON subject_topics;
CREATE TRIGGER trigger_create_revisions_subject_topics
  AFTER INSERT OR UPDATE OF completed
  ON subject_topics
  FOR EACH ROW
  EXECUTE FUNCTION create_revisions_on_topic_completion();

-- Comentários
COMMENT ON TABLE topic_revisions IS 'Revisões programadas baseadas na curva de Ebbinghaus';
COMMENT ON FUNCTION calculate_revision_schedule IS 'Calcula o cronograma de revisões espaçadas';
COMMENT ON FUNCTION create_revisions_on_topic_completion IS 'Cria automaticamente as revisões';

-- ===================================================================
-- FIM - Execute tudo e aguarde a mensagem de sucesso
-- ===================================================================
