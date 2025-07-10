# 🚀 Deploy do GenGastos

Este guia mostra como fazer deploy do projeto GenGastos usando **Netlify** (frontend) e **Render** (backend).

## 📁 Estrutura do Projeto

```
gengastos/
├── src/                    # Frontend (React/Vite)
├── backend/               # Backend (Node.js/Express)
├── netlify.toml          # Configuração do Netlify
└── backend/render.yaml   # Configuração do Render
```

## 🌐 Deploy do Frontend (Netlify)

### 1. Pré-requisitos

- [ ] Projeto no GitHub
- [ ] Conta no [Netlify](https://netlify.com)

### 2. Configuração no Netlify

1. **Login no Netlify** e conecte sua conta GitHub
2. **Clique em "Add new site" > "Import an existing project"**
3. **Selecione seu repositório** `gengastos`
4. **Configure o build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Root directory: `/` (raiz do projeto)

### 3. Variáveis de Ambiente

No painel do Netlify, vá em **Site settings > Environment variables** e adicione:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
VITE_API_URL=https://seu-backend.onrender.com
```

### 4. Deploy

- Clique em **Deploy site**
- Aguarde o build terminar
- Seu site estará disponível em `https://seu-site.netlify.app`

---

## ⚙️ Deploy do Backend (Render)

### 1. Pré-requisitos

- [ ] Mesmo repositório no GitHub
- [ ] Conta no [Render](https://render.com)

### 2. Configuração no Render

1. **Login no Render** e conecte sua conta GitHub
2. **Clique em "New +" > "Web Service"**
3. **Selecione seu repositório** `gengastos`
4. **Configure o serviço:**
   - Name: `gengastos-backend`
   - Environment: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

### 3. Variáveis de Ambiente

No painel do Render, vá em **Environment** e adicione:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key-aqui
CORS_ORIGIN=https://seu-site.netlify.app
PORT=10000
NODE_ENV=production
```

### 4. Deploy

- Clique em **Create Web Service**
- Aguarde o build terminar
- Seu backend estará disponível em `https://seu-backend.onrender.com`

---

## 🔧 Configurações Adicionais

### CORS no Backend

Certifique-se de que seu backend aceita requisições do frontend:

```javascript
// backend/src/index.js
const cors = require("cors");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
```

### Redirecionamentos (Netlify)

O arquivo `netlify.toml` já está configurado para:

- Fazer proxy das chamadas `/api/*` para o backend
- Servir o frontend para todas as rotas (SPA)

### Health Check (Render)

Adicione uma rota de health check no seu backend:

```javascript
// backend/src/index.js
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
```

---

## 📋 Checklist Final

### Frontend (Netlify)

- [ ] Site buildando sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Site acessível via HTTPS
- [ ] Rotas funcionando (SPA)

### Backend (Render)

- [ ] Serviço rodando sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado para o domínio do Netlify
- [ ] API acessível via HTTPS

### Integração

- [ ] Frontend consegue fazer chamadas para o backend
- [ ] Autenticação Supabase funcionando
- [ ] Banco de dados acessível
- [ ] Todas as funcionalidades testadas

---

## 🆘 Troubleshooting

### Erro de Build no Netlify

```bash
# Verifique se as dependências estão corretas
npm install
npm run build
```

### Erro de CORS

```javascript
// Adicione o domínio correto no backend
CORS_ORIGIN=https://seu-site-real.netlify.app
```

### Erro de Conexão com Supabase

- Verifique se as URLs e chaves estão corretas
- Confirme se o projeto Supabase está ativo
- Teste as credenciais no dashboard do Supabase

### Backend não inicia no Render

- Verifique se o `package.json` tem o script `start`
- Confirme se a porta está configurada corretamente
- Veja os logs no painel do Render

---

## 🎉 Pronto!

Após seguir todos os passos, seu projeto estará online:

- **Frontend:** `https://seu-site.netlify.app`
- **Backend:** `https://seu-backend.onrender.com`

### Próximos Passos

1. Configure um domínio personalizado (opcional)
2. Configure monitoramento e alertas
3. Implemente CI/CD automático
4. Configure backups regulares

---

**Desenvolvido com ❤️ - GenGastos © 2025**
