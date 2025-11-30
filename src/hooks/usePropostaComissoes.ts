import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Comissao {
  id: string;
  proposta_id: string;
  valor_comissao: number;
  percentual_comissao: number | null;
  data_previsao: string | null;
  data_recebimento: string | null;
  status_recebimento: string;
  observacao: string | null;
  contrato_id: string | null;
  usuario_id: string | null;
  empresa_id: string | null;
  created_at: string;
}

export interface ComissaoFormData {
  valor_comissao: number;
  percentual_comissao?: number | null;
  data_previsao?: string | null;
  observacao?: string | null;
}

export function usePropostaComissoes(propostaId: string) {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComissoes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comissoes')
        .select('*')
        .eq('proposta_id', propostaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComissoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar comissões:', error);
      toast.error('Erro ao carregar comissões');
    } finally {
      setLoading(false);
    }
  };

  const createComissao = async (formData: ComissaoFormData) => {
    setLoading(true);
    try {
      // Get current user and empresa
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      const { error } = await supabase.from('comissoes').insert({
        proposta_id: propostaId,
        valor_comissao: formData.valor_comissao,
        percentual_comissao: formData.percentual_comissao || null,
        data_previsao: formData.data_previsao || null,
        observacao: formData.observacao || null,
        status_recebimento: 'pendente',
        usuario_id: user.id,
        empresa_id: profile.empresa_id,
      });

      if (error) throw error;

      toast.success('Comissão registrada com sucesso');
      await fetchComissoes();
      return true;
    } catch (error: any) {
      console.error('Erro ao criar comissão:', error);
      toast.error(error.message || 'Erro ao registrar comissão');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateComissao = async (id: string, formData: Partial<ComissaoFormData>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('comissoes')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Comissão atualizada com sucesso');
      await fetchComissoes();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar comissão:', error);
      toast.error(error.message || 'Erro ao atualizar comissão');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteComissao = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('comissoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Comissão removida com sucesso');
      await fetchComissoes();
      return true;
    } catch (error: any) {
      console.error('Erro ao remover comissão:', error);
      toast.error(error.message || 'Erro ao remover comissão');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const marcarComoPago = async (id: string, dataRecebimento: string) => {
    return updateComissao(id, {
      data_recebimento: dataRecebimento,
      status_recebimento: 'recebido',
    } as any);
  };

  useEffect(() => {
    if (propostaId) {
      fetchComissoes();
    }
  }, [propostaId]);

  return {
    comissoes,
    loading,
    createComissao,
    updateComissao,
    deleteComissao,
    marcarComoPago,
    refetch: fetchComissoes,
  };
}
