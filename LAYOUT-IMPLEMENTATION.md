# Implementação do Layout Compartilhado

## 🎯 Objetivo

Aplicar o design moderno (estilo Edupro) a **todas as páginas** do workspace, mantendo:
- Sidebar lateral fixa com navegação
- Header superior com notificações e perfil do usuário
- Conteúdo adaptado ao tipo de workspace

## 📦 Componentes Criados

### 1. **WorkspaceHeader** (`components/workspace-header.tsx`)
- Header fixo no topo com título e ações do usuário
- Ícone de notificações com badge vermelho
- Avatar do usuário e nome (extraído do email)
- Props: `title` e `userEmail`

### 2. **WorkspaceLayout** (`app/workspaces/[id]/layout.tsx`)
- Layout compartilhado para todas as páginas do workspace
- Gerencia autenticação automaticamente
- Sidebar fixa à esquerda (escondida em mobile)
- Conteúdo principal com margem para não sobrepor a sidebar
- Aplica o padding padrão de 8 (32px) ao conteúdo

## 🏗️ Estrutura do Layout

```tsx
<div className="flex min-h-screen bg-gray-50">
  {/* Sidebar Fixa - 256px */}
  <div className="w-64 fixed h-full">
    <WorkspaceSidebar />
  </div>

  {/* Conteúdo Principal */}
  <div className="flex-1 lg:ml-64">
    {/* Header Fixo */}
    <WorkspaceHeader />
    
    {/* Área de Conteúdo - p-8 */}
    <div className="p-8">
      {children}
    </div>
  </div>
</div>
```

## 📄 Páginas Adaptadas

### Home Page (`page.tsx`)
- ✅ Removido wrapper de layout
- ✅ Removido header duplicado
- ✅ Mantém apenas o conteúdo (Welcome Card + Stats + etc)
- ✅ Usa `<>...</>` (Fragment) como wrapper

### Subjects Page (`subjects/page.tsx`)
- ✅ Removido `min-h-screen` e `bg-gradient`
- ✅ Removido botão "Voltar" (navegação agora é pela sidebar)
- ✅ Atualizado para usar título H2 + descrição
- ✅ Usa Fragment como wrapper

## 🎨 Padrão de Design para Outras Páginas

### Estrutura Recomendada:

```tsx
export default function PageName() {
  return (
    <>
      {/* Header da Página */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Título da Página</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Descrição curta do que faz
          </p>
        </div>
        
        {/* Ações (se houver) */}
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Ação
        </Button>
      </div>

      {/* Conteúdo da Página */}
      <div className="space-y-6">
        {/* Cards, listas, etc */}
      </div>
    </>
  );
}
```

### ❌ O que NÃO fazer:
- Não adicionar `min-h-screen` (já está no layout)
- Não adicionar backgrounds gradientes (já está no layout)
- Não adicionar wrappers com `container` ou `px-4 py-8`
- Não criar botão "Voltar" (use a sidebar)
- Não duplicar o header

### ✅ O que FAZER:
- Usar Fragment `<>...</>` como wrapper
- Adicionar título H2 + descrição no topo
- Usar `mb-8` para separar header do conteúdo
- Usar botões verdes (`bg-green-500 hover:bg-green-600`)
- Manter cards brancos com sombras suaves

## 🔄 Navegação Contextual

A **WorkspaceSidebar** adapta o menu automaticamente:

### Concurso:
- Home
- Matérias
- Sessões
- Questões
- Configurações
- Ajuda

### Faculdade:
- Home
- Matérias
- Leituras
- Calendário
- Configurações
- Ajuda

### TAF:
- Home
- Treinos
- Relatórios
- Configurações
- Ajuda

### Planner:
- Home
- Tarefas
- Calendário
- Configurações
- Ajuda

## 📱 Responsividade

- **Desktop (lg+)**: Sidebar visível + conteúdo com margem esquerda
- **Mobile/Tablet**: Sidebar escondida (pode adicionar menu hamburguer depois)

## 🚀 Próximos Passos

### Páginas que precisam ser adaptadas:

1. **Study Sessions** (`study-sessions/page.tsx`)
2. **Questions** (`questions/page.tsx`)
3. **Readings** (`readings/page.tsx`)
4. **Faculty Subjects** (`faculty-subjects/page.tsx`)
5. **Faculty Calendar** (`faculty-calendar/page.tsx`)
6. **Trainings** (`trainings/page.tsx`)
7. **Reports** (`reports/page.tsx`)
8. **Settings** (`settings/page.tsx`)
9. **Planner** (todas as subpáginas)

### Para cada página:

1. Abrir o arquivo `page.tsx`
2. Remover wrappers externos (min-h-screen, bg-gradient, container)
3. Substituir por Fragment `<>...</>`
4. Atualizar header para usar H2 + descrição
5. Remover botão "Voltar"
6. Testar navegação pela sidebar

### Template Rápido:

```tsx
// Substitua:
return (
  <div className="min-h-screen bg-gradient-to-br...">
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4">
        <Link href="..."><Button>Voltar</Button></Link>
        <h1>Título</h1>
      </div>
      {/* conteúdo */}
    </div>
  </div>
);

// Por:
return (
  <>
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-2xl font-bold">Título</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Descrição</p>
      </div>
    </div>
    {/* conteúdo */}
  </>
);
```

## 🎨 Paleta de Cores Padrão

- **Primária**: Verde (`bg-green-500`, `text-green-600`)
- **Secundária**: Cinza (`bg-gray-50`, `text-gray-600`)
- **Cards**: Branco (`bg-white dark:bg-gray-800`)
- **Bordas**: Cinza claro (`border-gray-200 dark:border-gray-800`)
- **Texto**: Preto/Cinza (`text-gray-900 dark:text-white`)

## ✨ Benefícios

- ✅ Design consistente em todas as páginas
- ✅ Navegação mais intuitiva (sidebar sempre visível)
- ✅ Header unificado com ações do usuário
- ✅ Código mais limpo e reutilizável
- ✅ Fácil manutenção (mudanças no layout afetam tudo)
- ✅ Melhor UX (usuário sabe onde está sempre)

---

**Status**: Layout base implementado ✅
**Próximo**: Adaptar páginas restantes 🚧
