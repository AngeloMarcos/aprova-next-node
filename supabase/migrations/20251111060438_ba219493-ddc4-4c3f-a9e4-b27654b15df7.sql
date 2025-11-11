-- Create activity_logs table for auditing
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type TEXT NOT NULL, -- 'cliente', 'banco', 'proposta', 'produto', 'user'
  entity_id UUID,
  entity_name TEXT,
  details JSONB,
  previous_value JSONB,
  new_value JSONB,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX idx_activity_logs_empresa_id ON public.activity_logs(empresa_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins and gerentes can view logs from their empresa
CREATE POLICY "Admins and Gerentes can view activity logs from their empresa"
  ON public.activity_logs
  FOR SELECT
  USING (
    empresa_id = get_user_empresa_id(auth.uid()) 
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  );

-- Function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  _user_id UUID,
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _entity_name TEXT,
  _details JSONB DEFAULT NULL,
  _previous_value JSONB DEFAULT NULL,
  _new_value JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
  _user_email TEXT;
  _user_name TEXT;
  _empresa_id UUID;
BEGIN
  -- Get user info
  SELECT email INTO _user_email FROM auth.users WHERE id = _user_id;
  SELECT nome, empresa_id INTO _user_name, _empresa_id FROM public.profiles WHERE id = _user_id;

  -- Insert log
  INSERT INTO public.activity_logs (
    user_id,
    user_email,
    user_name,
    action,
    entity_type,
    entity_id,
    entity_name,
    details,
    previous_value,
    new_value,
    empresa_id
  ) VALUES (
    _user_id,
    _user_email,
    _user_name,
    _action,
    _entity_type,
    _entity_id,
    _entity_name,
    _details,
    _previous_value,
    _new_value,
    _empresa_id
  ) RETURNING id INTO _log_id;

  RETURN _log_id;
END;
$$;

-- Trigger function for clientes
CREATE OR REPLACE FUNCTION public.log_clientes_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM log_activity(
      auth.uid(),
      'create',
      'cliente',
      NEW.id,
      NEW.nome,
      jsonb_build_object('cpf', NEW.cpf, 'email', NEW.email),
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM log_activity(
      auth.uid(),
      'update',
      'cliente',
      NEW.id,
      NEW.nome,
      jsonb_build_object('changed_fields', jsonb_object_keys(to_jsonb(NEW) - to_jsonb(OLD))),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM log_activity(
      auth.uid(),
      'delete',
      'cliente',
      OLD.id,
      OLD.nome,
      to_jsonb(OLD),
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for bancos
CREATE OR REPLACE FUNCTION public.log_bancos_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM log_activity(
      auth.uid(),
      'create',
      'banco',
      NEW.id,
      NEW.nome,
      jsonb_build_object('cnpj', NEW.cnpj, 'email', NEW.email),
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM log_activity(
      auth.uid(),
      'update',
      'banco',
      NEW.id,
      NEW.nome,
      NULL,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM log_activity(
      auth.uid(),
      'delete',
      'banco',
      OLD.id,
      OLD.nome,
      to_jsonb(OLD),
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for propostas
CREATE OR REPLACE FUNCTION public.log_propostas_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cliente_nome TEXT;
BEGIN
  -- Get cliente name
  SELECT nome INTO _cliente_nome FROM public.clientes WHERE id = COALESCE(NEW.cliente_id, OLD.cliente_id);

  IF (TG_OP = 'INSERT') THEN
    PERFORM log_activity(
      auth.uid(),
      'create',
      'proposta',
      NEW.id,
      _cliente_nome,
      jsonb_build_object('valor', NEW.valor, 'status', NEW.status),
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM log_activity(
      auth.uid(),
      'update',
      'proposta',
      NEW.id,
      _cliente_nome,
      jsonb_build_object('status_change', OLD.status || ' → ' || NEW.status),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM log_activity(
      auth.uid(),
      'delete',
      'proposta',
      OLD.id,
      _cliente_nome,
      to_jsonb(OLD),
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for produtos
CREATE OR REPLACE FUNCTION public.log_produtos_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM log_activity(
      auth.uid(),
      'create',
      'produto',
      NEW.id,
      NEW.nome,
      jsonb_build_object('tipo_credito', NEW.tipo_credito, 'status', NEW.status),
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM log_activity(
      auth.uid(),
      'update',
      'produto',
      NEW.id,
      NEW.nome,
      NULL,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM log_activity(
      auth.uid(),
      'delete',
      'produto',
      OLD.id,
      OLD.nome,
      to_jsonb(OLD),
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_log_clientes_changes ON public.clientes;
CREATE TRIGGER trigger_log_clientes_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION log_clientes_changes();

DROP TRIGGER IF EXISTS trigger_log_bancos_changes ON public.bancos;
CREATE TRIGGER trigger_log_bancos_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.bancos
  FOR EACH ROW EXECUTE FUNCTION log_bancos_changes();

DROP TRIGGER IF EXISTS trigger_log_propostas_changes ON public.propostas;
CREATE TRIGGER trigger_log_propostas_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.propostas
  FOR EACH ROW EXECUTE FUNCTION log_propostas_changes();

DROP TRIGGER IF EXISTS trigger_log_produtos_changes ON public.produtos;
CREATE TRIGGER trigger_log_produtos_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION log_produtos_changes();