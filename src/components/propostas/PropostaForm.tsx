import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Proposta, PropostaFormData } from '@/hooks/usePropostas';
import { useClientesSelect } from '@/hooks/useClientesSelect';
import { useBancosSelect } from '@/hooks/useBancosSelect';
import { useProdutosSelect } from '@/hooks/useProdutosSelect';
import { useEffect } from 'react';

const propostaSchema = yup.object({
  cliente_id: yup.string().required('Cliente é obrigatório'),
  banco_id: yup.string(),
  produto_id: yup.string(),
  valor: yup
    .number()
    .typeError('Valor deve ser um número')
    .required('Valor é obrigatório')
    .min(0.01, 'Valor deve ser maior que zero'),
  finalidade: yup.string().max(200, 'Finalidade deve ter no máximo 200 caracteres'),
  observacoes: yup.string().max(500, 'Observações devem ter no máximo 500 caracteres'),
  status: yup
    .string()
    .required('Status é obrigatório')
    .oneOf(
      ['rascunho', 'em_analise', 'aprovada', 'reprovada', 'cancelada'],
      'Status inválido'
    ),
});

interface PropostaFormProps {
  proposta?: Proposta;
  onSubmit: (data: PropostaFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PropostaForm({ proposta, onSubmit, onCancel, loading }: PropostaFormProps) {
  const { clientes } = useClientesSelect();
  const { bancos } = useBancosSelect();
  const { produtos, fetchProdutos } = useProdutosSelect();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PropostaFormData>({
    resolver: yupResolver(propostaSchema) as any,
    defaultValues: {
      cliente_id: proposta?.cliente_id || '',
      banco_id: proposta?.banco_id || '',
      produto_id: proposta?.produto_id || '',
      valor: proposta?.valor || 0,
      finalidade: proposta?.finalidade || '',
      observacoes: proposta?.observacoes || '',
      status: proposta?.status || 'rascunho',
    },
  });

  const selectedCliente = watch('cliente_id');
  const selectedBanco = watch('banco_id');
  const selectedProduto = watch('produto_id');
  const selectedStatus = watch('status');

  useEffect(() => {
    if (selectedBanco) {
      fetchProdutos(selectedBanco);
      // Reset produto if banco changes
      if (!proposta) {
        setValue('produto_id', '');
      }
    }
  }, [selectedBanco, fetchProdutos]);

  useEffect(() => {
    if (proposta) {
      setValue('cliente_id', proposta.cliente_id || '');
      setValue('banco_id', proposta.banco_id || '');
      setValue('produto_id', proposta.produto_id || '');
      setValue('status', proposta.status);
    }
  }, [proposta, setValue]);

  const statusOptions = [
    { value: 'rascunho', label: 'Rascunho', color: 'secondary' },
    { value: 'em_analise', label: 'Em Análise', color: 'default' },
    { value: 'aprovada', label: 'Aprovada', color: 'success' },
    { value: 'reprovada', label: 'Reprovada', color: 'destructive' },
    { value: 'cancelada', label: 'Cancelada', color: 'outline' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cliente_id">Cliente *</Label>
        <Select value={selectedCliente} onValueChange={(value) => setValue('cliente_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome} {cliente.cpf && `- ${cliente.cpf}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cliente_id && (
          <p className="text-sm text-destructive">{errors.cliente_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="banco_id">Banco</Label>
          <Select value={selectedBanco} onValueChange={(value) => setValue('banco_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um banco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {bancos.map((banco) => (
                <SelectItem key={banco.id} value={banco.id}>
                  {banco.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="produto_id">Produto</Label>
          <Select
            value={selectedProduto}
            onValueChange={(value) => setValue('produto_id', value)}
            disabled={!selectedBanco}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {produtos.map((produto) => (
                <SelectItem key={produto.id} value={produto.id}>
                  {produto.nome} {produto.tipo_credito && `- ${produto.tipo_credito}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor">Valor *</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('valor')}
        />
        {errors.valor && <p className="text-sm text-destructive">{errors.valor.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="finalidade">Finalidade</Label>
        <Input
          id="finalidade"
          placeholder="Ex: Compra de veículo"
          maxLength={200}
          {...register('finalidade')}
        />
        {errors.finalidade && (
          <p className="text-sm text-destructive">{errors.finalidade.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          rows={3}
          placeholder="Informações adicionais sobre a proposta..."
          maxLength={500}
          {...register('observacoes')}
        />
        {errors.observacoes && (
          <p className="text-sm text-destructive">{errors.observacoes.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select value={selectedStatus} onValueChange={(value) => setValue('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : proposta ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
