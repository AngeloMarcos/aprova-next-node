import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/form';
import { Cliente, ClienteFormData } from '@/hooks/useClientes';

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (data: ClienteFormData) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

type ClienteFormInputs = {
  nome: string;
  cpf?: string;
  email?: string;
};

const clienteSchema: yup.ObjectSchema<ClienteFormInputs> = yup.object().shape({
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  cpf: yup
    .string()
    .optional()
    .test('cpf-format', 'CPF inválido', function(value) {
      if (!value || value.trim() === '') return true;
      const cleanCPF = value.replace(/[^\d]/g, '');
      return cleanCPF.length === 11;
    }),
  email: yup
    .string()
    .optional()
    .email('E-mail inválido')
    .max(255, 'E-mail deve ter no máximo 255 caracteres'),
});

export function ClienteForm({ cliente, onSubmit, onCancel, isLoading }: ClienteFormProps) {
  const methods = useForm<ClienteFormInputs>({
    resolver: yupResolver(clienteSchema),
    defaultValues: {
      nome: cliente?.nome || '',
      cpf: cliente?.cpf || '',
      email: cliente?.email || '',
    },
  });

  const onSubmitForm = async (data: ClienteFormInputs) => {
    const submitData: ClienteFormData = {
      nome: data.nome,
      cpf: data.cpf && data.cpf.trim() !== '' ? data.cpf : undefined,
      email: data.email && data.email.trim() !== '' ? data.email : undefined,
    };
    const success = await onSubmit(submitData);
    if (success) {
      onCancel();
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitForm)} className="space-y-4">
        <FormInput
          name="nome"
          label="Nome *"
          placeholder="Nome completo do cliente"
        />

        <FormInput
          name="cpf"
          label="CPF"
          placeholder="000.000.000-00"
        />

        <FormInput
          name="email"
          label="E-mail"
          type="email"
          placeholder="email@exemplo.com"
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : cliente ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
