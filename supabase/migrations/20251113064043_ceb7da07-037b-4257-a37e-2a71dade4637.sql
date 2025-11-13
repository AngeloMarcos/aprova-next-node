-- Função para configurar o test@test.com como admin
CREATE OR REPLACE FUNCTION configure_test_user_as_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  test_user_id UUID;
  default_empresa UUID;
BEGIN
  -- Pegar o ID do usuário test@test.com
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@test.com';
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário test@test.com não encontrado';
  END IF;
  
  -- Pegar empresa padrão
  default_empresa := get_default_empresa_for_signup();
  
  -- Atualizar role para admin (delete e reinsert para garantir)
  DELETE FROM public.user_roles WHERE user_id = test_user_id;
  INSERT INTO public.user_roles (user_id, role, empresa_id)
  VALUES (test_user_id, 'admin', default_empresa);
  
  RAISE NOTICE 'Usuário test@test.com configurado como admin com sucesso!';
END;
$$;