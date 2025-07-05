# Sistema de Gerenciamento de Gastos - Referência Completa

## 🎯 Visão Geral do Sistema

### Objetivo

Sistema web para controle pessoal de gastos, permitindo categorização, análise e relatórios financeiros.

### Tecnologias Principais

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: Supabase (PostgreSQL)
- **Estilização**: Tailwind CSS
- **Gráficos**: Chart.js / Recharts
- **Autenticação**: Supabase Auth

## 📊 Estrutura do Banco de Dados (Supabase)

### Tabelas Principais

#### 1. users (gerenciada pelo Supabase Auth)

```sql
-- Tabela automática do Supabase
id (UUID) - PK
email (string)
created_at (timestamp)
```

#### 2. categories

```sql
id (UUID) - PK
user_id (UUID) - FK -> auth.users
name (string) - Nome da categoria
color (string) - Cor para identificação
icon (string) - Ícone da categoria
type (enum) - 'expense' | 'income'
created_at (timestamp)
updated_at (timestamp)
```

#### 3. transactions

```sql
id (UUID) - PK
user_id (UUID) - FK -> auth.users
category_id (UUID) - FK -> categories
amount (decimal) - Valor da transação
description (string) - Descrição
date (date) - Data da transação
type (enum) - 'expense' | 'income'
payment_method (enum) - 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'transfer'
created_at (timestamp)
updated_at (timestamp)
```

#### 4. budgets

```sql
id (UUID) - PK
user_id (UUID) - FK -> auth.users
category_id (UUID) - FK -> categories
amount (decimal) - Valor do orçamento
month (integer) - Mês (1-12)
year (integer) - Ano
created_at (timestamp)
updated_at (timestamp)
```

#### 5. recurring_transactions

```sql
id (UUID) - PK
user_id (UUID) - FK -> auth.users
category_id (UUID) - FK -> categories
amount (decimal)
description (string)
frequency (enum) - 'weekly' | 'monthly' | 'yearly'
next_date (date) - Próxima data de execução
is_active (boolean)
created_at (timestamp)
updated_at (timestamp)
```

## 🏗️ Arquitetura do Sistema

### Frontend (React)

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (botões, inputs, etc.)
│   ├── forms/          # Formulários
│   ├── charts/         # Gráficos
│   └── layout/         # Layout components
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── services/           # Serviços (API calls)
├── utils/              # Funções utilitárias
├── types/              # Tipos TypeScript
└── contexts/           # Contextos React
```

### Backend (Node.js + Express)

```
src/
├── controllers/        # Controladores
├── middleware/         # Middlewares
├── routes/            # Rotas da API
├── services/          # Lógica de negócio
├── utils/             # Funções utilitárias
├── types/             # Tipos TypeScript
└── config/            # Configurações
```

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação

1. Login via Supabase Auth (email/senha)
2. JWT token retornado pelo Supabase
3. Token enviado em todas as requisições
4. Middleware de autenticação no backend
5. RLS (Row Level Security) no Supabase

### Políticas de Segurança (RLS)

```sql
-- Exemplo para tabela transactions
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## 📱 Funcionalidades Principais

### 1. Dashboard

- Resumo financeiro mensal
- Gráficos de gastos por categoria
- Saldo atual
- Comparativo com mês anterior

### 2. Transações

- Adicionar receita/despesa
- Editar/excluir transações
- Filtrar por período, categoria, tipo
- Buscar por descrição

### 3. Categorias

- Criar categorias personalizadas
- Definir cores e ícones
- Categorias padrão (Alimentação, Transporte, etc.)

### 4. Orçamentos

- Definir orçamento mensal por categoria
- Alertas quando próximo do limite
- Comparativo orçado x realizado

### 5. Relatórios

- Gráficos de evolução mensal
- Relatório por categoria
- Exportar dados (CSV/PDF)

### 6. Transações Recorrentes

- Configurar gastos/receitas fixas
- Execução automática
- Gerenciar recorrências

## 🔄 Fluxos Principais

### Fluxo de Adicionar Transação

1. Usuário clica em "Adicionar Transação"
2. Formulário com campos: valor, categoria, descrição, data, tipo
3. Validação no frontend
4. Envio para API
5. Validação no backend
6. Inserção no Supabase
7. Retorno de sucesso/erro
8. Atualização da interface

### Fluxo de Dashboard

1. Usuário acessa dashboard
2. Carregamento de dados:
   - Transações do mês atual
   - Orçamentos
   - Categorias
3. Cálculos:
   - Total de receitas
   - Total de despesas
   - Saldo
   - Gastos por categoria
4. Renderização de gráficos
5. Exibição de resumos

## 🎨 Design e UX

### Paleta de Cores

- Primária: #3B82F6 (Blue)
- Secundária: #EF4444 (Red para despesas)
- Sucesso: #10B981 (Green para receitas)
- Neutro: #6B7280 (Gray)

### Componentes Principais

- Cards para resumos
- Tabelas para listagem
- Formulários modais
- Gráficos interativos
- Navegação lateral

## 📊 Métricas e KPIs

### Métricas Principais

- Total de receitas
- Total de despesas
- Saldo atual
- Gastos por categoria
- Orçamento vs realizado
- Tendência mensal

### Gráficos

- Gráfico de pizza (gastos por categoria)
- Gráfico de barras (evolução mensal)
- Gráfico de linha (tendência)
- Gráfico de área (receitas vs despesas)

## 🔧 Configurações Técnicas

### Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API
VITE_API_URL=http://localhost:3001

# Backend
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Scripts Package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "server": "cd backend && npm run dev",
    "dev:full": "concurrently \"npm run dev\" \"npm run server\""
  }
}
```

## 🚀 Roadmap de Desenvolvimento

### Fase 1 - MVP (Mínimo Viável)

- [ ] Autenticação básica
- [ ] CRUD de transações
- [ ] Dashboard simples
- [ ] Categorias básicas

### Fase 2 - Melhorias

- [ ] Orçamentos
- [ ] Gráficos avançados
- [ ] Filtros e buscas
- [ ] Responsividade

### Fase 3 - Avançado

- [ ] Transações recorrentes
- [ ] Relatórios exportáveis
- [ ] Notificações
- [ ] Modo escuro

## 🧪 Testes

### Testes Frontend

- Jest + React Testing Library
- Testes de componentes
- Testes de integração

### Testes Backend

- Jest + Supertest
- Testes de API
- Testes de lógica de negócio

## 📱 Responsividade

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Componentes Adaptativos

- Navegação: Sidebar (desktop) / Bottom nav (mobile)
- Cards: Grid responsivo
- Formulários: Stack vertical em mobile

## 🔒 Segurança

### Validações

- Sanitização de inputs
- Validação de tipos
- Limites de rate limiting
- Validação de JWT

### Boas Práticas

- Princípio do menor privilégio
- Validação dupla (frontend + backend)
- Logs de segurança
- Criptografia de dados sensíveis
