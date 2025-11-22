import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bancoSchema, BancoFormValues } from '@/lib/validations/bancos';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Banco } from '@/hooks/useBancos';

interface BancoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BancoFormValues) => Promise<boolean>;
  banco?: Banco;
  isLoading: boolean;
}

export function BancoFormModal({ open, onClose, onSubmit, banco, isLoading }: BancoFormModalProps) {
  const form = useForm<BancoFormValues>({
    resolver: zodResolver(bancoSchema),
    defaultValues: {
      nome: banco?.nome || '',
      cnpj: banco?.cnpj || '',
      email: banco?.email || '',
      telefone: banco?.telefone || '',
    },
  });

  const handleSubmit = async (data: BancoFormValues) => {
    const success = await onSubmit(data);
    if (success) {
      form.reset();
      onClose();
    }
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
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
          <DialogTitle>{banco ? 'Editar Banco' : 'Novo Banco'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do banco. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Banco *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Banco do Brasil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00.000.000/0000-00"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCNPJ(e.target.value);
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contato@banco.com.br" {...field} />
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
                      placeholder="(00) 0000-0000"
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

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {banco ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
