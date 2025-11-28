import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActivityLog {
  id: string;
  timestamp: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  entity_type: 'cliente' | 'banco' | 'proposta' | 'produto' | 'user';
  entity_id: string | null;
  entity_name: string | null;
  details: any;
  previous_value: any;
  new_value: any;
  empresa_id: string | null;
  created_at: string;
}

export interface ActivityLogFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  entityType?: string;
  action?: string;
}

export function useActivityLog() {
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (
    page: number = 1,
    pageSize: number = 50,
    filters?: ActivityLogFilters
  ) => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // 🔒 CRITICAL: Get current user's empresa_id for multi-tenant isolation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .eq('empresa_id', profile.empresa_id) // 🔒 CRITICAL: Filter by empresa_id
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        data: (data as ActivityLog[]) || [],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error: any) {
      toast.error('Erro ao carregar log de atividades: ' + error.message);
      return { data: [], count: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // 🔒 CRITICAL: Get current user's empresa_id for multi-tenant isolation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) throw new Error('Empresa não encontrada');

      const { data, error } = await supabase
        .from('activity_logs')
        .select('user_id, user_name, user_email')
        .eq('empresa_id', profile.empresa_id) // 🔒 CRITICAL: Filter by empresa_id
        .not('user_id', 'is', null)
        .order('user_name');

      if (error) throw error;

      // Remove duplicates
      const uniqueUsers = Array.from(
        new Map(data?.map((item) => [item.user_id, item])).values()
      );

      return uniqueUsers;
    } catch (error: any) {
      toast.error('Erro ao carregar usuários: ' + error.message);
      return [];
    }
  };

  const logAuthActivity = async (action: 'login' | 'logout') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, empresa_id')
        .eq('id', user.id)
        .single();

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        user_email: user.email,
        user_name: profile?.nome,
        action,
        entity_type: 'user',
        entity_id: user.id,
        entity_name: profile?.nome,
        details: { action },
        empresa_id: profile?.empresa_id,
      });
    } catch (error) {
      // Silent fail for activity logging
      console.error('Failed to log auth activity:', error);
    }
  };

  return {
    loading,
    fetchLogs,
    fetchUsers,
    logAuthActivity,
  };
}
