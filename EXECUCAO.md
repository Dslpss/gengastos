# 🚀 Guia de Execução - GenGastos

## Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Git (opcional)

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
# Instalar dependências do frontend e backend
npm run install:all

# Ou instalação manual:
npm install
cd backend && npm install
```

### 2. Configurar Variáveis de Ambiente

#### Frontend

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com suas credenciais do Supabase
```

#### Backend

```bash
# Copiar arquivo de exemplo
cp backend/.env.example backend/.env

# Editar o arquivo backend/.env com suas credenciais do Supabase
```

### 3. Configurar Supabase

Siga as instruções detalhadas no arquivo `SUPABASE_SETUP.md`

### 4. Configurar Banco de Dados

```bash
# Executar schema do banco
npm run db:setup
```

## 🏃‍♂️ Executando o Projeto

### Modo Desenvolvimento (Recomendado)

```bash
# Executa frontend e backend simultaneamente
npm run dev:full
```

### Execução Separada

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

## 🌐 Acessando a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🧪 Teste da Aplicação

### 1. Criar Conta

1. Acesse http://localhost:3000
2. Clique em "Não tem uma conta? Cadastre-se"
3. Preencha email e senha
4. Clique em "Criar conta"

### 2. Fazer Login

1. Use o email e senha criados
2. Clique em "Entrar"

### 3. Explorar Interface

- Dashboard com resumo financeiro
- Navegação lateral com todas as seções
- Botões para adicionar transações, categorias, etc.

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Frontend apenas
npm run server           # Backend apenas
npm run dev:full         # Frontend + Backend

# Instalação
npm run install:all      # Instalar todas as dependências
npm run setup           # Instalação + configuração do banco

# Banco de Dados
npm run db:setup        # Configurar schema do banco

# Produção
npm run build           # Build do frontend
npm run start           # Iniciar em produção
```

## 🔍 Verificando se está Funcionando

### Frontend

- [ ] Página de login carrega sem erros
- [ ] Possível criar conta
- [ ] Possível fazer login
- [ ] Dashboard mostra interface

### Backend

- [ ] API responde em http://localhost:3001/health
- [ ] Não há erros no console do backend
- [ ] Conexão com Supabase estabelecida

### Banco de Dados

- [ ] Tabelas criadas no Supabase
- [ ] RLS (Row Level Security) habilitado
- [ ] Políticas de segurança aplicadas

## 🐛 Solução de Problemas

### Erro: "Cannot find module"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install:all
```

### Erro: "Supabase connection failed"

1. Verifique as variáveis de ambiente
2. Confirme se o projeto Supabase está ativo
3. Teste a conexão via dashboard do Supabase

### Erro: "Port already in use"

```bash
# Encontrar e parar processo usando a porta
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Erro: "Database schema not found"

```bash
# Executar schema manualmente
npm run db:setup

# Ou via dashboard do Supabase
# Copiar conteúdo de backend/database/schema.sql
# Executar no SQL Editor
```

## 📝 Logs e Debug

### Frontend

- Abrir DevTools do navegador (F12)
- Verificar Console e Network

### Backend

- Logs aparecem no terminal
- Verificar erros de conexão com Supabase

## 🔄 Atualizações

```bash
# Atualizar dependências
npm update
cd backend && npm update

# Verificar vulnerabilidades
npm audit
npm audit fix
```

## 📚 Próximos Passos

1. **Personalizar Categorias**: Adicione suas próprias categorias
2. **Adicionar Transações**: Registre seus gastos e receitas
3. **Configurar Orçamentos**: Defina metas mensais
4. **Explorar Relatórios**: Analise seus dados financeiros

## 💡 Dicas

- Use dados reais para melhor experiência
- Configure categorias antes de adicionar transações
- Verifique o dashboard regularmente
- Mantenha backups dos dados importantes

## 🆘 Suporte

Se encontrar problemas:

1. Verifique este guia de solução de problemas
2. Consulte a documentação do Supabase
3. Verifique os logs de erro
4. Teste com dados de exemplo

---

**Desenvolvido com ❤️ para ajudar no controle financeiro pessoal**
