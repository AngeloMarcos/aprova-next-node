-- Atualizar a função get_dashboard_kpis para retornar os campos corretos
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(_empresa_id uuid)
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'total_clientes', (
      SELECT COUNT(*) FROM public.clientes 
      WHERE empresa_id = _empresa_id
    ),
    'total_propostas', (
      SELECT COUNT(*) FROM public.propostas 
      WHERE empresa_id = _empresa_id
    ),
    'total_bancos', (
      SELECT COUNT(*) FROM public.bancos 
      WHERE empresa_id = _empresa_id OR empresa_id IS NULL
    ),
    'total_produtos', (
      SELECT COUNT(*) FROM public.produtos 
      WHERE empresa_id = _empresa_id
    ),
    'propostas_aprovadas', (
      SELECT COUNT(*) FROM public.propostas 
      WHERE empresa_id = _empresa_id 
        AND status = 'aprovada'
    ),
    'propostas_analise', (
      SELECT COUNT(*) FROM public.propostas 
      WHERE empresa_id = _empresa_id 
        AND status = 'em_analise'
    ),
    'propostas_pendentes', (
      SELECT COUNT(*) FROM public.propostas 
      WHERE empresa_id = _empresa_id 
        AND status IN ('rascunho')
    ),
    'valor_total_aprovado', (
      SELECT COALESCE(SUM(valor), 0) FROM public.propostas 
      WHERE empresa_id = _empresa_id
        AND status = 'aprovada'
    ),
    'ticket_medio', (
      SELECT COALESCE(AVG(valor), 0) FROM public.propostas 
      WHERE empresa_id = _empresa_id
        AND status = 'aprovada'
    ),
    'taxa_aprovacao', (
      SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE status = 'aprovada')::numeric / COUNT(*)::numeric) * 100, 
          1
        )
      END
      FROM public.propostas 
      WHERE empresa_id = _empresa_id
    )
  );
$$;