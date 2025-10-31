# 📋 Passo a Passo: Executar Migração do Status

## ⚠️ AVISO RECEBIDO

Você recebeu o aviso: **"A coluna 'status' não existe no banco"**

Isso significa que você precisa executar a migração no Supabase.

---

## ✅ SOLUÇÃO RÁPIDA

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: **https://supabase.com/dashboard/project/hyorgnnsyogqtttqoacf/sql/new**
2. Ou manualmente:
   - Acesse: https://supabase.com/dashboard
   - Faça login (se necessário)
   - Clique no seu projeto
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

---

### Passo 2: Copiar o SQL da Migração

Abra o arquivo `supabase/migrations/002_add_reading_fields.sql` e copie TODO o conteúdo:

```sql
-- Add new fields to readings table
ALTER TABLE readings 
ADD COLUMN IF NOT EXISTS read_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'quero_ler' CHECK (status IN ('quero_ler', 'lendo', 'lido'));

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_readings_status ON readings(status);
CREATE INDEX IF NOT EXISTS idx_readings_read_date ON readings(read_date DESC);
```

---

### Passo 3: Colar e Executar no Supabase

1. Cole o SQL acima no SQL Editor do Supabase
2. Clique em **Run** ou pressione `Ctrl+Enter`
3. Você deve ver: **Success. No rows returned**

---

### Passo 4: Verificar se Funcionou

Execute esta query para confirmar:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'readings' 
AND column_name IN ('status', 'read_date');
```

Você deve ver 2 linhas:
- `status` | `text` | `'quero_ler'`
- `read_date` | `date` | `NULL`

---

### Passo 5: Testar no App

1. Recarregue a página do app (Ctrl+R ou F5)
2. O aviso não deve mais aparecer
3. Edite um livro e mude o status
4. Salve e verifique se o status foi salvo
5. Recarregue a página - o status deve persistir

---

## 🔍 Se Ainda Não Funcionar

### Verificar se a tabela readings existe:

```sql
SELECT * FROM readings LIMIT 1;
```

Se retornar erro, você precisa executar a migração principal primeiro:
`supabase/migrations/001_initial_schema.sql`

---

### Executar TODAS as Migrações (Recomendado)

Se você ainda não executou as migrações, execute o arquivo completo:

**Arquivo**: `APLICAR_MIGRACOES_FACULDADE.sql`

Este arquivo contém todas as migrações necessárias, incluindo a criação da tabela `readings` e os campos `status` e `read_date`.

---

## ✅ Checklist

Antes de testar, confirme:

- [ ] SQL foi executado no Supabase SQL Editor
- [ ] Mensagem de sucesso apareceu ("Success. No rows returned")
- [ ] Query de verificação retorna as colunas `status` e `read_date`
- [ ] Página do app foi recarregada
- [ ] Tenteu editar um livro e mudar o status
- [ ] Status foi salvo e persistiu após recarregar

---

## 🎉 Após Executar a Migração

O status deve funcionar corretamente:
- ✅ Você poderá escolher entre: Quero Ler, Lendo, Já Lido
- ✅ O status será salvo no banco de dados
- ✅ Os livros serão organizados por status
- ✅ O status persistirá após recarregar a página

---

**Execute a migração e me avise se funcionou! 🚀**

