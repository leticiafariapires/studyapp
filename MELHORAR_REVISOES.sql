-- ===================================================================
-- MELHORAR LÓGICA DE REVISÕES
-- Baseado em: Edital AOCP - Polícia Penal MG 2025
-- ===================================================================

-- Atualizar função com intervalos mais inteligentes
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
  v_intervals INTEGER[];
  v_interval INTEGER;
  v_revision_number INTEGER;
  v_multiplier NUMERIC;
BEGIN
  -- Intervalos base adaptados para concursos (Ebbinghaus + prática de concursos)
  -- Peso 5: Direito Penal, Constitucional (caem muito na AOCP)
  -- Peso 4: Legislação Específica, Criminologia
  -- Peso 3: Conhecimentos Gerais
  -- Peso 2-1: Matérias complementares
  
  -- Intervalos otimizados para retenção de longo prazo em concursos
  v_intervals := CASE 
    WHEN p_subject_weight = 5 THEN ARRAY[1, 3, 7, 14, 21, 30, 45, 60] -- Muito importante: 8 revisões
    WHEN p_subject_weight = 4 THEN ARRAY[1, 3, 7, 15, 30, 45, 60]     -- Importante: 7 revisões
    WHEN p_subject_weight = 3 THEN ARRAY[2, 7, 15, 30, 60]            -- Normal: 5 revisões
    WHEN p_subject_weight = 2 THEN ARRAY[3, 10, 30, 60]               -- Menos importante: 4 revisões
    ELSE ARRAY[7, 30, 60]                                               -- Peso 1: 3 revisões
  END;
  
  -- Limpar revisões antigas do tópico
  DELETE FROM topic_revisions WHERE topic_id = p_topic_id;
  
  -- Criar revisões programadas
  v_revision_number := 1;
  FOREACH v_interval IN ARRAY v_intervals
  LOOP
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
    
    v_revision_number := v_revision_number + 1;
  END LOOP;
END;
$$;

-- Adicionar campo para prioridade da revisão
ALTER TABLE topic_revisions 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' 
CHECK (priority IN ('low', 'normal', 'high', 'critical'));

-- Atualizar prioridade baseado na proximidade da data
CREATE OR REPLACE FUNCTION update_revision_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_days_until INTEGER;
BEGIN
  v_days_until := EXTRACT(DAY FROM (NEW.scheduled_date - NOW()));
  
  NEW.priority := CASE
    WHEN v_days_until < 0 THEN 'critical'  -- Atrasada
    WHEN v_days_until = 0 THEN 'high'      -- Hoje
    WHEN v_days_until <= 2 THEN 'high'     -- Próximos 2 dias
    WHEN v_days_until <= 7 THEN 'normal'   -- Próxima semana
    ELSE 'low'                              -- Mais de 1 semana
  END;
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar prioridade automaticamente
DROP TRIGGER IF EXISTS trigger_update_revision_priority ON topic_revisions;
CREATE TRIGGER trigger_update_revision_priority
  BEFORE INSERT OR UPDATE
  ON topic_revisions
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_priority();

-- Comentários
COMMENT ON COLUMN topic_revisions.priority IS 'Prioridade da revisão: critical (atrasada), high (hoje/próximos 2 dias), normal (semana), low (>1 semana)';
COMMENT ON FUNCTION calculate_revision_schedule IS 'Calcula revisões otimizadas para concursos (peso 5 = 8 revisões, peso 1 = 3 revisões)';

-- ===================================================================
-- EXECUTAR NO SUPABASE
-- ===================================================================
