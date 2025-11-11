-- Setup initial admin user
-- First, ensure we have a default empresa
INSERT INTO public.empresas (id, nome, cnpj)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Empresa Padrão',
  '00.000.000/0000-00'
)
ON CONFLICT (id) DO NOTHING;

-- Create profile for existing user (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '4effce71-a22b-4553-9b2b-b9bdd85dc28e') THEN
    INSERT INTO public.profiles (id, email, nome, empresa_id)
    VALUES (
      '4effce71-a22b-4553-9b2b-b9bdd85dc28e',
      'angelobispofilho@gmail.com',
      'Angelo Bispo',
      '00000000-0000-0000-0000-000000000001'
    );
  ELSE
    UPDATE public.profiles 
    SET 
      email = 'angelobispofilho@gmail.com',
      nome = 'Angelo Bispo',
      empresa_id = '00000000-0000-0000-0000-000000000001'
    WHERE id = '4effce71-a22b-4553-9b2b-b9bdd85dc28e';
  END IF;
END $$;

-- Assign admin role (delete existing first, then insert)
DELETE FROM public.user_roles WHERE user_id = '4effce71-a22b-4553-9b2b-b9bdd85dc28e';

INSERT INTO public.user_roles (user_id, role, empresa_id)
VALUES (
  '4effce71-a22b-4553-9b2b-b9bdd85dc28e',
  'admin',
  '00000000-0000-0000-0000-000000000001'
);