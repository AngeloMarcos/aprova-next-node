# Onboarding Wizard - Configuração Inicial Guiada

## Visão Geral

O Wizard de Onboarding é um fluxo de configuração inicial em 3 passos que guia novos usuários/empresas através dos cadastros essenciais do AprovaCRM. É exibido automaticamente no primeiro acesso de um novo usuário.

## Objetivos

1. **Simplificar a configuração inicial**: Guiar usuários através dos cadastros base necessários
2. **Melhorar a experiência do primeiro uso**: Evitar que usuários vejam um sistema vazio
3. **Acelerar o time-to-value**: Permitir que usuários comecem a usar o sistema rapidamente

## Fluxo do Wizard

### Passo 1: Cadastro de Banco

**Objetivo**: Cadastrar o primeiro banco parceiro

**Campos**:
- Nome do Banco* (obrigatório, mín. 2 caracteres)
- CNPJ (opcional, 14 dígitos)

**Validações**:
- Nome é obrigatório e deve ter no mínimo 2 caracteres
- CNPJ deve ter exatamente 14 dígitos (se preenchido)

**Ações**:
- Dados salvos na tabela `bancos`
- Banco criado como `ativo: true`
- Associado ao `empresa_id` do usuário logado

### Passo 2: Cadastro de Produto

**Objetivo**: Cadastrar o primeiro produto financeiro

**Campos**:
- Nome do Produto* (obrigatório, mín. 2 caracteres)
- Tipo de Produto* (select obrigatório)

**Tipos de Produto**:
- Crédito Pessoal
- Consórcio
- Cartão de Crédito
- Crédito Imobiliário
- Crédito Veicular

**Validações**:
- Nome é obrigatório e deve ter no mínimo 2 caracteres
- Tipo de produto é obrigatório

**Ações**:
- Dados salvos na tabela `produtos`
- Produto criado como `ativo: true` e `status: 'ativo'`
- Associado ao banco cadastrado no Passo 1
- Associado ao `empresa_id` do usuário logado

### Passo 3: Finalização

**Objetivo**: Confirmar conclusão e redirecionar para o dashboard

**Conteúdo**:
- Mensagem de sucesso
- Lista de próximos passos sugeridos:
  - Cadastrar mais bancos e produtos
  - Adicionar clientes ao sistema
  - Criar primeiras propostas
  - Gerenciar fluxo de aprovação

**Ações**:
- Marca `onboarding_completed = true` na tabela `profiles`
- Redireciona para `/dashboard`

## Implementação Técnica

### Componentes

```
src/components/onboarding/
├── OnboardingWizard.tsx         # Componente principal do wizard
└── steps/
    ├── BancoStep.tsx            # Passo 1: Cadastro de banco
    ├── ProdutoStep.tsx          # Passo 2: Cadastro de produto
    └── FinalStep.tsx            # Passo 3: Finalização
```

### Hook Personalizado

**`src/hooks/useOnboarding.ts`**

```typescript
{
  loading: boolean;
  onboardingCompleted: boolean;
  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}
```

### Página

**`src/pages/Onboarding.tsx`**
- Verifica autenticação do usuário
- Redireciona para login se não autenticado
- Redireciona para dashboard se onboarding já completado
- Renderiza o OnboardingWizard

### Database Schema

**Alteração na tabela `profiles`**:

```sql
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_profiles_onboarding 
ON public.profiles(onboarding_completed, empresa_id);
```

## Lógica de Redirecionamento

### No Dashboard (`src/pages/Dashboard.tsx`)

```typescript
const { loading, onboardingCompleted } = useOnboarding();

useEffect(() => {
  if (!loading && !onboardingCompleted) {
    navigate("/onboarding");
  }
}, [loading, onboardingCompleted, navigate]);
```

### Na Página de Onboarding

```typescript
useEffect(() => {
  if (!user) {
    navigate("/login");
    return;
  }

  if (!loading && onboardingCompleted) {
    navigate("/dashboard");
  }
}, [user, loading, onboardingCompleted, navigate]);
```

## Recursos de UI/UX

### Indicadores de Progresso

