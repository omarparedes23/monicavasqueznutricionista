-- ============================================================
-- TIENDA ONLINE — Catálogo de productos naturales
-- Ejecutar en Supabase → SQL Editor (después de schema.sql)
-- ============================================================

-- ------------------------------------------------------------
-- TABLA: nutri_productos
-- Catálogo público. La venta se concreta por WhatsApp (no hay
-- carrito ni pago online). Gestión manual vía SQL.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nutri_productos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  descripcion       TEXT,                     -- corta, para la card (1-2 líneas)
  descripcion_larga TEXT,                     -- detalle: beneficios, modo de uso
  precio            NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  categoria         TEXT NOT NULL,            -- ej: 'Proteínas', 'Vitaminas', 'Tés e infusiones', 'Snacks'
  imagen_url        TEXT,                     -- URL pública (R2)
  mostrar_en_tienda BOOLEAN NOT NULL DEFAULT FALSE,
  orden             INTEGER NOT NULL DEFAULT 0, -- menor = aparece primero
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutri_productos_tienda
  ON public.nutri_productos (mostrar_en_tienda, orden);

-- Trigger updated_at (función propia prefijada: instancia compartida)
CREATE TRIGGER set_updated_at_nutri_productos
  BEFORE UPDATE ON public.nutri_productos
  FOR EACH ROW EXECUTE FUNCTION public.nutri_set_updated_at();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Lectura pública solo de productos visibles. Escritura solo
-- vía service_role (gestión manual con SQL).
-- ------------------------------------------------------------
ALTER TABLE public.nutri_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de productos visibles"
  ON public.nutri_productos
  FOR SELECT
  USING (mostrar_en_tienda = TRUE);

-- ------------------------------------------------------------
-- SEED: productos de ejemplo (reemplazar por los reales)
-- Las imágenes de test están en R2, bucket PÚBLICO
-- `monicanutri-public` (prefijo productos/). El bucket privado
-- `monicanutricionista` es solo para archivos de pacientes.
-- ------------------------------------------------------------
INSERT INTO public.nutri_productos
  (nombre, slug, descripcion, descripcion_larga, precio, categoria, imagen_url, mostrar_en_tienda, orden)
VALUES
  (
    'Proteína vegetal en polvo',
    'proteina-vegetal',
    'Mezcla de proteína de arveja y arroz. Sabor vainilla, 500 g.',
    'Proteína vegetal completa a base de arveja y arroz integral, ideal para complementar tu ingesta proteica diaria.' || E'\n\n' ||
    'Modo de uso: mezclar 30 g (1 medida) en 250 ml de agua o leche vegetal, una vez al día.' || E'\n\n' ||
    'Sin azúcar añadida. Apto vegano.',
    89, 'Proteínas',
    'https://pub-2a439e7ad59443c5a3b0b939e4ef6b3e.r2.dev/productos/proteina-vegetal.webp',
    TRUE, 1
  ),
  (
    'Complejo vitamínico B',
    'complejo-vitaminico-b',
    'Vitaminas del grupo B para energía y sistema nervioso. 60 cápsulas.',
    'Complejo B con B1, B6, B9 y B12 en formas biodisponibles.' || E'\n\n' ||
    'Contribuye al metabolismo energético normal y a disminuir el cansancio y la fatiga.' || E'\n\n' ||
    'Modo de uso: 1 cápsula al día con el desayuno.',
    45, 'Vitaminas y minerales',
    'https://pub-2a439e7ad59443c5a3b0b939e4ef6b3e.r2.dev/productos/complejo-vitaminico-b.jpg',
    TRUE, 2
  ),
  (
    'Té verde orgánico',
    'te-verde-organico',
    'Té verde orgánico en hebras, antioxidante natural. 100 g.',
    'Té verde orgánico de cultivo certificado, rico en polifenoles y catequinas.' || E'\n\n' ||
    'Preparación: infusionar 1 cucharadita en agua a 80 °C durante 2-3 minutos.',
    25, 'Tés e infusiones',
    'https://pub-2a439e7ad59443c5a3b0b939e4ef6b3e.r2.dev/productos/te-verde-organico.jpg',
    TRUE, 3
  ),
  (
    'Mix de frutos secos',
    'mix-frutos-secos',
    'Almendras, nueces y castañas de cajú sin sal añadida. 250 g.',
    'Mix natural de almendras, nueces y castañas de cajú, fuente de grasas saludables, magnesio y zinc.' || E'\n\n' ||
    'Ideal como snack entre comidas: una porción de 30 g (un puñado).',
    32, 'Snacks saludables',
    'https://pub-2a439e7ad59443c5a3b0b939e4ef6b3e.r2.dev/productos/mix-frutos-secos.jpg',
    TRUE, 4
  );
