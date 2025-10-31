# 📦 Comandos Yarn - Study Manager

## 🎯 Comandos Principais

### Instalar Dependências
```bash
yarn install
# ou apenas
yarn
```

### Executar em Desenvolvimento
```bash
yarn dev
```
Acesse: http://localhost:3000

### Build para Produção
```bash
yarn build
```

### Iniciar Servidor de Produção
```bash
yarn start
```

### Verificar Erros de Linting
```bash
yarn lint
```

### Testes Unitários
```bash
yarn test
```

### Testes E2E (Playwright)
```bash
yarn test:e2e
```

### Type Check (TypeScript)
```bash
yarn type-check
```

---

## 🔧 Comandos de Gerenciamento

### Adicionar Nova Dependência
```bash
yarn add nome-do-pacote
```

### Adicionar Dependência de Desenvolvimento
```bash
yarn add -D nome-do-pacote
```

### Remover Dependência
```bash
yarn remove nome-do-pacote
```

### Atualizar Dependências
```bash
yarn upgrade
```

### Limpar Cache
```bash
yarn cache clean
```

---

## 🚀 Setup Inicial (Primeira Vez)

### 1. Instalar Yarn (se não tiver)
```bash
npm install -g yarn
```

### 2. Verificar instalação
```bash
yarn --version
```

### 3. Instalar dependências do projeto
```bash
yarn install
```

### 4. Criar .env.local
Copie `env.local.template` para `.env.local` e preencha as credenciais

### 5. Executar projeto
```bash
yarn dev
```

---

## 🛠️ Comandos Úteis para Desenvolvimento

### Adicionar Componente shadcn/ui
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
# etc...
```

### Instalar Playwright (para testes E2E)
```bash
npx playwright install
```

### Gerar Types do Supabase (opcional)
```bash
npx supabase gen types typescript --project-id seu-projeto-id > lib/types/database.ts
```

---

## 📊 Comparação Yarn vs NPM

| Comando | NPM | Yarn |
|---------|-----|------|
| Instalar | `npm install` | `yarn` ou `yarn install` |
| Adicionar | `npm install pacote` | `yarn add pacote` |
| Remover | `npm uninstall pacote` | `yarn remove pacote` |
| Executar script | `npm run dev` | `yarn dev` |
| Atualizar | `npm update` | `yarn upgrade` |
| Instalar global | `npm install -g pacote` | `yarn global add pacote` |

---

## ⚡ Vantagens do Yarn

- ✅ Mais rápido que npm (instalação paralela)
- ✅ Lockfile mais confiável (`yarn.lock`)
- ✅ Cache offline (instala sem internet se já baixou antes)
- ✅ Sintaxe mais limpa (`yarn dev` vs `npm run dev`)
- ✅ Melhor resolução de dependências

---

## 🐛 Troubleshooting

### Erro: "yarn não é reconhecido"
```bash
# Instalar Yarn globalmente
npm install -g yarn

# Reiniciar terminal
```

### Erro: Conflito de versões
```bash
# Remover node_modules e lockfile
rm -rf node_modules yarn.lock

# Reinstalar
yarn install
```

### Erro: Cache corrompido
```bash
yarn cache clean
yarn install
```

### Porta 3000 em uso
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📝 Scripts Personalizados

Você pode adicionar scripts personalizados no `package.json`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "clean": "rm -rf .next out",
  "reset": "rm -rf node_modules yarn.lock && yarn install"
}
```

Executar: `yarn nome-do-script`

---

## 🎉 Workflow Completo de Desenvolvimento

```bash
# 1. Clone o projeto
git clone <url>
cd study-manager

# 2. Instale dependências
yarn install

# 3. Configure .env.local
cp env.local.template .env.local
# Preencha as credenciais

# 4. Execute em desenvolvimento
yarn dev

# 5. Faça suas alterações

# 6. Verifique erros
yarn lint
yarn type-check

# 7. Teste
yarn test

# 8. Build
yarn build

# 9. Commit
git add .
git commit -m "feat: nova funcionalidade"
git push
```

---

## 🚢 Deploy

### Vercel (Recomendado)
1. Push para GitHub
2. Importar projeto na Vercel
3. Vercel detecta automaticamente Yarn
4. Configurar variáveis de ambiente
5. Deploy automático!

### Build Local
```bash
yarn build
yarn start
```

---

**Dica**: Use `yarn` ao invés de `yarn install` - é mais rápido de digitar! 😉
