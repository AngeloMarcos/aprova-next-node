import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProdutoOption {
  id: string;
  nome: string;
  tipo_credito: string | null;
  banco_id: string | null;
}

export function useProdutosSelect() {
  const [produtos, setProdutos] = useState<ProdutoOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProdutos = async (bancoId?: string) => {
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

      setProdutos(data as ProdutoOption[]);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return { produtos, loading, fetchProdutos };
}
