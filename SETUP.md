# Setup do Projeto Study Manager

## Problema: Erro ao executar npm no PowerShell

Se você receber o erro:
```
npm : O arquivo C:\Program Files\nodejs\npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada
```

### Solução 1: Executar no CMD
Abra o **Prompt de Comando (cmd.exe)** ao invés do PowerShell:

```bash
cd "c:\Users\leticia pires\CascadeProjects\windsurf-project"
npm install
```

### Solução 2: Habilitar scripts no PowerShell
Abra o PowerShell como **Administrador** e execute:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Depois execute normalmente:
```bash
npm install
```

## Passos Completos de Setup

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

#### 2.1 Criar projeto
1. Acesse https://supabase.com
2. Crie novo projeto (tier gratuito)
3. Aguarde provisionamento

#### 2.2 Executar Migration
1. No painel Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase/migrations/001_initial_schema.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**

#### 2.3 Obter credenciais
1. Vá em **Project Settings** > **API**
2. Copie:
   - URL
   - anon/public key
   - service_role key (secret)

### 3. Obter Chave ISBNdb

1. Acesse https://isbndb.com/isbn-database
2. Crie conta gratuita (500 requests/mês)
3. No dashboard, copie a **API Key**

### 4. Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ISBNDB_API_KEY=12345_abcdef...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Executar Localmente

```bash
npm run dev
```

Abra http://localhost:3000

### 6. Criar Ícones PWA (opcional)

Para PWA funcional, crie dois ícones na pasta `public/`:
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

Use ferramentas online como https://realfavicongenerator.net

## Deploy na Vercel

### 1. Push para GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/study-manager.git
git push -u origin main
```

### 2. Deploy

1. Acesse https://vercel.com
2. Clique **New Project**
3. Importe o repositório
4. Configure variáveis de ambiente:
   - Copie todas do `.env.local`
   - Cole em **Environment Variables**
5. Clique **Deploy**

### 3. Atualizar URL em produção

Após deploy, atualize a variável:
```
NEXT_PUBLIC_APP_URL=https://study-manager.vercel.app
```

## Testes

```bash
# Unit tests
npm test

# E2E tests (após instalar Playwright)
npx playwright install
npm run test:e2e
```

## Estrutura de Dados

Consulte `supabase/migrations/001_initial_schema.sql` para schema completo.

Principais tabelas:
- `user_profiles` - Perfis de usuário
- `workspaces` - Ambientes de estudo
- `subjects` - Matérias
- `topics` - Tópicos hierárquicos
- `questions` - Questões de concurso
- `readings` - Leituras/livros
- `taf_trainings` - Treinos TAF
- `sessions` - Sessões de estudo/treino

## Problemas Comuns

### CORS errors no ISBNdb
Certifique-se de que a API key está correta em `.env.local`

### Auth não funciona
1. Verifique se as credenciais Supabase estão corretas
2. Confira se a migration foi executada
3. Verifique RLS policies no Supabase

### Build error no Vercel
1. Confirme que todas as variáveis de ambiente foram configuradas
2. Verifique logs de build no dashboard Vercel

## Suporte

Consulte a documentação:
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- ISBNdb: https://isbndb.com/isbndb-api-documentation-v2
