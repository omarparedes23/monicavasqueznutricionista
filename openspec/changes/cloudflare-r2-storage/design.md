# Design: Cloudflare R2 Storage + Fotos de Pacientes

## Technical Approach

Crear un cliente R2 singleton (`lib/r2/client.ts`) usando `@aws-sdk/client-s3`.
Reemplazar las llamadas a Supabase Storage en `planes.ts` por `PutObjectCommand` (upload)
y `GetObjectCommand` + `getSignedUrl` (descarga). Agregar `lib/actions/fotos.ts` siguiendo
el mismo patrón. Nueva tabla `nutri_fotos` solo para metadata (el archivo vive en R2).

## Architecture Decisions

| Decisión | Elección | Alternativa | Razón |
|----------|----------|-------------|-------|
| Detección de storage legacy | Prefijo en `file_url`: `pacientes/` = R2, `planes/` = Supabase | Migrar obligatoriamente | Cero riesgo para el archivo existente; migración opcional |
| Tabla fotos separada | `nutri_fotos` nueva tabla | Agregar `tipo` a `nutri_planes` | Semántica distinta; campos propios (fecha_foto) sin contaminar planes |
| R2 key fotos | `pacientes/{pacienteId}/fotos/{uuid}-{filename}` | Bucket separado | Un solo bucket, organización por paciente, separación por subcarpeta |
| Singleton S3Client | `r2Client` exportado de `lib/r2/client.ts` | Crear instancia en cada action | Reusar conexión; patrón ya existente en `createServiceRoleClient` |

## Data Flow

**Upload plan (nuevo):**
```
SubirPlanForm → subirPlanProfesional(pacienteId, formData)
  │  1. Validar PDF ≤ 10MB
  │  2. PutObjectCommand → R2 key: pacientes/{id}/planes/{uuid}-{name}
  │  3. createPlanRecord({ filePath: r2_key })
  └→ router.refresh()
```

**Upload foto (nuevo):**
```
SubirFotoForm → subirFotoProfesional(pacienteId, formData)
  │  1. Validar MIME (jpeg/png/webp) ≤ 5MB
  │  2. PutObjectCommand → R2 key: pacientes/{id}/fotos/{uuid}-{name}
  │  3. INSERT nutri_fotos { r2_key, titulo, ... }
  └→ router.refresh()
```

**Descarga (plan y foto):**
```
DownloadPlanButton / VerFotoButton
  → getPlanSignedUrl(planId) / getFotoSignedUrl(fotoId)
      │  Detectar storage: file_url starts with "pacientes/" → R2
      │                     file_url starts with "planes/"    → Supabase (legacy)
      │  R2: GetObjectCommand + getSignedUrl(r2Client, cmd, { expiresIn: 60 })
      └→ presigned URL válida 60s
```

## File Changes

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `lib/r2/client.ts` | Create | `S3Client` singleton + `R2_BUCKET` constante |
| `lib/actions/planes.ts` | Modify | `subirPlanProfesional` → R2; `getPlanSignedUrl` → R2 con fallback Supabase |
| `lib/actions/fotos.ts` | Create | `subirFotoProfesional`, `getFotosPaciente`, `getFotoSignedUrl` |
| `components/dashboard/SubirFotoForm.tsx` | Create | Form upload imagen, acepta JPEG/PNG/WebP |
| `components/dashboard/VerFotoButton.tsx` | Create | Genera presigned URL y abre en nueva pestaña |
| `app/(dashboard)/profesional/pacientes/[id]/page.tsx` | Modify | Sección "Fotos" con `SubirFotoForm` + lista |
| `types/index.ts` | Modify | Agregar interface `Foto` |
| `supabase/schema.sql` | Modify | Agregar tabla `nutri_fotos` |
| `package.json` | Modify | Instalar `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` |

## Interfaces / Contracts

```ts
// lib/r2/client.ts
export const r2Client: S3Client   // endpoint R2 de Cloudflare
export const R2_BUCKET: string    // process.env.R2_BUCKET_NAME

// types/index.ts
export interface Foto {
  id: string;
  paciente_id: string;
  titulo: string;
  descripcion: string | null;
  r2_key: string;           // path en R2: pacientes/{id}/fotos/{uuid}-{name}
  activo: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// lib/actions/fotos.ts
export async function subirFotoProfesional(pacienteId: string, formData: FormData): Promise<ActionResult<Foto>>
export async function getFotosPaciente(pacienteId: string): Promise<Foto[]>
export async function getFotoSignedUrl(fotoId: string): Promise<string | null>

// nutri_fotos (SQL)
CREATE TABLE nutri_fotos (
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
```

## Testing Strategy

Sin test runner (strict_tdd: false). Verificación manual:
- Upload PDF → verificar objeto en R2 console bajo `pacientes/{id}/planes/`
- Upload foto → verificar objeto en R2 console bajo `pacientes/{id}/fotos/`
- Descarga → presigned URL abre el archivo en 60s
- Archivo legacy (Supabase) → sigue descargándose correctamente (fallback)

## Migration / Rollout

**Archivo existente en Supabase Storage** (1 registro):
1. En tasks: descargar archivo de Supabase Storage vía signed URL
2. Subir a R2 con key `pacientes/{pacienteId}/planes/{uuid}-Exam_Jenkins.pdf`
3. `UPDATE nutri_planes SET file_url = '<nueva_r2_key>' WHERE id = '<id>'`
4. Verificar descarga con presigned URL de R2

**Variables de entorno** (agregar a `.env.local`):
```
R2_ACCOUNT_ID=38bbbc416118ab76916c42b8b9641ffe
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=monicanutricionista
```

## Open Questions

- Ninguna — diseño completo.
