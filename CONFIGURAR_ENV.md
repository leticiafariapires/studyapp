# ⚙️ Configuração Rápida do .env.local

## 🚨 ERRO: "Failed to fetch" ou "Supabase URL and API key are required"

Este erro acontece porque o arquivo `.env.local` não está configurado.

---

## 📝 Passo a Passo

### 1. Verificar se o arquivo existe

Na raiz do projeto (`c:\Users\leticia\CursorProjects\MyApp\studyapp`), verifique se existe o arquivo `.env.local`.

Se **NÃO existir**, crie um novo arquivo chamado `.env.local` (sem extensão).

---

### 2. Obter as credenciais do Supabase

#### 2.1. Criar projeto (se ainda não tiver)

1. Acesse: https://supabase.com
2. Faça login (pode usar GitHub)
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: Ex: `study-app`
   - **Database Password**: Crie uma senha forte (ANOTE ELA!)
   - **Region**: Escolha a mais próxima (ex: `South America`)
5. Clique em **"Create new project"**
6. Aguarde 2-3 minutos até provisionar

#### 2.2. Obter as credenciais

No projeto criado:

1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Uma chave que começa com `eyJhbGc...`
   - **service_role key**: Uma chave secreta (role) que começa com `eyJhbGc...`

**⚠️ IMPORTANTE**: Copie esses valores!

---

### 3. Configurar o arquivo `.env.local`

Abra o arquivo `.env.local` na raiz do projeto e cole o seguinte conteúdo:

```env
# SUPABASE - OBRIGATÓRIO
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO-AQUI.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.COLE-A-ANON-KEY-AQUI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.COLE-A-SERVICE-ROLE-KEY-AQUI

# APP URL - NÃO ALTERE (para desenvolvimento)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ISBNdb API - OPCIONAL (não é necessário, o app funciona sem)
ISBNDB_API_KEY=
```

**Substitua:**
- `https://SEU-PROJETO-AQUI.supabase.co` → Cole o **Project URL** do Supabase
- `eyJhbGc...` (primeira) → Cole o **anon public key**
- `eyJhbGc...` (segunda) → Cole o **service_role key**

**Exemplo real:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ ATENÇÃO:**
- Não deixe espaços antes ou depois do `=`
- Não use aspas (a menos que o valor tenha espaços)
- Salve o arquivo

---

### 4. Configurar o banco de dados

Após configurar o `.env.local`, você precisa criar as tabelas no Supabase:

1. No painel do Supabase, vá em **SQL Editor**
2. Execute as migrações na ordem:

**Opção 1 - Migrações individuais:**
- Execute `supabase/migrations/001_initial_schema.sql`
- Execute `supabase/migrations/002_add_reading_fields.sql`
- Continue com as outras na ordem

**Opção 2 - Migração consolidada:**
- Execute o arquivo `APLICAR_MIGRACOES_FACULDADE.sql` (faz tudo de uma vez)

**Como executar:**
1. Copie todo o conteúdo do arquivo SQL
2. Cole no SQL Editor do Supabase
3. Clique em **Run** ou pressione `Ctrl+Enter`

---

### 5. Reiniciar o servidor

Após configurar o `.env.local`:

1. **Pare o servidor** (se estiver rodando):
   - Pressione `Ctrl+C` no terminal

2. **Inicie novamente**:
   ```bash
   npm run dev
   ```

3. **Aguarde alguns segundos** até ver:
   ```
   ✓ Ready in Xs
   - Local: http://localhost:3000
   ```

4. **Abra o navegador** em: `http://localhost:3000`

---

### 6. Criar a primeira conta

1. Na página inicial, clique em **"Criar conta"** ou vá em `/auth/register`
2. Preencha:
   - Email
   - Senha (mínimo 6 caracteres)
3. Clique em **"Criar conta"**

---

## ❌ Problemas Comuns

### "Failed to fetch"
- ✅ Verifique se o `.env.local` existe na raiz do projeto
- ✅ Verifique se as variáveis estão corretas (sem espaços extras)
- ✅ Reinicie o servidor após criar/editar o `.env.local`
- ✅ Verifique se a URL do Supabase está correta

### "Invalid API key"
- ✅ Verifique se copiou o **anon public key** corretamente
- ✅ Não confunda com a **service_role key**
- ✅ A chave deve começar com `eyJhbGc...`

### Erro no login/cadastro
- ✅ Execute as migrações SQL no Supabase
- ✅ Verifique se o projeto Supabase está ativo
- ✅ Verifique a senha do banco (se esquecer, precisa recriar o projeto)

---

## ✅ Checklist

Antes de testar, verifique:

- [ ] Arquivo `.env.local` criado na raiz do projeto
- [ ] `NEXT_PUBLIC_SUPABASE_URL` preenchido com a URL do projeto
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` preenchido com a anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` preenchido com a service role key
- [ ] Arquivo salvo (sem extensão `.txt`)
- [ ] Migrações SQL executadas no Supabase
- [ ] Servidor reiniciado após configurar o `.env.local`

---

## 🆘 Ainda com problemas?

1. Verifique o console do navegador (F12 > Console)
2. Verifique o terminal onde o servidor está rodando
3. Confirme que o arquivo `.env.local` está na mesma pasta que `package.json`

---

**Boa sorte! 🚀**

