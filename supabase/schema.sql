-- ============================================================
-- SCHEMA: Sistema de Gestión de Citas - Nutricionista
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: nutri_profesional_config
-- Configuración global del profesional (singleton)
-- ============================================================
CREATE TABLE IF NOT EXISTS nutri_profesional_config (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre           TEXT NOT NULL DEFAULT 'Monica Nutricionista',
  titulo           TEXT NOT NULL DEFAULT 'Licenciada en Nutrición',
  email_notificacion TEXT NOT NULL,
  duracion_cita_minutos INTEGER NOT NULL DEFAULT 60
    CHECK (duracion_cita_minutos IN (15, 20, 30, 45, 60, 90)),
  zona_horaria     TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solo puede existir un registro (singleton)
CREATE UNIQUE INDEX IF NOT EXISTS idx_nutri_profesional_config_singleton
  ON nutri_profesional_config ((TRUE));

-- ============================================================
-- TABLA: nutri_disponibilidad_semanal
-- Bloques de trabajo por día de la semana (0=Dom, 1=Lun ... 6=Sab)
-- ============================================================
CREATE TABLE IF NOT EXISTS nutri_disponibilidad_semanal (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id   UUID NOT NULL REFERENCES nutri_profesional_config(id) ON DELETE CASCADE,
  dia_semana       INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio      TIME NOT NULL,
  hora_fin         TIME NOT NULL,
  activo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hora_fin_despues_inicio CHECK (hora_fin > hora_inicio),
  CONSTRAINT no_solapamiento UNIQUE (profesional_id, dia_semana, hora_inicio)
);

-- ============================================================
-- TABLA: nutri_perfiles
-- Perfiles de usuarios (pacientes y profesionales)
-- ============================================================
CREATE TABLE IF NOT EXISTS nutri_perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  foto_url TEXT,
  fecha_nacimiento DATE,
  historia_clinica TEXT,
  rol TEXT NOT NULL DEFAULT 'paciente' CHECK (rol IN ('paciente', 'profesional')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutri_perfiles_rol ON nutri_perfiles (rol);

-- ============================================================
-- TABLA: nutri_citas
-- Reservas de los pacientes
-- ============================================================
CREATE TABLE IF NOT EXISTS nutri_citas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id   UUID NOT NULL REFERENCES nutri_profesional_config(id) ON DELETE CASCADE,
  paciente_id      UUID REFERENCES nutri_perfiles(id) ON DELETE SET NULL,
  paciente_nombre  TEXT NOT NULL,
  paciente_email   TEXT NOT NULL,
  paciente_telefono TEXT NOT NULL,
  fecha_inicio     TIMESTAMPTZ NOT NULL,
  fecha_fin        TIMESTAMPTZ NOT NULL,
  estado           TEXT NOT NULL DEFAULT 'confirmada'
    CHECK (estado IN ('confirmada', 'cancelada', 'completada', 'no_asistio')),
  notas            TEXT,
  email_paciente_enviado      BOOLEAN NOT NULL DEFAULT FALSE,
  email_profesional_enviado   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fin_despues_inicio CHECK (fecha_fin > fecha_inicio)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_nutri_citas_fecha_inicio
  ON nutri_citas (fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_nutri_citas_profesional_fecha
  ON nutri_citas (profesional_id, fecha_inicio)
  WHERE estado = 'confirmada';

CREATE INDEX IF NOT EXISTS idx_nutri_citas_paciente_email
  ON nutri_citas (paciente_email);

CREATE INDEX IF NOT EXISTS idx_nutri_citas_paciente_id
  ON nutri_citas (paciente_id);

-- ============================================================
-- TABLA: nutri_antropometria
-- ============================================================
CREATE TABLE IF NOT EXISTS nutri_antropometria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES nutri_perfiles(id) ON DELETE CASCADE,
  peso DECIMAL(5,2),
  porcentaje_grasa DECIMAL(5,2),
  cintura DECIMAL(5,2),
  cadera DECIMAL(5,2),
  fecha DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutri_antropometria_paciente_fecha
  ON nutri_antropometria (paciente_id, fecha);

-- ============================================================
-- TABLA: nutri_planes
-- ============================================================
CREATE TABLE IF NOT EXISTS nutri_planes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES nutri_perfiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  file_url TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES nutri_perfiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutri_planes_paciente ON nutri_planes (paciente_id);

-- ============================================================
-- TABLA: nutri_blog_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS nutri_blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  contenido_markdown TEXT NOT NULL DEFAULT '',
  imagen_url TEXT,
  tags TEXT[],
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutri_blog_posts_slug ON nutri_blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_nutri_blog_posts_published ON nutri_blog_posts (published, published_at);

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_nutri_profesional_config
  BEFORE UPDATE ON nutri_profesional_config
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_nutri_citas
  BEFORE UPDATE ON nutri_citas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_nutri_perfiles
  BEFORE UPDATE ON nutri_perfiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_nutri_antropometria
  BEFORE UPDATE ON nutri_antropometria
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_nutri_planes
  BEFORE UPDATE ON nutri_planes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_nutri_blog_posts
  BEFORE UPDATE ON nutri_blog_posts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE nutri_profesional_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutri_disponibilidad_semanal  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutri_citas                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutri_perfiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutri_antropometria           ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutri_planes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutri_blog_posts              ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para mostrar disponibilidad y horarios)
CREATE POLICY "Lectura pública config"
  ON nutri_profesional_config FOR SELECT USING (TRUE);

CREATE POLICY "Lectura pública disponibilidad"
  ON nutri_disponibilidad_semanal FOR SELECT USING (TRUE);

-- nutri_perfiles
CREATE POLICY "Perfil SELECT propio"
  ON nutri_perfiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Perfil SELECT profesional"
  ON nutri_perfiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM nutri_perfiles p WHERE p.id = auth.uid() AND p.rol = 'profesional')
  );

