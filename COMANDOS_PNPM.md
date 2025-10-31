# 📦 Comandos pnpm - Study Manager

## 🚀 Por que pnpm?

- ⚡ **Até 2x mais rápido** que npm e yarn
- 💾 **Economiza espaço em disco** (usa links simbólicos)
- 🔒 **Mais seguro** (não permite acessar dependências não declaradas)
- 🎯 **Gerenciamento eficiente** de workspaces/monorepos

---

## 🎯 Comandos Principais

### Instalar Dependências
```bash
pnpm install
# ou apenas
pnpm i
```

### Executar em Desenvolvimento
```bash
pnpm dev
```
Acesse: http://localhost:3000

### Build para Produção
```bash
pnpm build
```

### Iniciar Servidor de Produção
```bash
pnpm start
```

### Verificar Erros de Linting
```bash
pnpm lint
```

### Testes Unitários
```bash
pnpm test
```

### Testes E2E (Playwright)
```bash
pnpm test:e2e
```

### Type Check (TypeScript)
```bash
pnpm type-check
```

---

## 🔧 Comandos de Gerenciamento

### Adicionar Nova Dependência
```bash
pnpm add nome-do-pacote
```

### Adicionar Dependência de Desenvolvimento
```bash
pnpm add -D nome-do-pacote
```

### Remover Dependência
```bash
pnpm remove nome-do-pacote
```

### Atualizar Dependências
```bash
pnpm update
```

### Atualizar Dependência Específica
```bash
pnpm update nome-do-pacote
```

### Limpar Cache
```bash
pnpm store prune
```

### Verificar Dependências Obsoletas
```bash
pnpm outdated
```

---

## 🚀 Setup Inicial (Primeira Vez)

### 1. Instalar pnpm (se não tiver)
```bash
npm install -g pnpm
```

### 2. Verificar instalação
```bash
pnpm --version
```

### 3. Instalar dependências do projeto
```bash
pnpm install
```

### 4. Criar .env.local
Copie `env.local.template` para `.env.local` e preencha as credenciais

### 5. Executar projeto
```bash
pnpm dev
```

---

## 🛠️ Comandos Úteis para Desenvolvimento

### Executar Binário de Pacote (sem instalar global)
```bash
pnpm dlx create-next-app
pnpm dlx playwright install
pnpm dlx shadcn-ui@latest add button
```

### Listar Dependências Instaladas
```bash
pnpm list
```

### Verificar Espaço Usado pelo Store
```bash
pnpm store status
```

### Limpar Store Não Utilizado
```bash
pnpm store prune
```

---

## 📊 Comparação: pnpm vs NPM vs Yarn

| Comando | NPM | Yarn | pnpm |
|---------|-----|------|------|
| Instalar | `npm install` | `yarn` | `pnpm install` ou `pnpm i` |
| Adicionar | `npm install pacote` | `yarn add pacote` | `pnpm add pacote` |
| Remover | `npm uninstall pacote` | `yarn remove pacote` | `pnpm remove pacote` |
| Executar script | `npm run dev` | `yarn dev` | `pnpm dev` |
| Atualizar | `npm update` | `yarn upgrade` | `pnpm update` |
| Executar binário | `npx comando` | `yarn dlx comando` | `pnpm dlx comando` |
| Instalar global | `npm install -g` | `yarn global add` | `pnpm add -g` |

---

## ⚡ Vantagens Exclusivas do pnpm

### 1. Economia de Espaço
```bash
# Espaço típico em disco:
npm:  1.2 GB (node_modules por projeto)
yarn: 1.1 GB
pnpm: 150 MB (usa store compartilhado!)
```

### 2. Velocidade
```bash
# Tempo médio de instalação:
npm:  45s
yarn: 35s
pnpm: 20s ⚡
```

### 3. Segurança
- pnpm não permite acesso a dependências não declaradas
- Estrutura de `node_modules` mais limpa e previsível

### 4. Suporte a Workspaces/Monorepos
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

---

## 🐛 Troubleshooting

### Erro: "pnpm não é reconhecido"
```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar PATH (Windows)
# Reiniciar terminal
```

### Erro: Conflito de versões
```bash
# Remover node_modules e lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstalar
pnpm install
```

### Erro: Store corrompido
```bash
pnpm store prune
pnpm install --force
```

### Porta 3000 em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Erro de Permissões (Linux/Mac)
```bash
sudo chown -R $USER ~/.pnpm-store
```

---

## 📝 Arquivo .npmrc (Configurações)

Crie `.npmrc` na raiz do projeto para configurações personalizadas:

```ini
# Store global do pnpm
store-dir=~/.pnpm-store

# Não criar package-lock.json
package-lock=false

# Modo estrito (não permite dependências não declaradas)
strict-peer-dependencies=true

# Usar hardlinks ao invés de symlinks (Windows)
# node-linker=hoisted
```

---

## 🎉 Workflow Completo de Desenvolvimento

```bash
# 1. Clone o projeto
git clone <url>
cd study-manager

# 2. Instale pnpm (se necessário)
npm install -g pnpm

# 3. Instale dependências
pnpm install

# 4. Configure .env.local
cp env.local.template .env.local
# Preencha as credenciais

# 5. Execute em desenvolvimento
pnpm dev

# 6. Faça suas alterações

# 7. Verifique erros
pnpm lint
pnpm type-check

# 8. Teste
pnpm test

# 9. Build
pnpm build

# 10. Commit
git add .
git commit -m "feat: nova funcionalidade"
git push
```

---

## 🚢 Deploy

### Vercel (Recomendado)
A Vercel detecta automaticamente pnpm se houver `pnpm-lock.yaml`:

1. Push para GitHub
2. Importar projeto na Vercel
3. Vercel usa pnpm automaticamente! ⚡
4. Configurar variáveis de ambiente
5. Deploy

### Build Local
```bash
pnpm build
pnpm start
```

---

## 🔥 Comandos Avançados

### Auditar Segurança
```bash
pnpm audit
pnpm audit --fix
```

### Executar em Múltiplos Pacotes (Monorepo)
```bash
pnpm -r run build  # Executa build em todos os pacotes
pnpm --filter @app/web dev  # Executa apenas no pacote específico
```

### Publicar Pacote
```bash
pnpm publish
```

### Ver Dependências de um Pacote
```bash
pnpm why nome-do-pacote
```

---

## 💡 Dicas Profissionais

1. **Use pnpm dlx** ao invés de npx para executar pacotes temporários
2. **Configure .npmrc** para otimizar seu workflow
3. **Use pnpm store prune** regularmente para limpar cache
4. **Em CI/CD**, use `pnpm install --frozen-lockfile` para builds determinísticos
5. **Para monorepos**, pnpm é MUITO superior ao npm/yarn

---

## 📚 Recursos

- **Documentação**: https://pnpm.io
- **Migrar de npm/yarn**: https://pnpm.io/migration
- **Benchmarks**: https://pnpm.io/benchmarks

---

**🎯 pnpm = Performance + Eficiência + Modernidade**
