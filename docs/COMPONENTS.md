# Component Documentation

## Reusable Form Components

All form components are located in `src/components/form/` and integrate with `react-hook-form`.

---

### FormInput

A reusable input component with automatic validation error display.

**Props:**
```typescript
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;                 // Field name (required)
  label?: string;               // Display label
  helperText?: string;          // Helper text below input
  containerClassName?: string;  // Container CSS classes
}
```

**Usage:**
```typescript
import { FormProvider, useForm } from 'react-hook-form';
import { FormInput } from '@/components/form';

function MyForm() {
  const methods = useForm();
  
  return (
    <FormProvider {...methods}>
      <form>
        <FormInput
          name="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          helperText="Seu e-mail corporativo"
        />
      </form>
    </FormProvider>
  );
}
```

**Features:**
- Automatic error display from validation
- Support for all native input props
- Helper text that hides on error
- Accessible label association

---

### FormSelect

A reusable select dropdown component.

**Props:**
```typescript
interface FormSelectProps {
  name: string;                 // Field name (required)
  label?: string;               // Display label
  placeholder?: string;         // Placeholder text
  options: SelectOption[];      // Array of {value, label}
  helperText?: string;          // Helper text
  containerClassName?: string;  // Container CSS classes
  disabled?: boolean;           // Disable the select
}

interface SelectOption {
  value: string;
  label: string;
}
```

**Usage:**
```typescript
const statusOptions = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

<FormSelect
  name="status"
  label="Status"
  placeholder="Selecione o status"
  options={statusOptions}
/>
```

**Features:**
- Uses Shadcn Select component
- Automatic validation error display
- Disabled state support
- Controlled by react-hook-form

---

### FormTextarea

A reusable textarea component.

**Props:**
```typescript
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  helperText?: string;
  containerClassName?: string;
}
```

**Usage:**
```typescript
<FormTextarea
  name="observacoes"
  label="Observações"
  placeholder="Informações adicionais"
  rows={4}
/>
```

---

### FormSwitch

A toggle switch component.

**Props:**
```typescript
interface FormSwitchProps {
  name: string;
  label?: string;
  helperText?: string;
  containerClassName?: string;
  disabled?: boolean;
}
```

**Usage:**
```typescript
<FormSwitch
  name="ativo"
  label="Usuário Ativo"
  helperText="Desative para bloquear acesso"
/>
```

---

## Reusable Table Components

### DataTable

A generic table component for displaying data with actions.

**Props:**
```typescript
interface DataTableProps<T> {
  data: T[];                              // Array of data objects
  columns: DataTableColumn<T>[];          // Column definitions
  isLoading?: boolean;                    // Show loading state
  emptyMessage?: string;                  // Message when no data
  onEdit?: (item: T) => void;            // Edit handler
  onDelete?: (item: T) => void;          // Delete handler
  renderActions?: (item: T) => ReactNode; // Custom actions renderer
}

interface DataTableColumn<T> {
  key: keyof T | "actions";
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}
```

**Usage:**
```typescript
import { DataTable, DataTableColumn } from '@/components/table';

const columns: DataTableColumn<Banco>[] = [
  { key: 'nome', label: 'Nome' },
  { 
    key: 'cnpj', 
    label: 'CNPJ',
    render: (banco) => banco.cnpj || '-',
  },
  { 
    key: 'created_at', 
    label: 'Cadastrado em',
    render: (banco) => format(new Date(banco.created_at), 'dd/MM/yyyy'),
  },
  { key: 'actions', label: 'Ações' },
];

<DataTable
  data={bancos}
  columns={columns}
  isLoading={loading}
  emptyMessage="Nenhum banco encontrado"
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Custom Actions:**
```typescript
<DataTable
  data={produtos}
  columns={columns}
  renderActions={(produto) => (
    <div className="flex gap-2">
      <Button onClick={() => handleToggleStatus(produto)}>
        {produto.status === 'ativo' ? 'Inativar' : 'Ativar'}
      </Button>
      <Button onClick={() => handleEdit(produto)}>Editar</Button>
    </div>
  )}
