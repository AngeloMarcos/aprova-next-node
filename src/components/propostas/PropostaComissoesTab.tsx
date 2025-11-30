import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DollarSign, Calendar as CalendarIcon, Plus, Trash2, Check } from 'lucide-react';
import { usePropostaComissoes, ComissaoFormData } from '@/hooks/usePropostaComissoes';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const comissaoSchema = z.object({
  valor_comissao: z.number().min(0.01, 'Valor deve ser maior que zero'),
  percentual_comissao: z.number().min(0).max(100).optional().nullable(),
  data_previsao: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
});

type ComissaoFormSchema = z.infer<typeof comissaoSchema>;

interface PropostaComissoesTabProps {
  propostaId: string;
}

export function PropostaComissoesTab({ propostaId }: PropostaComissoesTabProps) {
  const { comissoes, loading, createComissao, deleteComissao, marcarComoPago } =
    usePropostaComissoes(propostaId);
  const { isAdmin, isSupervisor } = useAuth();
  const canEdit = isAdmin || isSupervisor;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComissaoFormSchema>({
    resolver: zodResolver(comissaoSchema),
  });

  const onSubmit = async (data: ComissaoFormSchema) => {
    if (!data.valor_comissao) {
      toast.error('Valor da comissão é obrigatório');
      return;
    }

    const formData: ComissaoFormData = {
      valor_comissao: data.valor_comissao,
      percentual_comissao: data.percentual_comissao ?? null,
      data_previsao: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      observacao: data.observacao ?? null,
    };

    const success = await createComissao(formData);
    if (success) {
      reset();
      setSelectedDate(undefined);
      setIsDialogOpen(false);
    }
  };

  const handleMarcarComoPago = async (id: string) => {
    const hoje = format(new Date(), 'yyyy-MM-dd');
    await marcarComoPago(id, hoje);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'recebido') {
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-700">
          Recebido
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        Pendente
      </Badge>
    );
  };

  const totalComissoes = comissoes.reduce((sum, c) => sum + c.valor_comissao, 0);
  const totalRecebido = comissoes
    .filter((c) => c.status_recebimento === 'recebido')
    .reduce((sum, c) => sum + c.valor_comissao, 0);
  const totalPendente = totalComissoes - totalRecebido;

  if (loading && comissoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Carregando comissões..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Comissões</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalComissoes)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Recebido</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(totalRecebido)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Pendente</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              {formatCurrency(totalPendente)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Comissões List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comissões Registradas</CardTitle>
              <CardDescription>
                {canEdit
                  ? 'Gerencie as comissões desta proposta'
                  : 'Visualize as comissões desta proposta'}
              </CardDescription>
            </div>
            {canEdit && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Comissão
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Comissão</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da comissão a ser registrada
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor_comissao">Valor da Comissão (R$) *</Label>
                      <Input
                        id="valor_comissao"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('valor_comissao', { valueAsNumber: true })}
                        disabled={isSubmitting}
                      />
                      {errors.valor_comissao && (
                        <p className="text-sm text-destructive">
                          {errors.valor_comissao.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="percentual_comissao">Percentual (%)</Label>
                      <Input
                        id="percentual_comissao"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('percentual_comissao', { valueAsNumber: true })}
                        disabled={isSubmitting}
                      />
                      {errors.percentual_comissao && (
                        <p className="text-sm text-destructive">
                          {errors.percentual_comissao.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Previsão de Pagamento</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !selectedDate && 'text-muted-foreground'
                            )}
                            disabled={isSubmitting}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            className={cn('p-3 pointer-events-auto')}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacao">Observações</Label>
                      <Textarea
                        id="observacao"
                        placeholder="Observações adicionais..."
                        {...register('observacao')}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Registrando...
                          </>
                        ) : (
                          'Registrar Comissão'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {comissoes.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma comissão registrada</p>
              {canEdit && (
                <p className="text-sm text-muted-foreground mt-2">
                  Clique no botão acima para registrar uma comissão
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead>Previsão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recebimento</TableHead>
                    {canEdit && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoes.map((comissao) => (
                    <TableRow key={comissao.id}>
                      <TableCell className="font-medium">
                        {formatCurrency(comissao.valor_comissao)}
                      </TableCell>
                      <TableCell>
                        {comissao.percentual_comissao
                          ? `${comissao.percentual_comissao}%`
                          : '-'}
                      </TableCell>
                      <TableCell>{formatDate(comissao.data_previsao)}</TableCell>
                      <TableCell>{getStatusBadge(comissao.status_recebimento)}</TableCell>
                      <TableCell>{formatDate(comissao.data_recebimento)}</TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {comissao.status_recebimento === 'pendente' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarcarComoPago(comissao.id)}
                                title="Marcar como pago"
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteComissao(comissao.id)}
                              title="Remover comissão"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
