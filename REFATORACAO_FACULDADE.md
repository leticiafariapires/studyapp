# Refatoração Matérias da Faculdade - Sistema de Períodos

## ✅ O que foi implementado:

### 1. Migração SQL Criada
Arquivo: `008_add_periods_to_faculty.sql`

**Tabela `faculty_periods`:**
- id, workspace_id, name
- start_date, end_date
- is_current (apenas um por workspace)
- sort_order

**Alteração em `subjects`:**
- Adicionada coluna `period_id`
- Matérias agora pertencem a um período

---

## 📋 Próximos Passos (Para Implementar):

### 1. Aplicar Migração SQL
Execute no Supabase:
```sql
-- Cole o conteúdo de: 008_add_periods_to_faculty.sql
```

### 2. Estrutura de Períodos

**Página Principal (`/faculty-subjects`):**
- Lista de períodos (1º Semestre 2024, 2º Semestre 2024, etc)
- Botão "+ Novo Período"
- Expandir/colapsar períodos
- Dentro de cada período: suas matérias

**Fluxo:**
1. Usuário cria períodos (ex: "1º Semestre 2024")
2. Dentro de cada período, adiciona matérias
3. Cada matéria tem: tópicos, leituras, anotações
4. **SEM** registro de sessões de estudo

---

## 🎯 Como Deve Funcionar:

```
📚 Matérias da Faculdade
├── 📅 1º Semestre 2024 (Atual)
│   ├── 📖 Cálculo I
│   ├── 📖 Física I
│   └── 📖 Programação
├── 📅 2º Semestre 2024
│   ├── 📖 Cálculo II
│   └── 📖 Física II
└── 📅 3º Semestre 2025
    └── (vazio)
```

---

## 🗑️ O que Remover:

1. **Sessões de Estudo**
   - Não há registro de tempo estudado
   - Não há estatísticas de estudo
   - Foco apenas em: tópicos, leituras e anotações

2. **Campo `is_active`**
   - Removido das matérias
   - Agora usa períodos para organização

---

## 💡 Sugestão de Implementação Rápida:

Como a refatoração é grande, recomendo:

1. **Manter a página atual** funcionando
2. **Criar nova página** `/faculty-subjects/periods` para testar
3. **Migrar aos poucos** quando estiver funcionando
4. Ou posso criar uma versão simplificada agora

---

## ❓ Decisão Necessária:

Você prefere:
- **A)** Eu crio uma versão simplificada agora (30-50 linhas de código por vez)
- **B)** Você aplica a migração SQL e eu ajudo a adaptar a página existente
- **C)** Criar uma nova rota `/periods` separada para testar primeiro

Me avise qual opção prefere! 🎯
