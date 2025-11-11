-- Drop existing overly permissive policies and create proper authenticated-only policies

-- BANCOS TABLE
DROP POLICY IF EXISTS "bancos_select_authenticated" ON public.bancos;
DROP POLICY IF EXISTS "bancos_insert_authenticated" ON public.bancos;
DROP POLICY IF EXISTS "bancos_update_authenticated" ON public.bancos;
DROP POLICY IF EXISTS "bancos_delete_authenticated" ON public.bancos;

CREATE POLICY "bancos_select_authenticated" ON public.bancos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "bancos_insert_authenticated" ON public.bancos
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "bancos_update_authenticated" ON public.bancos
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "bancos_delete_authenticated" ON public.bancos
  FOR DELETE TO authenticated
  USING (true);

-- CLIENTES TABLE
DROP POLICY IF EXISTS "clientes_select_authenticated" ON public.clientes;
DROP POLICY IF EXISTS "clientes_insert_authenticated" ON public.clientes;
DROP POLICY IF EXISTS "clientes_update_authenticated" ON public.clientes;
DROP POLICY IF EXISTS "clientes_delete_authenticated" ON public.clientes;

CREATE POLICY "clientes_select_authenticated" ON public.clientes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "clientes_insert_authenticated" ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "clientes_update_authenticated" ON public.clientes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "clientes_delete_authenticated" ON public.clientes
  FOR DELETE TO authenticated
  USING (true);

-- EMPRESAS TABLE
DROP POLICY IF EXISTS "empresas_select_authenticated" ON public.empresas;
DROP POLICY IF EXISTS "empresas_insert_authenticated" ON public.empresas;
DROP POLICY IF EXISTS "empresas_update_authenticated" ON public.empresas;
DROP POLICY IF EXISTS "empresas_delete_authenticated" ON public.empresas;

CREATE POLICY "empresas_select_authenticated" ON public.empresas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "empresas_insert_authenticated" ON public.empresas
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "empresas_update_authenticated" ON public.empresas
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "empresas_delete_authenticated" ON public.empresas
  FOR DELETE TO authenticated
  USING (true);

-- PRODUTOS TABLE
DROP POLICY IF EXISTS "produtos_select_authenticated" ON public.produtos;
DROP POLICY IF EXISTS "produtos_insert_authenticated" ON public.produtos;
DROP POLICY IF EXISTS "produtos_update_authenticated" ON public.produtos;
DROP POLICY IF EXISTS "produtos_delete_authenticated" ON public.produtos;

CREATE POLICY "produtos_select_authenticated" ON public.produtos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "produtos_insert_authenticated" ON public.produtos
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "produtos_update_authenticated" ON public.produtos
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "produtos_delete_authenticated" ON public.produtos
  FOR DELETE TO authenticated
  USING (true);

-- PROPOSTAS TABLE
DROP POLICY IF EXISTS "propostas_select_authenticated" ON public.propostas;
DROP POLICY IF EXISTS "propostas_insert_authenticated" ON public.propostas;
DROP POLICY IF EXISTS "propostas_update_authenticated" ON public.propostas;
DROP POLICY IF EXISTS "propostas_delete_authenticated" ON public.propostas;

CREATE POLICY "propostas_select_authenticated" ON public.propostas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "propostas_insert_authenticated" ON public.propostas
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "propostas_update_authenticated" ON public.propostas
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "propostas_delete_authenticated" ON public.propostas
  FOR DELETE TO authenticated
  USING (true);

-- USUARIOS TABLE
DROP POLICY IF EXISTS "usuarios_select_authenticated" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_authenticated" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_authenticated" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete_authenticated" ON public.usuarios;

CREATE POLICY "usuarios_select_authenticated" ON public.usuarios
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "usuarios_insert_authenticated" ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "usuarios_update_authenticated" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "usuarios_delete_authenticated" ON public.usuarios
  FOR DELETE TO authenticated
  USING (true);