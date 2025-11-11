import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectOption } from '@/components/form/FormSelect';

export function useProdutosSelect(bancoId?: string) {
  const [produtos, setProdutos] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('produtos')
        .select('id, nome, tipo_credito, banco_id')
        .eq('status', 'ativo')
        .order('nome', { ascending: true });

      if (bancoId) {
        query = query.eq('banco_id', bancoId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedProdutos = (data || [])
        .filter(produto => produto.id && produto.nome)
        .map(produto => ({
          value: produto.id,
          label: produto.tipo_credito ? `${produto.nome} - ${produto.tipo_credito}` : produto.nome,
        }));

      setProdutos(mappedProdutos);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [bancoId]);

  return { produtos, loading };
}
