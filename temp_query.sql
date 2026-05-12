-- Crear bucket para planes alimentarios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'planes',
  'planes',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: pacientes solo ven archivos de sus propios planes
CREATE POLICY "Planes SELECT propio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'planes'
    AND auth.role() = 'authenticated'
    AND (
      -- El paciente puede ver archivos de planes que le pertenecen
      EXISTS (
        SELECT 1 FROM nutri_planes p
        WHERE p.id::text = (storage.foldername(name))[1]
        AND p.paciente_id = auth.uid()
      )
    )
  );

-- RLS: profesional puede ver todos los archivos del bucket planes
CREATE POLICY "Planes SELECT profesional"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'planes'
    AND EXISTS (
      SELECT 1 FROM nutri_perfiles p
      WHERE p.id = auth.uid() AND p.rol = 'profesional'
    )
  );

-- RLS: profesional puede insertar archivos
CREATE POLICY "Planes INSERT profesional"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'planes'
    AND EXISTS (
      SELECT 1 FROM nutri_perfiles p
      WHERE p.id = auth.uid() AND p.rol = 'profesional'
    )
  );

-- RLS: profesional puede actualizar archivos
CREATE POLICY "Planes UPDATE profesional"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'planes'
    AND EXISTS (
      SELECT 1 FROM nutri_perfiles p
      WHERE p.id = auth.uid() AND p.rol = 'profesional'
    )
  );

-- RLS: profesional puede eliminar archivos
CREATE POLICY "Planes DELETE profesional"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'planes'
    AND EXISTS (
      SELECT 1 FROM nutri_perfiles p
      WHERE p.id = auth.uid() AND p.rol = 'profesional'
    )
  );
