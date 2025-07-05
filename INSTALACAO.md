# 📦 Instalação e Configuração do Sistema

## Passo a Passo Completo para Execução

### 1. Verificar Pré-requisitos

```bash
# Verificar Node.js (versão 18+)
node --version

# Verificar NPM
npm --version

# Se não tiver Node.js instalado, baixe em: https://nodejs.org/
```

### 2. Instalar Dependências

```bash
# No diretório raiz do projeto
npm install

# Instalar dependências do backend
cd backend
npm install

# Voltar ao diretório raiz
cd ..
```

### 3. Configurar Supabase

1. **Criar projeto no Supabase**

   - Acesse [supabase.com](https://supabase.com)
   - Crie uma conta gratuita
   - Crie um novo projeto

2. **Copiar credenciais**
   - Vá em Settings > API
   - Copie a URL do projeto
   - Copie a chave Anon/Public
   - Copie a chave Service Role

### 4. Configurar Variáveis de Ambiente

#### Frontend (.env)

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_API_URL=http://localhost:3001
```

#### Backend (.env)

```bash
# Copiar arquivo de exemplo
cp backend/.env.example backend/.env

# Editar backend/.env com suas credenciais
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-chave-service-role
CORS_ORIGIN=http://localhost:3000
```

### 5. Configurar Banco de Dados

#### Opção 1: Via Dashboard do Supabase (Recomendado)

1. Acesse o SQL Editor no dashboard do Supabase
2. Copie todo o conteúdo do arquivo `backend/database/schema.sql`
3. Cole no SQL Editor e execute

#### Opção 2: Via Script (Requer configuração adicional)

```bash
# Adicionar dependência dotenv no backend
cd backend
npm install dotenv

# Executar script de configuração
npm run db:setup
```

### 6. Configurar Autenticação no Supabase

1. **No dashboard do Supabase**, vá em Authentication > Settings
2. **Configure as URLs**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`
3. **Desabilite confirmações** (para desenvolvimento):
   - Enable email confirmations: OFF
   - Enable phone confirmations: OFF

### 7. Executar o Sistema

```bash
# Opção 1: Executar tudo junto (Recomendado)
npm run dev:full

# Opção 2: Executar separadamente
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

### 8. Testar a Aplicação

1. **Acessar**: http://localhost:3000
2. **Criar conta**: Clique em "Não tem uma conta? Cadastre-se"
3. **Fazer login**: Use email e senha criados
4. **Explorar**: Dashboard e funcionalidades

## 🔧 Comandos Úteis

```bash
# Verificar se o backend está rodando
curl http://localhost:3001/health

# Verificar logs do backend
cd backend
npm run dev

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm install
cd backend && npm install

# Verificar estrutura de arquivos
ls -la
ls -la backend/
```

## 🚨 Solução de Problemas Comuns

### Erro: "Cannot find module"

```bash
# Limpar e reinstalar dependências
npm run install:all
```

### Erro: "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Erro: "Supabase connection failed"

1. Verifique as variáveis de ambiente
2. Confirme se o projeto Supabase está ativo
3. Teste as credenciais no dashboard

### Erro: "Database schema error"

1. Execute o schema manualmente no SQL Editor
2. Verifique se todas as tabelas foram criadas
3. Confirme se RLS está habilitado

## 📋 Checklist Final

- [ ] Node.js 18+ instalado
- [ ] Dependências do frontend instaladas
- [ ] Dependências do backend instaladas
- [ ] Projeto no Supabase criado
- [ ] Variáveis de ambiente configuradas
- [ ] Schema do banco executado
- [ ] Autenticação configurada no Supabase
- [ ] Frontend rodando em localhost:3000
- [ ] Backend rodando em localhost:3001
- [ ] Possível criar conta e fazer login
- [ ] Dashboard carregando sem erros

## 🎉 Pronto!

Se todos os itens do checklist estão marcados, seu sistema está funcionando!

### Próximos Passos:

1. Explorar as funcionalidades
2. Adicionar suas próprias categorias
3. Registrar transações
4. Configurar orçamentos
5. Analisar relatórios

---

**💡 Dica**: Mantenha os terminais abertos para ver os logs em tempo real e identificar possíveis problemas.
