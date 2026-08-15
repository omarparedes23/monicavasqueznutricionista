-- ============================================================
-- FIX SEGURIDAD (auditoría 2026-08-14)
-- Idempotente: se puede ejecutar varias veces sin daño.
--
-- 1. CRITICA: evitar auto-promoción de rol vía RLS (WITH CHECK)
-- 2. ALTA: bloquear INSERT directo de citas por anon key
-- 3. Definir get_my_rol() (referenciada por policy de nutri_fotos)
-- 4. Desnormalizar email/telefono en nutri_perfiles (fix getPacientes)
-- 5. Definir get_user_id_by_email (referenciada por lib/services/booking.ts)
-- ============================================================

-- ============================================================
-- 1. CRITICA — nutri_perfiles: UPDATE sin WITH CHECK permitía
--    que cualquier usuario autenticado cambiara su propio rol a
--    'profesional' (PostgreSQL usa USING también como check de la
--    fila nueva cuando no hay WITH CHECK).
--    Fix: WITH CHECK explícito + revocar UPDATE sobre la columna
--    `rol` para los roles anon/authenticated (defensa en profundidad:
--    la columna rol solo se escribe vía service role / SQL admin).
-- ============================================================
DROP POLICY IF EXISTS "Perfil UPDATE propio" ON nutri_perfiles;

CREATE POLICY "Perfil UPDATE propio"
  ON nutri_perfiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

REVOKE UPDATE (rol) ON nutri_perfiles FROM anon, authenticated;

-- ============================================================
-- 2. ALTA — nutri_citas: la política "Inserción pública de citas"
--    con WITH CHECK (TRUE) permitía insertar citas arbitrarias
--    directo contra PostgREST con la anon key, saltándose la
--    validación de slots y la anti-race de lib/services/booking.ts.
--    El flujo real de reserva escribe con service role (bypass RLS),
--    así que negar el INSERT directo anónimo no afecta a la app.
-- ============================================================
DROP POLICY IF EXISTS "Inserción pública de citas" ON nutri_citas;

CREATE POLICY "Inserción pública de citas"
  ON nutri_citas FOR INSERT
  WITH CHECK (FALSE);

-- ============================================================
-- 3. get_my_rol() — función que la policy "Fotos all profesional"
--    de nutri_fotos referencia pero que no estaba definida en
--    ningún SQL versionado (schema no reproducible).
--    SECURITY DEFINER + SET search_path (instancia compartida).
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_rol()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM public.nutri_perfiles WHERE id = auth.uid()
$$;

-- ============================================================
-- 4. Desnormalizar email/telefono en nutri_perfiles.
--    getPacientes() hacía join en memoria con auth.admin.listUsers
--    (falla con "Database error finding users" en esta instancia
--    compartida). Con estas columnas, una sola query a
--    nutri_perfiles basta y no depende de la API admin de auth.
-- ============================================================
ALTER TABLE nutri_perfiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE nutri_perfiles ADD COLUMN IF NOT EXISTS telefono TEXT;

-- Backfill: poblar email/telefono de los perfiles existentes
-- desde auth.users (una sola vez; idempotente).
UPDATE nutri_perfiles p
SET email = u.email,
    telefono = COALESCE(p.telefono, u.raw_user_meta_data->>'telefono')
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

-- Actualizar el trigger de nuevo usuario para poblar las columnas
-- nuevas. Se preserva nombre/rol existentes en conflicto.
CREATE OR REPLACE FUNCTION public.nutri_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.nutri_perfiles (id, nombre, rol, email, telefono)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    'paciente',
    NEW.email,
    NEW.raw_user_meta_data->>'telefono'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        telefono = COALESCE(EXCLUDED.telefono, nutri_perfiles.telefono);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- 5. get_user_id_by_email — RPC invocada por lib/services/booking.ts
--    para vincular usuarios existentes; no estaba definida en SQL
--    versionado (falla silenciosa: paciente_id quedaba NULL).
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE email = user_email LIMIT 1
$$;
