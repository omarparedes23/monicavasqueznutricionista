# Tasks: Cloudflare R2 Storage + Fotos de Pacientes

## Phase 1: Infraestructura y tipos

- [ ] 1.1 Instalar dependencias: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

- [ ] 1.2 Crear `lib/r2/client.ts` — exportar `r2Client` (`S3Client` con endpoint `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, region `"auto"`, credenciales desde env) y constante `R2_BUCKET`

- [ ] 1.3 Agregar variables a `.env.local`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

- [ ] 1.4 En `types/index.ts`, agregar interface `Foto` con campos: `id`, `paciente_id`, `titulo`, `descripcion`, `r2_key`, `activo`, `created_by`, `created_at`, `updated_at`

- [ ] 1.5 Ejecutar en Supabase SQL Editor — crear tabla `nutri_fotos`:
  ```sql
  CREATE TABLE IF NOT EXISTS nutri_fotos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES nutri_perfiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    r2_key TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES nutri_perfiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_nutri_fotos_paciente ON nutri_fotos (paciente_id);
  ALTER TABLE nutri_fotos ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Fotos all profesional" ON nutri_fotos FOR ALL USING (get_my_rol() = 'profesional');
  ```
  También agregar el bloque en `supabase/schema.sql` para mantener el archivo en sync.

## Phase 2: Migración del archivo existente en Supabase Storage

- [ ] 2.1 Obtener la URL firmada del archivo existente en Supabase y descargarlo localmente

- [ ] 2.2 Subir el archivo a R2 bajo la key `pacientes/d88a34e3-43a7-4850-8604-7fe67b576a5e/planes/3189bd74-29b0-41a0-85d7-8a25375d378a-Exam_Jenkins.pdf` usando la consola de Cloudflare o AWS CLI

- [ ] 2.3 Ejecutar en Supabase SQL Editor:
  ```sql
  UPDATE nutri_planes 
  SET file_url = 'pacientes/d88a34e3-43a7-4850-8604-7fe67b576a5e/planes/3189bd74-29b0-41a0-85d7-8a25375d378a-Exam_Jenkins.pdf'
  WHERE file_url LIKE 'planes/d88a34e3%';
  ```

## Phase 3: Server Actions

- [ ] 3.1 En `lib/actions/planes.ts`, modificar `subirPlanProfesional`:
  - Reemplazar `serviceClient.storage.from("planes").upload(...)` por `PutObjectCommand` + `r2Client.send(...)`
  - Nuevo path: `pacientes/${pacienteId}/planes/${uuid}-${safeName}`

- [ ] 3.2 En `lib/actions/planes.ts`, modificar `getPlanSignedUrl`:
  - Detectar storage por prefijo: `file_url.startsWith("pacientes/")` → R2 (`GetObjectCommand` + `getSignedUrl`)
  - Fallback: `file_url.startsWith("planes/")` → Supabase Storage (código existente, para legado)

- [ ] 3.3 Crear `lib/actions/fotos.ts` con:
  - `subirFotoProfesional(pacienteId, formData)`: valida MIME (`image/jpeg|image/png|image/webp|image/jpg`) y tamaño ≤ 5MB; sube a R2 `pacientes/{id}/fotos/{uuid}-{name}`; INSERT `nutri_fotos`
  - `getFotosPaciente(pacienteId)`: SELECT `nutri_fotos` con service role, orden DESC
  - `getFotoSignedUrl(fotoId)`: verifica acceso, genera presigned URL R2 (60s)

## Phase 4: Componentes UI

- [ ] 4.1 Crear `components/dashboard/SubirFotoForm.tsx` — misma estructura que `SubirPlanForm` pero con `accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"`, tamaño máx 5MB, llama `subirFotoProfesional`

- [ ] 4.2 Crear `components/dashboard/VerFotoButton.tsx` — botón que llama `getFotoSignedUrl(fotoId)` y abre la URL en nueva pestaña (`window.open(url, "_blank")`)

## Phase 5: Integración en página de detalle

- [ ] 5.1 En `app/(dashboard)/profesional/pacientes/[id]/page.tsx`:
  - Importar `getFotosPaciente`, `SubirFotoForm`, `VerFotoButton`
  - Agregar al `Promise.all` inicial: `getFotosPaciente(id)`
  - Agregar sección "Fotos de evolución" con `SubirFotoForm` + lista de fotos con `VerFotoButton`

## Phase 6: Verificación

- [ ] 6.1 Ejecutar `tsc --noEmit` — cero errores de tipos
- [ ] 6.2 Subir un PDF desde `/profesional/pacientes/{id}` → verificar objeto en R2 console bajo `pacientes/{id}/planes/`
- [ ] 6.3 Descargar el plan → presigned URL funcional
- [ ] 6.4 Subir foto JPEG → verificar en R2 bajo `pacientes/{id}/fotos/`
- [ ] 6.5 Intentar subir PDF como foto → error "tipos aceptados"
- [ ] 6.6 Verificar que el archivo legacy (migrado en Phase 2) sigue descargándose correctamente
