-- ============================================================
-- FIX: trigger updated_at en instancia Supabase COMPARTIDA
-- ------------------------------------------------------------
-- La función genérica public.trigger_set_updated_at() fue
-- sobrescrita por el proyecto kleinerfeigling (kleiner_*) con
-- NEW.actualizado_en, rompiendo TODOS los UPDATE en tablas
-- nutri_* (que usan updated_at).
--
-- Solución: función propia nutri_set_updated_at() y repuntar
-- los triggers de las tablas nutri_*. No se toca la función
-- genérica ni las tablas kleiner_*.
-- ============================================================

CREATE OR REPLACE FUNCTION public.nutri_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Repuntar triggers nutri_* a la nueva función
DROP TRIGGER IF EXISTS set_updated_at_nutri_profesional_config ON public.nutri_profesional_config;
CREATE TRIGGER set_updated_at_nutri_profesional_config
  BEFORE UPDATE ON public.nutri_profesional_config
  FOR EACH ROW EXECUTE FUNCTION public.nutri_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_nutri_citas ON public.nutri_citas;
CREATE TRIGGER set_updated_at_nutri_citas
  BEFORE UPDATE ON public.nutri_citas
  FOR EACH ROW EXECUTE FUNCTION public.nutri_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_nutri_perfiles ON public.nutri_perfiles;
CREATE TRIGGER set_updated_at_nutri_perfiles
  BEFORE UPDATE ON public.nutri_perfiles
  FOR EACH ROW EXECUTE FUNCTION public.nutri_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_nutri_antropometria ON public.nutri_antropometria;
CREATE TRIGGER set_updated_at_nutri_antropometria
  BEFORE UPDATE ON public.nutri_antropometria
  FOR EACH ROW EXECUTE FUNCTION public.nutri_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_nutri_planes ON public.nutri_planes;
CREATE TRIGGER set_updated_at_nutri_planes
  BEFORE UPDATE ON public.nutri_planes
  FOR EACH ROW EXECUTE FUNCTION public.nutri_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_nutri_blog_posts ON public.nutri_blog_posts;
CREATE TRIGGER set_updated_at_nutri_blog_posts
  BEFORE UPDATE ON public.nutri_blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.nutri_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_nutri_productos ON public.nutri_productos;
CREATE TRIGGER set_updated_at_nutri_productos
  BEFORE UPDATE ON public.nutri_productos
  FOR EACH ROW EXECUTE FUNCTION public.nutri_set_updated_at();
