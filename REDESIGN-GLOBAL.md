# Redesign Global do App - StudyApp

## 🎨 Novo Sistema de Design

### Princípios do Novo Design:
1. **Sem gradientes de fundo** - Fundo limpo (gray-50)
2. **Banners coloridos** - Gradientes apenas em headers de destaque
3. **Layout pelo sistema de Layout** - Sidebar + Header sempre visíveis
4. **Cores com significado** - Cada stat tem cor específica
5. **Números em destaque** - Stats com valores grandes e fáceis de ler
6. **Sem Circular Progress** - Substituído por cards diretos

---

## 📄 Páginas Redesenhadas

### ✅ 1. Home do Workspace (`/workspaces/[id]/page.tsx`)
**Novo Layout:**
- Banner de boas-vindas com gradiente
- Card de streak com emojis 🔥
- Stats rápidos com gradientes coloridos
- Revisões programadas (para concurso)
- Tarefas da semana (para planner)

**Removido:**
- Circular progress
- Welcome message verde
- Sidebar direita com quiz/tarefas mockadas
- Próximas aulas/sessões mockadas

### ✅ 2. Dashboard Principal (`/dashboard/page.tsx`)
**Atualizado:**
- Cards de workspace com gradientes
- Hover effects melhorados
- Botões azuis (não mais verde)
- Layout mais limpo

### ✅ 3. Subjects/Matérias (`/workspaces/[id]/subjects/page.tsx`)
**Já adaptado:**
- Sem background gradient
- Header com título e descrição
- Sem botão "Voltar" (usa sidebar)
- Campo peso (1-5) para revisões

### ✅ 4. Topics/Tópicos (`/workspaces/[id]/subjects/[id]/topics/page.tsx`)
**Redesenhado:**
- Banner colorido com nome da matéria
- Barra de progresso horizontal
- Sem background gradient
- Cards limpos

### ⏳ 5. Readings/Leituras (`/workspaces/[id]/readings/page.tsx`)
**Status:** Grid reduzido (mais colunas para livros menores)
**Precisa:** Aplicar novo header

### ⏳ 6. Reports/Relatórios (`/workspaces/[id]/reports/page.tsx`)
**Status:** Existe mas não redesenhada ainda
**Precisa:** Aplicar novo layout

### ⏳ 7. Study Sessions (`/workspaces/[id]/study-sessions/page.tsx`)
**Status:** Não redesenhada
**Precisa:** Aplicar novo layout

### ⏳ 8. Trainings/Treinos (`/workspaces/[id]/trainings/page.tsx`)
**Status:** Não redesenhada
**Precisa:** Aplicar novo layout

---

## 🎨 Paleta de Cores Atualizada

### Cor Primária: AZUL
- Primary: `#3b82f6` (blue-500)
- Hover: `#2563eb` (blue-600)
- Light: `#dbeafe` (blue-50)

### Cores por Tipo:
- **Progresso**: Azul (`from-blue-50 to-blue-100`)
- **Acertos/Sucesso**: Roxo (`from-purple-50 to-purple-100`)
- **Completado**: Verde (`from-green-50 to-green-100`)
- **Atrasado/Urgente**: Vermelho (`from-red-50 to-red-100`)
- **Streak**: Laranja (🔥 emoji)

### Gradientes de Banner:
```css
bg-gradient-to-r from-blue-500 to-purple-600
```

---

## 📐 Estrutura de Layout Padrão

### Header da Página:
```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
  <h2 className="text-2xl font-bold mb-2">Título da Página</h2>
  <p className="text-blue-50">Descrição</p>
</div>
```

### Stats Cards:
```tsx
<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-blue-700">Label</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-blue-900">Valor</div>
    <p className="text-xs text-blue-600 mt-1">Subtítulo</p>
  </CardContent>
</Card>
```

### Lista de Items:
- Cards brancos com sombra suave
- Hover effect
- Border radius `rounded-lg`
- Padding `p-4`

---

## 🔧 Componentes Compartilhados

### 1. WorkspaceLayout (`/workspaces/[id]/layout.tsx`)
- Sidebar fixa à esquerda
- Header fixo no topo
- Conteúdo com padding p-8

### 2. WorkspaceHeader (`components/workspace-header.tsx`)
- Avatar azul (não verde)
- Notificações
- Nome do usuário

### 3. WorkspaceSidebar (`components/workspace-sidebar.tsx`)
- Menu contextual por tipo
- Item ativo em azul
- Logo com gradiente azul

### 4. RevisionTracker (`components/revision-tracker.tsx`)
- Sempre visível (loading/empty/data)
- Query em 3 etapas separadas
- Cores por urgência

### 5. StatCard (`components/stat-card.tsx`)
- Sem progress ring (removido)
- Ícone + título + valor + subtitle

### 6. StreakTracker (`components/streak-tracker.tsx`)
- Mantido, mas agora inline na home
- Emojis 🔥

---

## ✨ Funcionalidades Novas

### 1. Sistema de Revisão Espaçada
- Baseado em Ebbinghaus (1, 3, 7, 15, 30, 60 dias)
- Trigger automático ao concluir tópico
- Ajuste por peso da matéria (1-5)
- Tabela `topic_revisions`

### 2. Peso das Matérias
- Campo `weight` (1-5) em `subjects`
- Influencia frequência de revisões
- Seletor visual no formulário

### 3. Dashboard do Planner
- Taxa de conclusão
- Tarefas atrasadas
- Tarefas de hoje
- Lista de próximas tarefas

---

## 📋 Checklist de Migração (Para Outras Páginas)

Para adaptar uma página ao novo design:

- [ ] Remover `min-h-screen bg-gradient-to-br`
- [ ] Remover `container mx-auto px-4 py-8`
- [ ] Remover botão "Voltar" 
- [ ] Usar `<>...</>` como wrapper principal
- [ ] Adicionar banner colorido no topo (opcional)
- [ ] Usar cards brancos com sombras
- [ ] Botões com `bg-blue-500 hover:bg-blue-600`
- [ ] Stats com gradientes coloridos
- [ ] Headers com `text-2xl font-bold`
- [ ] Descrições com `text-gray-600 dark:text-gray-400`

---

## 🚀 Próximos Passos

1. **Aplicar template nas páginas restantes:**
   - Study Sessions
   - Questions
   - Readings (header)
   - Faculty Calendar
   - Planner subpages
   - Reports

2. **Melhorias de UX:**
   - Animações suaves
   - Loading states
   - Empty states
   - Error handling

3. **Mobile:**
   - Menu hambúrguer para sidebar
   - Bottom navigation
   - Touch gestures

---

**Status Geral:** 🚧 50% completo
**Última atualização:** 2025-11-01
