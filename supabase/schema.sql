-- ============================================================
-- SCHEMA: Sistema de Gestión de Citas - Nutricionista
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: profesional_config
-- Configuración global del profesional (singleton)
-- ============================================================
CREATE TABLE IF NOT EXISTS profesional_config (
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
CREATE UNIQUE INDEX IF NOT EXISTS profesional_config_singleton
  ON profesional_config ((TRUE));

-- ============================================================
-- TABLA: disponibilidad_semanal
-- Bloques de trabajo por día de la semana (0=Dom, 1=Lun ... 6=Sab)
-- ============================================================
CREATE TABLE IF NOT EXISTS disponibilidad_semanal (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id   UUID NOT NULL REFERENCES profesional_config(id) ON DELETE CASCADE,
  dia_semana       INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio      TIME NOT NULL,
  hora_fin         TIME NOT NULL,
  activo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hora_fin_despues_inicio CHECK (hora_fin > hora_inicio),
  CONSTRAINT no_solapamiento UNIQUE (profesional_id, dia_semana, hora_inicio)
);

-- ============================================================
-- TABLA: citas
-- Reservas de los pacientes
-- ============================================================
CREATE TABLE IF NOT EXISTS citas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id   UUID NOT NULL REFERENCES profesional_config(id) ON DELETE CASCADE,
  -- Datos del paciente
  paciente_nombre  TEXT NOT NULL,
  paciente_email   TEXT NOT NULL,
  paciente_telefono TEXT NOT NULL,
  -- Datos de la cita
  fecha_inicio     TIMESTAMPTZ NOT NULL,
  fecha_fin        TIMESTAMPTZ NOT NULL,
  -- Estado
  estado           TEXT NOT NULL DEFAULT 'confirmada'
    CHECK (estado IN ('confirmada', 'cancelada', 'completada', 'no_asistio')),
  notas            TEXT,
  -- Notificaciones
  email_paciente_enviado      BOOLEAN NOT NULL DEFAULT FALSE,
  email_profesional_enviado   BOOLEAN NOT NULL DEFAULT FALSE,
  -- Metadata
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fin_despues_inicio CHECK (fecha_fin > fecha_inicio)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_citas_fecha_inicio
  ON citas (fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_citas_profesional_fecha
  ON citas (profesional_id, fecha_inicio)
  WHERE estado = 'confirmada';

CREATE INDEX IF NOT EXISTS idx_citas_paciente_email
  ON citas (paciente_email);

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

CREATE TRIGGER set_updated_at_profesional_config
  BEFORE UPDATE ON profesional_config
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_citas
  BEFORE UPDATE ON citas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profesional_config      ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad_semanal  ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas                   ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para mostrar disponibilidad y horarios)
CREATE POLICY "Lectura pública config"
  ON profesional_config FOR SELECT USING (TRUE);

CREATE POLICY "Lectura pública disponibilidad"
  ON disponibilidad_semanal FOR SELECT USING (TRUE);

-- Cualquiera puede insertar una cita (reserva sin login)
CREATE POLICY "Inserción pública de citas"
  ON citas FOR INSERT WITH CHECK (TRUE);

-- Lectura de citas: solo el service role puede ver todas
-- (el frontend lee disponibilidad via server action con service role)
CREATE POLICY "Service role lee citas"
  ON citas FOR SELECT USING (TRUE);

-- ============================================================
-- DATOS INICIALES (seed)
-- ============================================================

-- Configuración del profesional
INSERT INTO profesional_config (nombre, titulo, email_notificacion, duracion_cita_minutos, zona_horaria)
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
  SELECT id INTO prof_id FROM profesional_config LIMIT 1;

  -- Lunes (1)
  INSERT INTO disponibilidad_semanal (profesional_id, dia_semana, hora_inicio, hora_fin)
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
