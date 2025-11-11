import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectOption } from '@/components/form/FormSelect';

export function useBancosSelect() {
  const [bancos, setBancos] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBancos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bancos')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (error) throw error;

      const mappedBancos = (data || [])
        .filter(banco => banco.id && banco.nome)
        .map(banco => ({
          value: banco.id,
          label: banco.nome,
        }));

      setBancos(mappedBancos);
    } catch (error: any) {
      toast.error('Erro ao carregar bancos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBancos();
  }, []);

  return { bancos, loading };
}
