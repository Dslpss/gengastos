# 🚨 GUIA DE RECUPERAÇÃO URGENTE - CREDENCIAIS EXPOSTAS

**SITUAÇÃO CRÍTICA**: Múltiplas credenciais foram expostas publicamente no GitHub.

## 🔥 AÇÕES IMEDIATAS (FAZER AGORA!)

### 1. SUPABASE DASHBOARD - REVOGAR CREDENCIAIS
```
🔗 https://supabase.com/dashboard/projects
```

**A. Resetar Senha do Banco:**
1. Projeto → Settings → Database
2. "Reset database password"
3. Gerar nova senha FORTE
4. Copiar nova senha

**B. Regenerar Chaves API:**
1. Settings → API
2. "Generate new anon key"
3. "Generate new service_role key"
4. Copiar ambas as chaves

### 2. NETLIFY - ATUALIZAR VARIÁVEIS
```
🔗 https://app.netlify.com/sites/[seu-site]/settings/deploys#environment-variables
```

Atualizar:
```
VITE_SUPABASE_ANON_KEY = [nova_anon_key_do_supabase]
```

### 3. RENDER - ATUALIZAR BACKEND
```
🔗 https://dashboard.render.com/web/[seu-servico]/settings
```

Atualizar variáveis de ambiente:
```
DATABASE_URL = postgresql://[novo_user]:[nova_senha]@[host]:6543/postgres
DB_PASSWORD = [nova_senha]
SUPABASE_SERVICE_KEY = [nova_service_key]
```

## 🔍 VERIFICAÇÃO DE SEGURANÇA

### Logs do Supabase
1. Dashboard → Logs → Database
2. Procurar por acessos suspeitos desde 11/07/2025
3. Verificar queries não autorizadas

### Dados da Aplicação
1. Verificar se há usuários não reconhecidos
2. Verificar transações suspeitas
3. Verificar modificações em categorias/orçamentos

## 📋 CHECKLIST DE RECUPERAÇÃO

### Imediato (próximas 2 horas)
- [ ] ✅ Código sanitizado (FEITO)
- [ ] 🚨 Senha do banco resetada no Supabase
- [ ] 🚨 Chaves API regeneradas no Supabase
- [ ] 🚨 Variáveis atualizadas no Netlify
- [ ] 🚨 Variáveis atualizadas no Render
- [ ] 🚨 Deploy testado e funcionando

### Verificação (próximas 24h)
- [ ] Logs de segurança revisados
- [ ] Dados da aplicação verificados
- [ ] Usuários notificados (se necessário)
- [ ] Monitoramento ativo configurado

### Prevenção (próxima semana)
- [ ] GitGuardian CLI instalado
- [ ] Git hooks configurados
- [ ] Processo de rotação de chaves estabelecido
- [ ] Auditoria de segurança completa

## 🚨 SINAIS DE COMPROMETIMENTO

Se encontrar qualquer um destes, **CONTACTE SUPORTE IMEDIATAMENTE**:
- Usuários não reconhecidos no sistema
- Transações que você não criou
- Mudanças nas configurações da aplicação
- Emails de redefinição de senha não solicitados
- Atividade estranha nos logs

## 📞 CONTATOS DE EMERGÊNCIA

- **Supabase Support**: support@supabase.io
- **Netlify Support**: support@netlify.com
- **Render Support**: help@render.com

## 🎯 APÓS A RECUPERAÇÃO

### Configurar Monitoramento
1. **Supabase**: Configurar alertas para logins suspeitos
2. **GitHub**: Ativar secret scanning
3. **GitGuardian**: Configurar monitoramento contínuo

### Educação da Equipe
1. Nunca commitar credenciais
2. Sempre usar .env para desenvolvimento
3. Rotacionar chaves regularmente
4. Revisar PRs para vazamentos

---

**⏰ TEMPO É CRÍTICO**: Quanto mais tempo as credenciais ficarem expostas, maior o risco de comprometimento.
