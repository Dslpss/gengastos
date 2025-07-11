# Configuração do Supabase

## Passo a Passo para Configurar o Supabase

### 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Configurar Variáveis de Ambiente

#### Frontend (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

#### Backend (.env)

```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
DB_HOST=[YOUR_DB_HOST]
DB_PORT=6543
DB_NAME=postgres
DB_USER=[YOUR_DB_USER]
DB_PASSWORD=[YOUR_DB_PASSWORD]
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

**Importante**: Configure suas credenciais de banco através do Supabase Dashboard.

### 3. Obter as Chaves do Supabase

1. **URL do Projeto**: No dashboard do Supabase, vá em Settings > API
2. **Anon Key**: Chave pública (para o frontend)
3. **Service Role Key**: Chave privada (para o backend)

### 3.1. Configuração da Conexão PostgreSQL

Seu projeto Supabase está configurado com as seguintes credenciais de conexão:

```
Host: aws-0-sa-east-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.wgfpxpgwwwrouizgpgfi
Pool Mode: transaction
```

**URL de Conexão Completa**:

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

**Para usar essa conexão**:

1. Configure sua senha no Supabase Dashboard
2. Copie essa URL para a variável `DATABASE_URL` no arquivo `.env`
3. Configure as outras credenciais nos arquivos de ambiente

### 4. Executar o Schema do Banco

#### Opção 1: Via Interface do Supabase

1. Acesse o SQL Editor no dashboard
2. Copie o conteúdo do arquivo `backend/database/schema.sql`
3. Execute o SQL

#### Opção 2: Via Script (Recomendado)

```bash
cd backend
npm install
npm run db:setup
```

### 5. Configurar Autenticação

1. No dashboard do Supabase, vá em Authentication > Settings
2. Configure as seguintes opções:
   - **Enable email confirmations**: Desabilite para desenvolvimento
   - **Enable phone confirmations**: Desabilite para desenvolvimento
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/**`

### 6. Configurar Storage (Opcional)

Se você quiser implementar upload de imagens:

1. Vá em Storage no dashboard
2. Crie um bucket chamado `avatars`
3. Configure as políticas de acesso

### 7. Testar a Conexão

Execute o projeto e teste:

```bash
# Frontend
npm run dev

# Backend
cd backend
npm run dev
```

### 8. Verificar RLS (Row Level Security)

O schema já inclui as políticas de segurança. Verifique se estão ativas:

1. Acesse Table Editor no dashboard
2. Verifique se RLS está habilitado para todas as tabelas
3. Confirme se as políticas estão criadas

### 9. Dados de Exemplo (Opcional)

Para inserir dados de exemplo:

1. Crie um usuário via interface da aplicação
2. Obtenha a UUID do usuário na tabela `auth.users`
3. Edite o arquivo `backend/database/seed.sql` com a UUID real
4. Execute o SQL no SQL Editor

### 10. Monitoramento

Para monitorar o banco:

1. Acesse Reports no dashboard
2. Veja métricas de uso
3. Configure alertas se necessário

## Troubleshooting

### Erro de Conexão

- Verifique se as URLs e chaves estão corretas
- Confirme se as variáveis de ambiente estão carregadas

### Erro de Autenticação

- Verifique se o site URL está configurado corretamente
- Confirme se as redirect URLs incluem localhost

### Erro de RLS

- Verifique se as políticas estão criadas
- Confirme se o usuário está autenticado corretamente

### Erro de Schema

- Execute o schema SQL manualmente
- Verifique se não há conflitos de nomes

## Comandos Úteis

```bash
# Verificar conexão
curl -I https://your-project.supabase.co

# Testar API
curl -X GET https://your-project.supabase.co/rest/v1/categories \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-jwt-token"

# Logs em tempo real
# Acesse Logs no dashboard do Supabase
```

## Próximos Passos

1. Configure o banco de dados
2. Teste a autenticação
3. Implemente as funcionalidades
4. Configure o deploy em produção
