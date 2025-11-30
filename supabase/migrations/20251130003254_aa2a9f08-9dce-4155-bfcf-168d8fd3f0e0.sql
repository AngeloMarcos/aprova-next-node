-- Adicionar coluna onboarding_completed na tabela profiles
-- Para rastrear se o usuário/empresa já completou o onboarding

ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Criar índice para melhorar performance de consultas
CREATE INDEX idx_profiles_onboarding ON public.profiles(onboarding_completed, empresa_id);

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indica se o usuário completou o wizard de onboarding inicial';