# 🔧 Resolver Erro de Certificado SSL

## ❌ Erro Atual

```
npm error code SELF_SIGNED_CERT_IN_CHAIN
npm error errno SELF_SIGNED_CERT_IN_CHAIN
npm error request to https://registry.npmjs.org failed
```

**Causa**: Rede corporativa/proxy/firewall usando certificado SSL próprio.

---

## ✅ SOLUÇÃO RÁPIDA (Recomendada)

### Opção 1: Desabilitar Verificação SSL Temporariamente

Abra o **CMD** (não PowerShell) e execute:

```bash
cd "c:\Users\leticia pires\CascadeProjects\windsurf-project"

npm config set strict-ssl false

npm install
```

**⚠️ Aviso**: Desabilita verificação SSL apenas para desenvolvimento local.

---

## 🔐 SOLUÇÃO PERMANENTE

### Opção 2: Configurar Certificado Correto

Se você tem o certificado da sua empresa:

```bash
# Definir o certificado CA
npm config set cafile "C:\caminho\para\certificado.pem"

# Ou definir múltiplos CAs
npm config set ca "-----BEGIN CERTIFICATE-----
...conteúdo do certificado...
-----END CERTIFICATE-----"

npm install
```

---

## 🌐 SOLUÇÃO PARA PROXY

### Opção 3: Configurar Proxy (se sua rede usa)

```bash
# HTTP Proxy
npm config set proxy http://proxy.empresa.com:8080

# HTTPS Proxy
npm config set https-proxy http://proxy.empresa.com:8080

# Proxy com autenticação
npm config set proxy http://usuario:senha@proxy.empresa.com:8080
npm config set https-proxy http://usuario:senha@proxy.empresa.com:8080

npm install
```

---

## 🔄 ALTERNATIVAS

### Opção 4: Usar Registry Alternativo

```bash
# Usar mirror do npm (Taobao - China)
npm config set registry https://registry.npmmirror.com

# Ou voltar para o original depois
npm config set registry https://registry.npmjs.org

npm install
```

### Opção 5: Instalar Offline (se já baixou antes)

```bash
# Usar cache local
npm install --prefer-offline

# Ou modo completamente offline
npm install --offline
```

---

## 🧹 LIMPAR CONFIGURAÇÕES

Se quiser voltar ao padrão:

```bash
# Remover strict-ssl
npm config delete strict-ssl

# Remover proxy
npm config delete proxy
npm config delete https-proxy

# Ver todas configurações
npm config list

# Resetar tudo
npm config edit
# Delete as linhas que você adicionou e salve
```

---

## 📋 COMANDOS COMPLETOS (Cole no CMD)

```bash
# 1. Navegar até o projeto
cd "c:\Users\leticia pires\CascadeProjects\windsurf-project"

# 2. Desabilitar SSL (temporário)
npm config set strict-ssl false

# 3. Limpar cache (opcional)
npm cache clean --force

# 4. Instalar
npm install

# 5. Após instalar, reabilitar SSL (opcional)
npm config set strict-ssl true
```

---

## 🔍 VERIFICAR CONFIGURAÇÕES ATUAIS

```bash
# Ver configuração SSL
npm config get strict-ssl

# Ver registry
npm config get registry

# Ver todas configurações
npm config list
```

---

## 🏢 EMPRESAS/UNIVERSIDADES

Se você está em rede corporativa/universitária:

1. **Contate TI** para obter:
   - Certificado CA correto
   - Configurações de proxy
   - Endereço do registry interno (se houver)

2. **Use VPN pessoal** (se permitido)
   - Conecte em rede pessoal
   - Execute npm install
   - Volte para rede corporativa

3. **Hotspot do celular** (emergência)
   - Use dados móveis para instalar
   - Depois volte para WiFi normal

---

## ⚠️ IMPORTANTE

### Segurança

- `strict-ssl false` é **OK para desenvolvimento local**
- **NÃO use** em servidores de produção
- **Reative** depois se possível: `npm config set strict-ssl true`

### Arquivos de Configuração

As configurações ficam em:
- **Global**: `C:\Users\seu-usuario\.npmrc`
- **Projeto**: `c:\Users\leticia pires\CascadeProjects\windsurf-project\.npmrc`

Você pode editar manualmente esses arquivos.

---

## 🎯 TESTE RÁPIDO

Após configurar, teste se funciona:

```bash
# Testar conexão com npm
npm ping

# Instalar pacote pequeno para testar
npm install lodash --save-dev

# Se funcionar, instale tudo
npm install
```

---

## 💡 DICA PROFISSIONAL

Crie um arquivo `.npmrc` na raiz do projeto com:

```ini
strict-ssl=false
registry=https://registry.npmjs.org/
```

Isso aplica as configurações apenas para este projeto.

---

## 🆘 ÚLTIMO RECURSO

Se nada funcionar:

1. **Baixe o projeto em outro computador/rede**
2. **Execute npm install lá**
3. **Copie a pasta `node_modules` inteira**
4. **Cole no seu projeto**

⚠️ Não ideal, mas funciona para continuar o desenvolvimento.

---

**Boa sorte! 🚀**
