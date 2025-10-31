# Study Manager

Aplicativo de gestão de estudos multi-workflow para concursos, faculdade e treinos TAF.

## Stack Tecnológica

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: TailwindCSS + shadcn/ui + Lucide Icons
- **Backend**: Supabase (Auth + Postgres + Storage)
- **PWA**: next-pwa para Progressive Web App
- **Charts**: Recharts
- **Deploy**: Vercel (frontend) + Supabase (backend)

## Funcionalidades

### Workspaces Multi-Tipo
- Criar workspaces ilimitados (Concurso, Faculdade, TAF, Custom)
- Alternar entre diferentes contextos de estudo
- Dashboard personalizado por workspace

### Workflow Concurso
- Gestão de matérias e tópicos hierárquicos
- Banco de questões com filtros avançados
- Estatísticas de acerto por matéria/tópico
- Geração de simulados

### Workflow Faculdade
- Registro de leituras com busca por ISBN (ISBNdb API)
- Avaliações e resenhas de livros
- Gestão de matérias e períodos

### Workflow TAF
- Registro de treinos (corrida, força, circuito)
- Cálculos automáticos (pace, velocidade média)
- Gráficos de evolução mensal

## Setup Local

### Pré-requisitos
- Node.js 18+
- Conta Supabase (gratuita)
- Chave API ISBNdb

### 1. Clonar e Instalar

```bash
git clone <repository-url>
cd study-manager

# Instalar dependências
npm install
```

### 2. Configurar Supabase

1. Criar projeto em https://supabase.com
2. Executar migration em SQL Editor:
```bash
# Copiar conteúdo de supabase/migrations/001_initial_schema.sql
# Colar no SQL Editor do Supabase e executar
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ISBNDB_API_KEY=your-isbndb-key
```

### 4. Obter Chave ISBNdb

1. Criar conta em https://isbndb.com/isbn-database
2. Copiar API Key do painel
3. Adicionar em `.env.local`

### 5. Executar Localmente

```bash
npm run dev
```

Abrir http://localhost:3000

## Deploy na Vercel

### 1. Preparar Projeto

```bash
git push origin main
```

### 2. Deploy

1. Acessar https://vercel.com
2. Importar projeto do Git
3. Configurar variáveis de ambiente (mesmas do .env.local)
4. Deploy

## Estrutura do Projeto

```
app/
├── api/           # API routes (ISBN, export)
├── auth/          # Login/Register
├── dashboard/     # Dashboard principal
└── workspaces/    # Gestão de workspaces
components/ui/     # Componentes shadcn/ui
lib/
├── supabase/      # Clients Supabase
├── utils.ts       # Utilitários
└── types.ts       # TypeScript types
supabase/
└── migrations/    # SQL migrations
```

## Licença

MIT
