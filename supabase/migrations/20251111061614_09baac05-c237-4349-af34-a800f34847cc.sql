-- Create trigger to log user login/logout activities
-- This function will be called by auth.users events

-- Note: We cannot directly create triggers on auth.users table as it's in the auth schema
-- Instead, we'll log auth events from the frontend when they occur
-- The RLS policy "Allow triggers to insert activity logs" allows these inserts

-- For now, let's create a function that can be called to log auth events
CREATE OR REPLACE FUNCTION public.log_auth_event(
  _user_id UUID,
  _action TEXT,
  _user_email TEXT DEFAULT NULL,
  _user_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
  _empresa_id UUID;
  _fetched_email TEXT;
  _fetched_name TEXT;
BEGIN
  -- Get user info if not provided
  IF _user_email IS NULL THEN
    SELECT email INTO _fetched_email FROM auth.users WHERE id = _user_id;
    _user_email := _fetched_email;
  END IF;
  
  IF _user_name IS NULL THEN
    SELECT nome, empresa_id INTO _fetched_name, _empresa_id FROM public.profiles WHERE id = _user_id;
    _user_name := _fetched_name;
  ELSE
    SELECT empresa_id INTO _empresa_id FROM public.profiles WHERE id = _user_id;
  END IF;

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
    empresa_id
  ) VALUES (
    _user_id,
    _user_email,
    _user_name,
    _action,
    'user',
    _user_id,
    _user_name,
    jsonb_build_object('action', _action),
    _empresa_id
  ) RETURNING id INTO _log_id;

  RETURN _log_id;
END;
$$;