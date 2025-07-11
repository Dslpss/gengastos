# 🔐 Configuração de Variáveis de Ambiente

## 📁 Estrutura de Arquivos .env

```
projeto/
├── .env                    # Frontend (Vite)
├── backend/.env           # Backend (Node.js)
├── .env.example          # Template do frontend
└── backend/.env.example  # Template do backend
```

## 🎯 Frontend (.env na raiz)

### Desenvolvimento Local
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://wgfpxpgwwwrouizgpgfi.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# API Configuration
VITE_API_URL=http://localhost:3001

# Development
NODE_ENV=development
```

### Produção (Netlify)
As variáveis devem ser configuradas no **Dashboard do Netlify**:
```
Site Settings → Environment Variables
```

Variáveis necessárias:
- `VITE_SUPABASE_URL` = https://wgfpxpgwwwrouizgpgfi.supabase.co
- `VITE_SUPABASE_ANON_KEY` = [sua_anon_key]
- `VITE_API_URL` = https://gengastos.onrender.com

## ⚙️ Backend (backend/.env)

### Desenvolvimento Local
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://wgfpxpgwwwrouizgpgfi.supabase.co
SUPABASE_SERVICE_KEY=sua_service_key_aqui

# Database Connection (PostgreSQL)
DATABASE_URL=postgresql://postgres.wgfpxpgwwwrouizgpgfi:Flamengo.019@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
DB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.wgfpxpgwwwrouizgpgfi
DB_PASSWORD=Flamengo.019

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_key
```

### Produção (Render)
As variáveis devem ser configuradas no **Dashboard do Render**:
```
Dashboard → Web Service → Environment
```

Variáveis necessárias:
- `SUPABASE_URL` = https://wgfpxpgwwwrouizgpgfi.supabase.co
- `SUPABASE_SERVICE_KEY` = [sua_service_key]
- `DATABASE_URL` = [connection_string_completa]
- `DB_HOST` = aws-0-sa-east-1.pooler.supabase.com
- `DB_PORT` = 6543
- `DB_NAME` = postgres
- `DB_USER` = postgres.wgfpxpgwwwrouizgpgfi
- `DB_PASSWORD` = Flamengo.019
- `CORS_ORIGIN` = https://seu-site.netlify.app
- `JWT_SECRET` = [seu_jwt_secret]

## 🔑 Como Obter as Chaves do Supabase

1. **Acesse o Dashboard**: https://supabase.com/dashboard
2. **Selecione seu projeto**: `wgfpxpgwwwrouizgpgfi`
3. **Vá em Settings → API**
4. **Copie as chaves**:
   - **Project URL**: para `SUPABASE_URL`
   - **anon public**: para `VITE_SUPABASE_ANON_KEY`
   - **service_role secret**: para `SUPABASE_SERVICE_KEY`

## 🛡️ Segurança

### ✅ Boas Práticas
- ✅ Usar variáveis de ambiente em todos os scripts
- ✅ Manter `.env` fora do controle de versão
- ✅ Usar `.env.example` como template
- ✅ Configurar variáveis nos dashboards de produção

### ❌ O que NUNCA fazer
- ❌ Commitar arquivos `.env` no Git
- ❌ Hardcoded credentials no código
- ❌ Compartilhar chaves em texto plano
- ❌ Usar credenciais de produção em desenvolvimento

## 📂 Templates Seguros

### .env.example (raiz)
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_URL=http://localhost:3001

# Development
NODE_ENV=development
```

### backend/.env.example
```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Database Connection (PostgreSQL)
DATABASE_URL=your_database_connection_string
DB_HOST=your_database_host
DB_PORT=6543
DB_NAME=postgres
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_key
```

## 🚀 Configuração Rápida

### 1. Desenvolvimento Local
```bash
# 1. Copiar templates
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Editar com suas credenciais reais
# .env (frontend)
# backend/.env (backend)

# 3. Iniciar desenvolvimento
npm run dev
cd backend && npm run dev
```

### 2. Deploy em Produção
```bash
# 1. Netlify (Frontend)
# Dashboard → Site Settings → Environment Variables
# Adicionar: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

# 2. Render (Backend)  
# Dashboard → Environment Variables
# Adicionar todas as variáveis do backend/.env
```

## 🔧 Verificação

### Testar Variáveis Localmente
```bash
# Frontend
echo $VITE_SUPABASE_URL

# Backend
cd backend
node -e "console.log(process.env.SUPABASE_URL)"
```

### Validação de Configuração
O backend inclui validação automática das variáveis obrigatórias:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` 
- `DB_PASSWORD`

Se alguma estiver faltando, o servidor não iniciará.

---

## 📞 Suporte

Se tiver problemas com as variáveis de ambiente:

1. **Verifique se o arquivo .env existe**
2. **Confirme se as variáveis estão corretas**
3. **Reinicie o servidor após mudanças**
4. **Verifique os logs para erros de validação**
