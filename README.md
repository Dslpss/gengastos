# Sistema de Gerenciamento de Gastos

Um sistema completo para controle de gastos pessoais desenvolvido com React, TypeScript, Node.js e Supabase.

## 🚀 Tecnologias

### Frontend

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** para estilização
- **Chart.js** para gráficos
- **Zustand** para gerenciamento de estado
- **React Hook Form** para formulários
- **Lucide React** para ícones

### Backend

- **Node.js** + **Express** + **TypeScript**
- **Supabase** como banco de dados
- **JWT** para autenticação
- **Zod** para validação de dados

## 📋 Funcionalidades

- ✅ Autenticação segura com Supabase
- ✅ Dashboard interativo com gráficos
- ✅ Gerenciamento de transações (receitas/despesas)
- ✅ Categorização personalizada
- ✅ Orçamentos mensais
- ✅ Relatórios financeiros
- ✅ Transações recorrentes
- ✅ Responsivo para mobile

## 🛠️ Instalação

### Pré-requisitos

- Node.js (v18+)
- npm ou yarn
- Conta no Supabase

### Configuração

1. **Clone o repositório**

```bash
git clone <repository-url>
cd gengastos
```

2. **Instale as dependências**

```bash
npm run install:all
```

3. **Configure as variáveis de ambiente**

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure suas credenciais do Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Configure o banco de dados**

```bash
npm run db:setup
```

5. **Execute o projeto**

```bash
npm run dev:full
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema (gerenciado pelo Supabase Auth)
- **categories**: Categorias de gastos/receitas
- **transactions**: Transações financeiras
- **budgets**: Orçamentos mensais
- **recurring_transactions**: Transações recorrentes

Veja mais detalhes em `SYSTEM_REFERENCE.md`.

## 📱 Como Usar

### 1. Dashboard

- Visualize seu resumo financeiro mensal
- Acompanhe gráficos de gastos por categoria
- Veja a evolução do seu saldo

### 2. Transações

- Adicione receitas e despesas
- Categorize seus gastos
- Filtre por período e categoria

### 3. Orçamentos

- Defina metas mensais por categoria
- Receba alertas quando próximo do limite
- Compare orçado vs realizado

### 4. Relatórios

- Gere relatórios detalhados
- Exporte dados em CSV
- Analise tendências financeiras

## 🎨 Design

O sistema utiliza uma interface moderna e intuitiva com:

- Design responsivo
- Paleta de cores consistente
- Gráficos interativos
- Navegação fluida

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS)
- Validação de dados no frontend e backend
- Sanitização de inputs

## 📊 Estrutura do Projeto

```
gengastos/
├── backend/           # API Node.js
├── src/               # Frontend React
│   ├── components/    # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── hooks/         # Custom hooks
│   ├── services/      # Serviços (API)
│   ├── utils/         # Funções utilitárias
│   └── types/         # Tipos TypeScript
├── public/            # Arquivos estáticos
└── docs/              # Documentação
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Faça push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se encontrar algum problema ou tiver dúvidas, abra uma issue no GitHub ou entre em contato.

---

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal.