/>
```

---

## Shared Components

### ErrorBoundary

Catches and displays errors gracefully.

**Usage:**
```typescript
import { ErrorBoundary } from '@/components/shared';

<ErrorBoundary>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary 
  fallback={<div>Oops! Something went wrong.</div>}
>
  <MyComponent />
</ErrorBoundary>
```

**Features:**
- Catches React component errors
- Displays user-friendly error message
- Provides "Try again" button
- Logs errors to console

---

### LoadingSpinner

Displays loading states.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}
```

**Usage:**
```typescript
import { LoadingSpinner, LoadingOverlay } from '@/components/shared';

// Simple spinner
<LoadingSpinner size="md" />

// With message
<LoadingSpinner size="lg" message="Carregando dados..." />

// Full-screen overlay
<LoadingOverlay message="Processando..." />
```

---

### EmptyState

Displays when no data is available.

**Props:**
```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
```

**Usage:**
```typescript
import { EmptyState } from '@/components/shared';
import { Building2 } from 'lucide-react';

<EmptyState
  icon={Building2}
  title="Nenhum banco cadastrado"
  description="Comece adicionando um banco parceiro"
  action={{
    label: "Adicionar Banco",
    onClick: () => setDialogOpen(true)
  }}
/>
```

---

## Module-Specific Components

### BancoForm

Form for creating/editing banks.

**Props:**
```typescript
interface BancoFormProps {
  banco?: Banco;
  onSubmit: (data: BancoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Validation Schema:**
- `nome` - Required, 3-100 characters
- `cnpj` - Optional
- `email` - Optional, valid email format
- `telefone` - Optional

---

### ProdutoForm

Form for creating/editing products.

**Props:**
```typescript
interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (data: ProdutoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Validation Schema:**
- `nome` - Required, 3-100 characters
- `banco_id` - Optional
- `tipo_credito` - Optional
- `taxa_juros` - Optional, positive number
- `status` - Required, 'ativo' or 'inativo'

---

### PropostaForm

Form for creating/editing proposals.

**Props:**
```typescript
interface PropostaFormProps {
  proposta?: Proposta;
  onSubmit: (data: PropostaFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Validation Schema:**
- `cliente_id` - Required
- `banco_id` - Required
- `produto_id` - Optional
- `valor` - Required, positive number
- `status` - Required
- `finalidade` - Optional
- `observacoes` - Optional

**Dynamic Behavior:**
- Product dropdown filters by selected bank
- Resets product when bank changes

---

## Best Practices

### Form Components

1. **Always use FormProvider:**
```typescript
const methods = useForm();

return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  </FormProvider>
);
```

2. **Define validation schemas:**
```typescript
const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('E-mail inválido'),
});

const methods = useForm({
  resolver: yupResolver(schema),
});
```

3. **Handle loading states:**
```typescript
<Button type="submit" disabled={loading}>
  {loading ? 'Salvando...' : 'Salvar'}
</Button>
```

### Table Components

1. **Define columns clearly:**
```typescript
const columns: DataTableColumn<T>[] = [
  { key: 'field', label: 'Label' },
  { 
    key: 'field2', 
    label: 'Custom',
    render: (item) => formatValue(item.field2),
  },
];
```

2. **Provide meaningful empty states:**
```typescript
emptyMessage="Nenhum registro encontrado. Adicione um novo para começar."
```

3. **Confirm destructive actions:**
```typescript
const handleDelete = (item: T) => {
  if (confirm(`Tem certeza que deseja excluir "${item.nome}"?`)) {
    onDelete(item);
  }
};
```

### Error Handling

1. **Wrap components in ErrorBoundary:**
```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

2. **Show loading states:**
```typescript
{loading && <LoadingSpinner />}
{!loading && data && <YourContent />}
```

3. **Handle empty states:**
```typescript
{!loading && data.length === 0 && (
  <EmptyState {...emptyStateProps} />
)}
```
