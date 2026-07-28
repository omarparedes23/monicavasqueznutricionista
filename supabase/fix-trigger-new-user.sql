-- ============================================================
-- FIX: trigger de auto-creación de perfil en instancia Supabase COMPARTIDA
-- ------------------------------------------------------------
-- La función genérica public.handle_new_user() fue sobrescrita
-- por el proyecto kleinerfeigling (inserta en kleiner_profiles),
-- rompiendo la creación de citas: reservarCita() crea el usuario
-- en auth.users, el trigger on_auth_user_created dispara la
-- función de kleiner en vez de crear la fila en nutri_perfiles,
-- y el INSERT en nutri_citas falla con FK violation (23503)
-- porque paciente_id no existe en nutri_perfiles.
--
-- Mismo patrón que fix-trigger-updated-at.sql. Los proyectos
-- ptovta y ra ya habían namespaced su propio trigger
-- (ptovta_handle_new_user, ra_handle_new_user); nutri_* quedaba
-- pendiente.
--
-- Solución: función propia nutri_handle_new_user() y trigger
-- nuevo on_auth_user_created_nutri. No se toca la función
-- genérica ni el trigger on_auth_user_created (son de kleiner).
-- ============================================================

CREATE OR REPLACE FUNCTION public.nutri_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.nutri_perfiles (id, nombre, rol)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email), 'paciente')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_nutri ON auth.users;

CREATE TRIGGER on_auth_user_created_nutri
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.nutri_handle_new_user();
