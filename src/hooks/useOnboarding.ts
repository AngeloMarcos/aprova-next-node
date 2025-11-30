import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useOnboarding() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (profile) {
      checkOnboardingStatus();
    }
  }, [profile]);

  const checkOnboardingStatus = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', profile.id)
        .single();

      if (error) throw error;

      setOnboardingCompleted(data?.onboarding_completed || false);
    } catch (error: any) {
      console.error('Erro ao verificar status do onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', profile.id);

      if (error) throw error;

      setOnboardingCompleted(true);
      toast.success('Configuração inicial concluída!', {
        description: 'Bem-vindo ao AprovaCRM!',
      });
    } catch (error: any) {
      toast.error('Erro ao concluir onboarding', {
        description: error.message,
      });
      throw error;
    }
  };

  return {
    loading,
    onboardingCompleted,
    completeOnboarding,
    checkOnboardingStatus,
  };
}