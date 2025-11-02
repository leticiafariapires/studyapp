-- Corrigir tabela de tópicos para usar o campo correto

-- 1. Adicionar campo completed na tabela subject_topics (se for essa que está sendo usada)
ALTER TABLE subject_topics 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

ALTER TABLE subject_topics 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 2. Copiar valores de is_completed para completed (se existir is_completed)
UPDATE subject_topics 
SET completed = is_completed 
WHERE is_completed IS NOT NULL;

-- 3. Comentários
COMMENT ON COLUMN subject_topics.completed IS 'Indica se o tópico foi estudado e concluído';
COMMENT ON COLUMN subject_topics.completed_at IS 'Data e hora em que o tópico foi marcado como concluído';

-- 4. Atualizar trigger para funcionar com subject_topics também
DROP TRIGGER IF EXISTS trigger_create_revisions_subject_topics ON subject_topics;
CREATE TRIGGER trigger_create_revisions_subject_topics
  AFTER INSERT OR UPDATE OF completed
  ON subject_topics
  FOR EACH ROW
  EXECUTE FUNCTION create_revisions_on_topic_completion();
