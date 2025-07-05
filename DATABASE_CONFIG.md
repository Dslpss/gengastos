# 🗄️ Configuração do Banco de Dados PostgreSQL

## Credenciais de Conexão

O seu projeto Supabase está configurado com as seguintes informações de conexão direta ao PostgreSQL:

### Informações de Conexão

```
Host: aws-0-sa-east-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.wgfpxpgwwwrouizgpgfi
Pool Mode: transaction
```

### String de Conexão

```
postgresql://postgres.wgfpxpgwwwrouizgpgfi:Flamengo.019@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

## 🔐 Configuração das Variáveis de Ambiente

### Backend (.env)

```env
# Database PostgreSQL
DATABASE_URL=postgresql://postgres.wgfpxpgwwwrouizgpgfi:Flamengo.019@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
DB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.wgfpxpgwwwrouizgpgfi
DB_PASSWORD=Flamengo.019

# Supabase API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

## 🔍 Como Obter a Senha do Banco

1. **Acesse o Dashboard do Supabase**

   - Vá para [supabase.com](https://supabase.com)
   - Entre no seu projeto

2. **Navegue até Database Settings**

   - Clique em Settings (engrenagem)
   - Selecione Database

3. **Copie a Connection String**

   - Na seção "Connection string"
   - Copie a string completa ou apenas a senha
   - A senha está entre `:` e `@` na URL

4. **Atualize as Variáveis de Ambiente**
   - Substitua `[YOUR-PASSWORD]` pela senha real
   - Salve o arquivo `.env`

## 🧪 Teste de Conexão

O sistema inclui um teste automático de conexão que será executado quando o backend iniciar:

```bash
cd backend
npm run dev
```

Você deve ver no console:

```
✅ Conexão PostgreSQL estabelecida: [timestamp]
🚀 Server running on port 3001
```

## 🛠️ Ferramentas de Desenvolvimento

### Conexão via Linha de Comando

```bash
psql "postgresql://postgres.wgfpxpgwwwrouizgpgfi:Flamengo.019@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

### Conexão via DBeaver/pgAdmin

- **Host**: aws-0-sa-east-1.pooler.supabase.com
- **Port**: 6543
- **Database**: postgres
- **User**: postgres.wgfpxpgwwwrouizgpgfi
- **Password**: Flamengo.019
- **SSL**: Enabled

## 📊 Estrutura do Banco

O banco será criado com as seguintes tabelas:

```sql
-- Tabelas principais
categories          # Categorias de gastos/receitas
transactions        # Transações financeiras
budgets            # Orçamentos mensais
recurring_transactions  # Transações recorrentes
```

### Execução do Schema

1. **Via Interface Supabase** (Recomendado):

   ```sql
   -- Copie o conteúdo de backend/database/schema.sql
   -- Cole no SQL Editor do Supabase
   -- Execute
   ```

2. **Via Script Node.js**:
   ```bash
   cd backend
   npm run db:setup
   ```

## 🔒 Segurança

### Row Level Security (RLS)

- Todas as tabelas têm RLS habilitado
- Usuários só acessam seus próprios dados
- Políticas aplicadas automaticamente

### SSL/TLS

- Conexão sempre criptografada
- Certificados gerenciados pelo Supabase
- Rejeição de conexões não seguras desabilitada para desenvolvimento

## 🚨 Troubleshooting

### Erro de Conexão

```
Error: getaddrinfo ENOTFOUND aws-0-sa-east-1.pooler.supabase.com
```

**Solução**: Verifique sua conexão com a internet e se o host está correto.

### Erro de Autenticação

```
Error: password authentication failed for user
```

**Solução**: Verifique se a senha está correta no arquivo `.env`.

### Erro de SSL

```
Error: self signed certificate in certificate chain
```

**Solução**: O arquivo de configuração já inclui `ssl: { rejectUnauthorized: false }`.

### Timeout de Conexão

```
Error: connect ETIMEDOUT
```

**Solução**: Verifique firewall e se a porta 6543 está acessível.

## 📈 Monitoramento

### Logs de Conexão

O sistema registra todas as queries executadas com:

- Texto da query
- Duração da execução
- Número de linhas afetadas

### Pool de Conexões

- **Máximo**: 20 conexões simultâneas
- **Timeout**: 30 segundos para conexões inativas
- **Timeout de Conexão**: 2 segundos para estabelecer conexão

## 🔄 Backup e Restore

### Via Supabase Dashboard

1. Acesse Database > Backups
2. Configure backups automáticos
3. Faça download manual quando necessário

### Via pg_dump

```bash
pg_dump "postgresql://postgres.wgfpxpgwwwrouizgpgfi:Flamengo.019@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" > backup.sql
```

---

**⚡ Pronto!** Seu banco PostgreSQL está configurado e pronto para uso com o sistema GenGastos.
