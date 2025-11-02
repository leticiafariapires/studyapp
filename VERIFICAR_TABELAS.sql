-- Execute este SQL para verificar quais tabelas existem no seu banco

-- 1. Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Ver estrutura da tabela topics (se existir)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'topics'
ORDER BY ordinal_position;

-- 3. Ver estrutura da tabela sessions (se existir)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- 4. Ver estrutura da tabela subjects
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subjects'
ORDER BY ordinal_position;

-- 5. Contar registros em topics
SELECT COUNT(*) as total_topics FROM topics;

-- 6. Contar registros em sessions
SELECT COUNT(*) as total_sessions FROM sessions;
