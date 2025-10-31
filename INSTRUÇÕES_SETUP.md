# 🚀 INSTRUÇÕES PASSO A PASSO - SETUP COMPLETO

## ✅ Status Atual
- [x] Projeto criado
- [ ] Dependências instaladas (aguardando npm install...)
- [ ] Supabase configurado
- [ ] ISBNdb configurado
- [ ] .env.local criado
- [ ] Migration executada
- [ ] Projeto rodando

---

## 📦 PASSO 1: Aguardar instalação das dependências
**Status**: Em andamento...

O comando `npm install` está rodando. Aguarde a conclusão (pode levar 2-5 minutos).

---

## 🗄️ PASSO 2: Configurar Supabase

### 2.1 Criar Projeto Supabase

1. **Acesse**: https://supabase.com
2. **Clique em**: "Start your project" ou "New Project"
3. **Faça login** com GitHub ou email
4. **Clique em**: "New Project"
5. **Preencha**:
   - **Name**: `study-manager` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
   - **Pricing Plan**: Free (gratuito)
6. **Clique em**: "Create new project"
7. **Aguarde**: 2-3 minutos até o projeto ser provisionado

### 2.2 Executar Migration (Criar Tabelas)

**Após o projeto estar pronto:**

1. No painel do Supabase, clique em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **New Query**
3. **Abra o arquivo**: `c:\Users\leticia pires\CascadeProjects\windsurf-project\supabase\migrations\001_initial_schema.sql`
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no SQL Editor do Supabase
6. **Clique em RUN** (ou pressione Ctrl+Enter)
7. **Aguarde** a execução (deve aparecer "Success" embaixo)

✅ **Confirmação**: Se aparecer "Success. No rows returned", está correto!

### 2.3 Obter Credenciais do Supabase

1. No painel do Supabase, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. **Copie** os seguintes valores:

   - **Project URL** → Anote
   - **anon/public key** → Anote
   - **service_role key** → Clique em "Reveal" e anote (⚠️ mantenha secreto!)

---

## 📚 PASSO 3: Configurar ISBNdb API

### 3.1 Criar Conta no ISBNdb

1. **Acesse**: https://isbndb.com/isbn-database
2. **Clique em**: "Sign Up" ou "Get Started"
3. **Preencha** seus dados e crie a conta
4. **Verifique** seu email (se necessário)

### 3.2 Obter API Key

1. **Faça login** em https://isbndb.com
2. No **dashboard**, localize a seção **API Key** ou **My Account**
3. **Copie** sua API Key
   - Deve ser algo como: `12345_a1b2c3d4e5f6...`

✅ **Nota**: O plano gratuito permite 500 requisições/mês (suficiente para testes)

---

## ⚙️ PASSO 4: Criar arquivo .env.local

### 4.1 Copiar Template

1. **Abra** o arquivo: `env.local.template`
2. **Copie** todo o conteúdo
3. **Crie um novo arquivo** na raiz do projeto chamado: `.env.local`
4. **Cole** o conteúdo

### 4.2 Preencher Credenciais

**Substitua** os valores de exemplo pelas suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
ISBNDB_API_KEY=12345_abcdef...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: 
- Use os valores REAIS que você copiou
- Não compartilhe o `SUPABASE_SERVICE_ROLE_KEY` com ninguém
- Não faça commit do `.env.local` (ele já está no .gitignore)

### 4.3 Salvar

1. **Salve** o arquivo `.env.local`
2. **Feche** o arquivo

---

## 🏃 PASSO 5: Executar o Projeto

### 5.1 Verificar se npm install terminou

Se ainda estiver instalando, aguarde a conclusão.

### 5.2 Iniciar servidor de desenvolvimento

Abra o terminal e execute:

```bash
npm run dev
```

### 5.3 Acessar o app

1. Abra o navegador em: **http://localhost:3000**
2. Você verá a página inicial do Study Manager

---

## 🧪 PASSO 6: Testar

### 6.1 Criar Conta

1. Clique em **"Criar Conta"**
2. Preencha:
   - Nome: Seu nome
   - Email: seu@email.com
   - Senha: mínimo 6 caracteres
3. Clique em **"Criar Conta"**

✅ Se funcionar, você será redirecionado para o dashboard!

### 6.2 Criar Primeiro Workspace

1. Clique em **"Novo Workspace"** ou **"Criar Primeiro Workspace"**
2. Escolha um tipo (Concurso, Faculdade ou TAF)
3. Dê um nome
4. Salve

---

## ❓ Problemas Comuns

### Erro: "Invalid API key" (Supabase)
- Verifique se copiou corretamente as credenciais
- Confirme que executou a migration no SQL Editor
- Teste as credenciais no painel do Supabase > API Docs

### Erro: "Book not found" (ISBNdb)
- Verifique se a API key está correta
- Confirme que tem requests disponíveis (limite: 500/mês)
- Teste a API em: https://isbndb.com/apidocs/v2

### Servidor não inicia
- Certifique-se que o `npm install` terminou
- Verifique se a porta 3000 está livre
- Tente limpar cache: `npm run build` e depois `npm run dev`

### Erro de autenticação
- Confirme que a migration foi executada
- Verifique as RLS policies no Supabase > Authentication > Policies
- Teste criar usuário direto no Supabase > Authentication > Users

---

## 📞 Próximos Passos

Após o setup básico funcionar:

1. **Implementar workflows completos** (Concurso, Faculdade, TAF)
2. **Adicionar ícones PWA** (192x192 e 512x512)
3. **Deploy na Vercel**
4. **Configurar notificações**

---

## 🎉 Checklist Final

- [ ] npm install concluído
- [ ] Projeto Supabase criado
- [ ] Migration executada no SQL Editor
- [ ] Credenciais Supabase obtidas
- [ ] Conta ISBNdb criada
- [ ] API Key ISBNdb obtida
- [ ] Arquivo .env.local criado e preenchido
- [ ] Servidor rodando em localhost:3000
- [ ] Conta criada com sucesso
- [ ] Primeiro workspace criado

**Se todos os itens estiverem marcados, você está pronto! 🚀**
