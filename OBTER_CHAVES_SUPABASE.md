# 🔑 Como Obter as Chaves do Supabase

## ✅ URL já configurada!

A URL do seu projeto Supabase já foi adicionada:
```
https://hyorgnnsyogqtttqoacf.supabase.co
```

Agora você precisa obter as **2 chaves restantes**:

---

## 📋 Passo a Passo

### 1. Acesse o Dashboard do Supabase

1. Vá para: https://supabase.com/dashboard
2. Faça login (se necessário)
3. Clique no seu projeto (deve aparecer na lista)

---

### 2. Acesse as Configurações da API

No projeto selecionado:

1. No menu lateral esquerdo, clique em **Settings** (⚙️)
2. Clique em **API** (na lista de Settings)

---

### 3. Copiar as Chaves

Na página **API**, você verá várias seções:

#### 📌 Project API keys

Você verá algo como:

```
Project URL
https://hyorgnnsyogqtttqoacf.supabase.co
✅ (Já configurado!)

anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b3Jnbm5zeW9ncXR0dHFvYWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5NzY5MTAsImV4cCI6MjA0NTU1MjkxMH0.XXXXXXXXXXXXXXXXXXXXXXXXXX
👆 COPIE ESTA CHAVE

service_role (secret)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b3Jnbm5zeW9ncXR0dHFvYWNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTk3NjkxMCwiZXhwIjoyMDQ1NTUyOTEwfQ.XXXXXXXXXXXXXXXXXXXXXXXXXX
👆 COPIE ESTA CHAVE (mantenha secreta!)
```

---

### 4. Atualizar o arquivo `.env.local`

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=COLE_A_ANON_KEY_AQUI
```

Pela chave **anon public** (copiada)

E substitua:

```env
SUPABASE_SERVICE_ROLE_KEY=COLE_A_SERVICE_ROLE_KEY_AQUI
```

Pela chave **service_role** (copiada)

---

### 5. Exemplo Final

Seu arquivo `.env.local` deve ficar assim:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hyorgnnsyogqtttqoacf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b3Jnbm5zeW9ncXR0dHFvYWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5NzY5MTAsImV4cCI6MjA0NTU1MjkxMH0.XXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b3Jnbm5zeW9ncXR0dHFvYWNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTk3NjkxMCwiZXhwIjoyMDQ1NTUyOTEwfQ.XXXXXXXXX
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Não deixe espaços antes ou depois do `=`
- Não use aspas
- Copie as chaves completas (são longas, começam com `eyJhbGc...`)

---

### 6. Salvar e Reiniciar

1. **Salve o arquivo** `.env.local`
2. **Pare o servidor** (Ctrl+C no terminal)
3. **Inicie novamente**:
   ```bash
   npm run dev
   ```

---

## 🔍 Link Direto

Se preferir, acesse diretamente:
**https://supabase.com/dashboard/project/hyorgnnsyogqtttqoacf/settings/api**

(Lembre-se de fazer login primeiro!)

---

## ✅ Após Configurar

Depois de configurar as chaves e reiniciar o servidor:

1. Execute as migrações SQL no Supabase (SQL Editor)
2. Acesse `http://localhost:3000`
3. Crie sua primeira conta!

---

**Pronto! 🚀**

