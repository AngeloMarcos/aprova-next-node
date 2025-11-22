import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { promotoraSchema, PromotoraFormValues } from '@/lib/validations/promotoras';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Promotora, usePromotoras } from '@/hooks/usePromotoras';
import { useBancosSelect } from '@/hooks/useBancosSelect';

interface PromotoraFormModalProps {
  open: boolean;
  onClose: () => void;
  promotora?: Promotora;
  onSuccess: () => void;
}

export function PromotoraFormModal({ open, onClose, promotora, onSuccess }: PromotoraFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { bancos } = useBancosSelect();
  const { createPromotora, updatePromotora } = usePromotoras();
  
  const form = useForm<PromotoraFormValues>({
    resolver: zodResolver(promotoraSchema),
    defaultValues: {
      nome: promotora?.nome || '',
      banco_id: promotora?.banco_id || '',
      telefone: promotora?.telefone || '',
      email: promotora?.email || '',
      contato: promotora?.contato || '',
      comissao_padrao: promotora?.comissao_padrao?.toString() || '',
    },
  });

  const handleSubmit = async (data: PromotoraFormValues) => {
    setIsLoading(true);
    const formData = {
      nome: data.nome,
      banco_id: data.banco_id || undefined,
      telefone: data.telefone || undefined,
      email: data.email || undefined,
      contato: data.contato || undefined,
      comissao_padrao: data.comissao_padrao ? parseFloat(data.comissao_padrao) : undefined,
    };
    
    const success = promotora
      ? await updatePromotora(promotora.id, formData)
      : await createPromotora(formData);
    
    setIsLoading(false);
    if (success) {
      form.reset();
      onSuccess();
    }
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
      .substring(0, 15);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promotora ? 'Editar Promotora' : 'Nova Promotora'}</DialogTitle>
          <DialogDescription>
            Preencha os dados da promotora. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Promotora *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Promotora ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banco_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o banco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bancos.map((banco) => (
                        <SelectItem key={banco.value} value={banco.value}>
                          {banco.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contato@promotora.com.br" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatTelefone(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comissao_padrao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comissão Padrão (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="Ex: 5.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {promotora ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
