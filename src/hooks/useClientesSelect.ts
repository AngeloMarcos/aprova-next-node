import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectOption } from '@/components/form/FormSelect';

export function useClientesSelect() {
  const [clientes, setClientes] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, cpf')
        .order('nome', { ascending: true });

      if (error) throw error;

      const mappedClientes = (data || [])
        .filter(cliente => cliente.id && cliente.nome)
        .map(cliente => ({
          value: cliente.id,
          label: cliente.cpf ? `${cliente.nome} - ${cliente.cpf}` : cliente.nome,
        }));

      setClientes(mappedClientes);
    } catch (error: any) {
      toast.error('Erro ao carregar clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return { clientes, loading };
}