1. **Barra de Progresso**: Mostra percentual completado
2. **Steps Indicator**: Badges numeradas com status visual
3. **Navegação**: Botões Voltar e Próximo/Finalizar

### Estados Visuais

- **Passo Atual**: Badge azul com fundo primário
- **Passo Completado**: Badge com ícone de check
- **Passo Futuro**: Badge cinza desbotado

### Feedback ao Usuário

- **Loading States**: Botões mostram "Salvando..." durante operações
- **Toast Notifications**: Sucesso/erro após cada ação
- **Validação em Tempo Real**: Erros exibidos abaixo dos campos

## Rotas

| Rota | Componente | Acesso |
|------|-----------|---------|
| `/onboarding` | Onboarding | Usuários autenticados sem onboarding concluído |

## Fluxo de Dados

### 1. Verificação Inicial

```
Login → AuthContext carrega profile → 
useOnboarding verifica onboarding_completed →
Redireciona para /onboarding se false
```

### 2. Durante o Wizard

```
Passo 1: Insere banco → salva em state local
Passo 2: Busca banco criado → insere produto
Passo 3: Marca onboarding_completed = true
```

### 3. Após Conclusão

```
completeOnboarding() → 
update profiles.onboarding_completed →
navigate('/dashboard')
```

## Validações

### Frontend (React Hook Form + Yup)

```typescript
// Passo 1
const bancoSchema = yup.object({
  nome: yup.string().required().min(2),
  cnpj: yup.string().matches(/^\d{14}$/).optional(),
});

// Passo 2
const produtoSchema = yup.object({
  nome: yup.string().required().min(2),
  tipo_credito: yup.string().required(),
});
```

### Backend (RLS Policies)

- Dados salvos devem ter `empresa_id` do usuário logado
- Apenas usuários autenticados podem inserir dados
- RLS garante isolamento multi-tenant

## Segurança

### Multi-Tenancy

✅ **Garantias**:
- Todos os dados criados são associados ao `empresa_id` do usuário
- RLS policies impedem acesso cross-tenant
- Validação de `empresa_id` em todas as inserções

### Autenticação

✅ **Proteções**:
- Rota `/onboarding` requer autenticação
- Redirecionamento automático para login se não autenticado
- Verificação de sessão antes de qualquer operação

## Testing

### Cenários de Teste

1. **Novo Usuário**:
   - Login → Deve ser redirecionado para /onboarding
   - Completar wizard → Deve ir para /dashboard
   - Tentar acessar /onboarding novamente → Redirecionar para /dashboard

2. **Usuário Existente**:
   - Login com onboarding_completed = true
   - Deve ir direto para /dashboard

3. **Validações de Formulário**:
   - Tentar avançar com campos vazios → Mostrar erros
   - CNPJ inválido → Mostrar erro de formato

4. **Multi-Tenancy**:
   - Banco e produto criados devem ter empresa_id correto
   - Dados não devem ser visíveis para outras empresas

## Melhorias Futuras

1. **Skip Wizard**: Permitir pular onboarding e voltar depois
2. **Tutorial Interativo**: Adicionar tooltips e guias contextuais
3. **Import de Dados**: Permitir importar bancos/produtos via CSV
4. **Customização**: Permitir escolher quais passos são obrigatórios
5. **Progresso Salvo**: Salvar progresso parcial e permitir retomar
6. **Video Tutorial**: Embed de vídeo explicativo em cada passo

## Troubleshooting

### Usuário Não Vê o Wizard

1. Verificar se `onboarding_completed` está false no banco
2. Verificar se a rota `/onboarding` está registrada
3. Verificar console para erros de redirecionamento

### Dados Não São Salvos

1. Verificar se `empresa_id` está presente no profile
2. Verificar RLS policies nas tabelas bancos e produtos
3. Verificar console/network para erros do Supabase

### Wizard Não Redireciona Após Conclusão

1. Verificar se `completeOnboarding()` está sendo chamado
2. Verificar se a atualização do banco foi bem-sucedida
3. Verificar se há erros no useEffect do Dashboard

## Referências

- [React Hook Form](https://react-hook-form.com/)
- [Yup Validation](https://github.com/jquense/yup)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Multi-Step Forms Best Practices](https://www.nngroup.com/articles/multi-step-forms/)