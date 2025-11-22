import { useState } from 'react';
import { toast } from 'sonner';

export interface Promotora {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  empresa_id: string | null;
  created_at: string;
}

export interface PromotoraFormData {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
}

export function usePromotoras() {
  const [loading, setLoading] = useState(false);

  const fetchPromotoras = async (page: number = 1, pageSize: number = 10, searchTerm?: string) => {
    // Placeholder - tabela será criada no próximo prompt
    return { data: [], count: 0, totalPages: 0 };
  };

  const createPromotora = async (formData: PromotoraFormData) => {
    // Placeholder - será implementado no próximo prompt
    toast.info('Funcionalidade será implementada em breve');
    return false;
  };

  const updatePromotora = async (id: string, formData: PromotoraFormData) => {
    // Placeholder - será implementado no próximo prompt
    toast.info('Funcionalidade será implementada em breve');
    return false;
  };

  const deletePromotora = async (id: string) => {
    // Placeholder - será implementado no próximo prompt
    toast.info('Funcionalidade será implementada em breve');
    return false;
  };

  return {
    loading,
    fetchPromotoras,
    createPromotora,
    updatePromotora,
    deletePromotora,
  };
}