CREATE POLICY "Perfil UPDATE propio"
  ON nutri_perfiles FOR UPDATE USING (id = auth.uid());

-- nutri_antropometria
CREATE POLICY "Antropometria SELECT propio"
  ON nutri_antropometria FOR SELECT USING (paciente_id = auth.uid());

CREATE POLICY "Antropometria INSERT propio"
  ON nutri_antropometria FOR INSERT WITH CHECK (paciente_id = auth.uid());

CREATE POLICY "Antropometria UPDATE propio"
  ON nutri_antropometria FOR UPDATE USING (paciente_id = auth.uid());

CREATE POLICY "Antropometria all profesional"
  ON nutri_antropometria FOR ALL USING (
    EXISTS (SELECT 1 FROM nutri_perfiles p WHERE p.id = auth.uid() AND p.rol = 'profesional')
  );

-- nutri_planes
CREATE POLICY "Planes SELECT propio"
  ON nutri_planes FOR SELECT USING (paciente_id = auth.uid());

CREATE POLICY "Planes all profesional"
  ON nutri_planes FOR ALL USING (
    EXISTS (SELECT 1 FROM nutri_perfiles p WHERE p.id = auth.uid() AND p.rol = 'profesional')
  );

-- nutri_blog_posts
CREATE POLICY "Blog SELECT publico"
  ON nutri_blog_posts FOR SELECT USING (published = TRUE);

CREATE POLICY "Blog CRUD profesional"
  ON nutri_blog_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM nutri_perfiles p WHERE p.id = auth.uid() AND p.rol = 'profesional')
  );

-- nutri_citas
-- Cualquiera puede insertar una cita (reserva sin login)
CREATE POLICY "Inserción pública de citas"
  ON nutri_citas FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Citas SELECT propias o profesional"
  ON nutri_citas FOR SELECT USING (
    paciente_id = auth.uid()
    OR EXISTS (SELECT 1 FROM nutri_perfiles p WHERE p.id = auth.uid() AND p.rol = 'profesional')
  );

CREATE POLICY "Citas UPDATE profesional"
  ON nutri_citas FOR UPDATE USING (
    EXISTS (SELECT 1 FROM nutri_perfiles p WHERE p.id = auth.uid() AND p.rol = 'profesional')
  );

-- ============================================================
-- TRIGGER: auto-insert perfil en auth.users
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.nutri_perfiles (id, nombre, rol)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email), 'paciente')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DATOS INICIALES (seed)
-- ============================================================

-- Configuración del profesional
INSERT INTO nutri_profesional_config (nombre, titulo, email_notificacion, duracion_cita_minutos, zona_horaria)
VALUES (
  'Monica García',
  'Licenciada en Nutrición y Dietética',
  'monica@ejemplo.com',
  60,
  'America/Argentina/Buenos_Aires'
)
ON CONFLICT DO NOTHING;

-- Disponibilidad semanal (Lun-Vie 9:00-13:00 y 16:00-20:00)
DO $$
DECLARE
  prof_id UUID;
BEGIN
  SELECT id INTO prof_id FROM nutri_profesional_config LIMIT 1;

  -- Lunes (1)
  INSERT INTO nutri_disponibilidad_semanal (profesional_id, dia_semana, hora_inicio, hora_fin)
  VALUES
    (prof_id, 1, '09:00', '13:00'),
    (prof_id, 1, '16:00', '20:00'),
  -- Martes (2)
    (prof_id, 2, '09:00', '13:00'),
    (prof_id, 2, '16:00', '20:00'),
  -- Miércoles (3)
    (prof_id, 3, '09:00', '13:00'),
    (prof_id, 3, '16:00', '20:00'),
  -- Jueves (4)
    (prof_id, 4, '09:00', '13:00'),
    (prof_id, 4, '16:00', '20:00'),
  -- Viernes (5)
    (prof_id, 5, '09:00', '13:00'),
    (prof_id, 5, '16:00', '18:00')
  ON CONFLICT DO NOTHING;
END $$;
