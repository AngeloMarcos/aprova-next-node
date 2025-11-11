import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { FormInput, FormSelect } from '@/components/form';
import { Produto, ProdutoFormData } from '@/hooks/useProdutos';
import { useBancosSelect } from '@/hooks/useBancosSelect';

const produtoSchema = yup.object({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  tipo_credito: yup.string(),
  taxa_juros: yup
    .number()
    .typeError('Taxa de juros deve ser um número')
    .min(0, 'Taxa de juros deve ser maior ou igual a 0')
    .max(100, 'Taxa de juros deve ser menor ou igual a 100'),
  status: yup
    .string()
    .required('Status é obrigatório')
    .oneOf(['ativo', 'inativo'], 'Status inválido'),
  banco_id: yup.string(),
});

interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (data: ProdutoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProdutoForm({ produto, onSubmit, onCancel, loading }: ProdutoFormProps) {
  const { bancos } = useBancosSelect();
  
  const methods = useForm<ProdutoFormData>({
    resolver: yupResolver(produtoSchema) as any,
    defaultValues: {
      nome: produto?.nome || '',
      tipo_credito: produto?.tipo_credito || '',
      taxa_juros: produto?.taxa_juros || undefined,
      status: produto?.status || 'ativo',
      banco_id: produto?.banco_id || '',
    },
  });

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nome"
          label="Nome do Produto *"
          placeholder="Ex: Crédito Consignado"
        />

        <FormInput
          name="tipo_credito"
          label="Tipo de Crédito"
          placeholder="Ex: Consignado, Pessoal, Empresarial"
        />

        <FormInput
          name="taxa_juros"
          label="Taxa de Juros (% a.m.)"
          type="number"
          step="0.01"
          placeholder="Ex: 2.5"
        />

        <FormSelect
          name="banco_id"
          label="Banco"
          placeholder="Selecione um banco"
          options={bancos}
        />

        <FormSelect
          name="status"
          label="Status *"
          placeholder="Selecione o status"
          options={statusOptions}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : produto ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
