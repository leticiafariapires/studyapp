# ⚠️ Verificar Migração do Status

## Problema: Status não está sendo salvo

Se o status não está funcionando, provavelmente a **migração não foi executada** no banco de dados.

---

## ✅ Como Verificar e Corrigir

### 1. Verificar se a coluna status existe

No Supabase SQL Editor, execute:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'readings' 
AND column_name = 'status';
```

**Se retornar vazio**: A coluna não existe - você precisa executar a migração.

---

### 2. Executar a Migração

1. Acesse o SQL Editor do Supabase:
   - Link: https://supabase.com/dashboard/project/hyorgnnsyogqtttqoacf/sql/new

2. Abra o arquivo `supabase/migrations/002_add_reading_fields.sql`

3. Copie TODO o conteúdo:

```sql
-- Add new fields to readings table
ALTER TABLE readings 
ADD COLUMN IF NOT EXISTS read_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'quero_ler' CHECK (status IN ('quero_ler', 'lendo', 'lido'));

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_readings_status ON readings(status);
CREATE INDEX IF NOT EXISTS idx_readings_read_date ON readings(read_date DESC);
```

4. Cole no SQL Editor do Supabase

5. Clique em **Run** ou pressione `Ctrl+Enter`

6. Você deve ver: **Success. No rows returned**

---

### 3. Verificar se funcionou

Execute novamente:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'readings' 
AND column_name = 'status';
```

Agora deve retornar:
```
column_name | data_type
status      | text
```

---

### 4. Testar no App

Após executar a migração:

1. Recarregue a página do app (Ctrl+R)
2. Tente editar um livro e mudar o status
3. Verifique se o status foi salvo
4. Recarregue a página novamente - o status deve persistir

---

## 🔍 Logs de Debug

O código agora mostra logs no console do navegador:

1. Abra o Console do navegador (F12 > Console)
2. Edite um livro e mude o status
3. Você verá:
   - `Status changed to: lendo` (ou outro valor)
   - `Updating reading with status: lendo`
   - `Reading updated successfully: [...]`
   - `Updated status: lendo`

Se aparecer erro sobre coluna não encontrada, significa que a migração não foi executada.

---

## ✅ Migração Completa

Se quiser garantir que todas as migrações foram executadas, execute o arquivo:

`APLICAR_MIGRACOES_FACULDADE.sql`

Este arquivo contém todas as migrações necessárias.

---

**Depois de executar a migração, o status deve funcionar corretamente! 🎉**

