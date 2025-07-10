# ✅ Checklist Pré-Deploy - GenGastos

## 🔍 Verificações Importantes

### 1. Arquivos de Configuração

- [x] `netlify.toml` - Sintaxe TOML corrigida ✅
- [x] `render.yaml` - Configuração do backend
- [x] `.env.production` - Variáveis de ambiente
- [x] `package.json` - Scripts de build configurados

### 2. Variáveis de Ambiente

#### Frontend (Netlify)

```
VITE_SUPABASE_URL=https://[SEU-PROJETO].supabase.co
VITE_SUPABASE_ANON_KEY=[SUA-CHAVE-ANONIMA]
VITE_API_URL=https://[SEU-BACKEND].onrender.com
```

#### Backend (Render)

```
SUPABASE_URL=https://[SEU-PROJETO].supabase.co
SUPABASE_SERVICE_KEY=[SUA-SERVICE-KEY]
CORS_ORIGIN=https://[SEU-FRONTEND].netlify.app
PORT=10000
NODE_ENV=production
DATABASE_URL=[AUTO-CONFIGURADO-PELO-RENDER]
DB_PASSWORD=[AUTO-CONFIGURADO-PELO-RENDER]
```

### 3. Configuração do Supabase

- [ ] RLS (Row Level Security) habilitado
- [ ] Políticas de segurança configuradas
- [ ] Tabelas criadas (users, transactions, categories, budgets, user_settings)
- [ ] Autenticação configurada

### 4. Teste Local

Antes do deploy, teste localmente:

```bash
# Instalar dependências
npm run install:all

# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
npm run dev
```

### 5. Ordem de Deploy

1. **Backend primeiro** (Render)
2. **Frontend depois** (Netlify)
3. **Atualizar CORS** no backend com URL real do frontend
4. **Testar integração**

---

## 🚨 Problemas Comuns

### Erro CORS

- Verifique se `CORS_ORIGIN` no backend tem a URL correta do frontend
- Não esqueça do `https://` na URL

### Erro 404 na API

- Verifique se `VITE_API_URL` no frontend tem a URL correta do backend
- Teste a URL do backend diretamente no navegador

### Erro de Autenticação

- Verifique se as chaves do Supabase estão corretas
- Confirme se o domínio está autorizado no Supabase

### Build Falhando

- Verifique se todas as dependências estão instaladas
- Confirme se não há erros de TypeScript

---

## 🎯 Status Atual

- ✅ **Sintaxe do netlify.toml corrigida**
- ✅ **Backend configurado e deployado no Render**
- ✅ **Sistema de notificações implementado**
- ✅ **Integração Supabase funcionando**
- 🔄 **Próximo: Deploy do frontend no Netlify**
