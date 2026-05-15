## Exploration: Migración a Cloudflare R2 + soporte de fotos

### Current State

**Storage actual**: Supabase Storage, bucket `planes` (privado).
- 1 archivo existente: `planes/{pacienteId}/{uuid}-Exam_Jenkins.pdf`
- `file_url` en `nutri_planes` almacena el path dentro del bucket
- `getPlanSignedUrl` usa `serviceClient.storage.from("planes").createSignedUrl(path, 60)`
- `subirPlanProfesional` usa `serviceClient.storage.from("planes").upload(...)`
- **No hay SDK de R2 instalado** (`@aws-sdk` no está en `package.json`)
- **No hay variables de entorno R2** configuradas

**Schema `nutri_planes`**: sin columna `tipo_archivo` ni `mime_type`. Solo soporta planes PDF semánticamente.

**No existe** tabla para fotos de pacientes.

### Affected Areas

- `lib/r2/client.ts` — nuevo: cliente R2 compatible con S3
- `lib/actions/planes.ts` — modificar `subirPlanProfesional` y `getPlanSignedUrl` para usar R2
- `lib/actions/fotos.ts` — nuevo: `subirFotoProfesional`, `getFotosP aciente`, `getFotoSignedUrl`
- `components/dashboard/SubirPlanForm.tsx` — sin cambios en UI
- `components/dashboard/SubirFotoForm.tsx` — nuevo componente para upload de fotos
- `app/(dashboard)/profesional/pacientes/[id]/page.tsx` — agregar sección de fotos
- `supabase/schema.sql` — nueva tabla `nutri_fotos`
- `types/index.ts` — nuevo tipo `Foto`
- `.env.local` — 5 variables R2 nuevas
- `next.config.ts` — agregar hostname R2 a `remotePatterns` (ya tiene `**.r2.dev`)

### Approaches

**1. Organización de archivos en R2**

| Opción | Estructura | Pros | Contras |
|--------|-----------|------|---------|
| A. Por tipo | `planes/{pacienteId}/{uuid}.pdf` `fotos/{pacienteId}/{uuid}.jpg` | Simple, consistente con Supabase actual | Difícil listar todos los archivos de un paciente |
| B. Por paciente | `pacientes/{pacienteId}/planes/{uuid}.pdf` `pacientes/{pacienteId}/fotos/{uuid}.jpg` | Todos los archivos de un paciente agrupados | Path más largo |
| **C. Plano con prefijo** | `p-{pacienteId}/plan-{uuid}.pdf` `p-{pacienteId}/foto-{uuid}.jpg` | Compacto, fácil de filtrar por paciente | Menos legible |

→ **Recomendación**: Opción B (`pacientes/{pacienteId}/planes/` y `pacientes/{pacienteId}/fotos/`) — semánticamente claro y agrupa archivos por paciente.

**2. Tabla para fotos**

| Opción | Descripción | Pros | Contras |
|--------|-------------|------|---------|
| A. Agregar `tipo_archivo` a `nutri_planes` | Una sola tabla para planes y fotos | Menos tablas, menos código | Mezcla conceptos distintos |
| **B. Nueva tabla `nutri_fotos`** | Tabla separada con campos propios | Separación limpia, campos específicos (ej: fecha_foto, notas) | Una tabla más |

→ **Recomendación**: Opción B — fotos son semánticamente distintas a planes alimentarios. Permite campos específicos (fecha de la foto, etc.).

**3. Signed URLs en R2**

R2 usa el SDK de S3 (`@aws-sdk/s3-request-presigner`). La diferencia clave vs Supabase:
- Supabase: `storage.createSignedUrl(path, 60)` → URL de Supabase
- R2: `getSignedUrl(s3Client, new GetObjectCommand({Bucket, Key}), { expiresIn: 60 })` → URL de R2

**4. Migración del archivo existente**

Solo hay 1 archivo en Supabase Storage. Opciones:
- Migrar manualmente: descargar de Supabase, subir a R2, actualizar `file_url` en DB
- Dejar en Supabase y hacer que `getPlanSignedUrl` detecte el storage según el prefijo del path

→ **Recomendación**: Migrar el único archivo existente (trivial con 1 registro) y cortar completamente a R2.

### Recommendation

1. Instalar `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
2. Crear `lib/r2/client.ts` con `S3Client` configurado para R2
3. Nueva tabla `nutri_fotos` en Supabase (solo metadata — el archivo en R2)
4. Estructura R2: `pacientes/{pacienteId}/planes/{uuid}-{filename}` y `pacientes/{pacienteId}/fotos/{uuid}-{filename}`
5. Modificar `subirPlanProfesional` → upload a R2 en lugar de Supabase Storage
6. Modificar `getPlanSignedUrl` → presigned URL de R2
7. Nueva action `subirFotoProfesional` para fotos (JPEG/PNG/WebP, máx 10MB)
8. Nuevo componente `SubirFotoForm` + integración en página de detalle
9. Migrar el archivo existente manualmente (1 registro)

### Risks

- Variables de entorno R2 deben configurarse antes del deploy (Account ID, Access Key, Secret Key, Bucket, Public URL)
- R2 no tiene el mismo control de acceso que Supabase RLS — la seguridad depende de que los presigned URLs sean efímeros (60s)
- Si el bucket R2 es público, cualquiera con el path puede acceder sin signed URL — DEBE ser privado
- Tamaño de fotos: las fotos de cámara pueden ser > 10MB — considerar compresión en el cliente o aumentar límite

### Ready for Proposal

Sí. Necesito confirmar con el usuario:
1. **¿Ya tiene el bucket R2 creado en Cloudflare?** (necesita Account ID, Access Key, Secret Key, Bucket name, endpoint URL)
2. **¿Qué tipos de foto acepta?** (JPEG, PNG, WebP — ¿o solo JPEG?)
3. **¿Tamaño máximo de foto?** (sugerencia: 10MB, pero fotos de cámara modernas pueden ser más grandes)
