-- Atualizar política RLS para permitir que todos os usuários vejam logs da sua empresa
DROP POLICY IF EXISTS "Admins and Gerentes can view activity logs from their empresa" ON public.activity_logs;

CREATE POLICY "Users can view activity logs from their empresa"
ON public.activity_logs
FOR SELECT
USING (empresa_id = get_user_empresa_id(auth.uid()));