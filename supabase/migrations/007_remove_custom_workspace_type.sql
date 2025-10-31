-- Remover tipo 'custom' dos workspaces permitidos
-- Manter apenas: concurso, faculdade, taf, planner

ALTER TABLE workspaces 
DROP CONSTRAINT IF EXISTS workspaces_type_check;

ALTER TABLE workspaces 
ADD CONSTRAINT workspaces_type_check 
CHECK (type IN ('concurso', 'faculdade', 'taf', 'planner'));
