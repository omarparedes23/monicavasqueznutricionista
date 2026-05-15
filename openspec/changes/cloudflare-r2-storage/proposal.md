# Proposal: Cloudflare R2 Storage + Fotos de Pacientes

## Intent

Supabase Storage es suficiente para un MVP, pero no es la solución adecuada a largo plazo:
costos por egress, sin CDN global, sin organización clara por paciente. Este cambio migra
el almacenamiento de archivos a Cloudflare R2 y agrega soporte de fotos de evolución.

## Scope

### In Scope
- Instalar `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
- Crear `lib/r2/client.ts` con `S3Client` configurado para R2
- Modificar `subirPlanProfesional` para subir a R2 en lugar de Supabase Storage
- Modificar `getPlanSignedUrl` para generar presigned URLs de R2
- Nueva tabla `nutri_fotos` en Supabase (metadata) + migration SQL
- Nueva action `subirFotoProfesional` (JPEG/PNG/JPG/WebP, máx 5MB)
- Nueva action `getFotosPaciente` + `getFotoSignedUrl`
- Nuevo componente `SubirFotoForm` integrado en `/profesional/pacientes/[id]`
- Nuevo tipo `Foto` en `types/index.ts`
- Variables de entorno R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- Migrar el 1 archivo existente de Supabase Storage a R2 + actualizar su `file_url` en DB
- Estructura R2: `pacientes/{pacienteId}/planes/{uuid}-{filename}` y `pacientes/{pacienteId}/fotos/{uuid}-{filename}`

### Out of Scope
- Eliminación del bucket `planes` de Supabase Storage (dejar como backup)
- Galería de fotos con vista previa inline (solo descarga/vista en nueva pestaña)
- Compresión automática de imágenes en servidor
- Eliminar fotos ya subidas

## Capabilities

### New Capabilities
- `profesional-fotos-upload`: El profesional sube fotos de evolución (JPEG/PNG/WebP, ≤5MB) a pacientes

### Modified Capabilities
- `profesional-planes-upload`: El storage cambia de Supabase Storage a Cloudflare R2; presigned URLs vía AWS SDK

## Approach

`lib/r2/client.ts` exporta un `S3Client` singleton configurado con el endpoint R2 de Cloudflare
(`https://{ACCOUNT_ID}.r2.cloudflarestorage.com`). Todas las operaciones de storage usan
`PutObjectCommand` para subir y `GetObjectCommand` + `getSignedUrl` para descargar.

El path en R2 sigue la estructura `pacientes/{pacienteId}/{tipo}/{uuid}-{filename}` para
agrupar archivos por paciente y separar planes de fotos dentro del mismo bucket.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `lib/r2/client.ts` | New | S3Client para R2 |
| `lib/actions/planes.ts` | Modified | `subirPlanProfesional` + `getPlanSignedUrl` → R2 |
| `lib/actions/fotos.ts` | New | `subirFotoProfesional`, `getFotosPaciente`, `getFotoSignedUrl` |
| `components/dashboard/SubirFotoForm.tsx` | New | Form upload de imágenes |
| `app/(dashboard)/profesional/pacientes/[id]/page.tsx` | Modified | Sección fotos |
| `supabase/schema.sql` | Modified | Nueva tabla `nutri_fotos` |
| `types/index.ts` | Modified | Tipo `Foto` |
| `package.json` | Modified | 2 deps nuevas: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Variables R2 no configuradas en producción | Med | Documentar en `.env.local.example` |
| Bucket R2 público accidentalmente | Low | Verificar configuración privada antes del deploy |
| Archivo existente en Supabase sin migrar | Low | Migración explícita en tasks con SQL de actualización |

## Rollback Plan

1. Revertir `subirPlanProfesional` y `getPlanSignedUrl` a Supabase Storage
2. El archivo en R2 puede dejarse (no afecta funcionalidad)
3. El registro en DB apuntaría nuevamente al path de Supabase

## Dependencies

- Credenciales R2 activas (el usuario las tiene)
- Bucket R2 creado y configurado como privado

## Success Criteria

- [ ] PDF subido desde `/profesional/pacientes/{id}` aparece en bucket R2, ruta `pacientes/{id}/planes/`
- [ ] Descarga funciona con presigned URL de R2 (válida 60s)
- [ ] Foto subida aparece en bucket R2, ruta `pacientes/{id}/fotos/`
- [ ] `tsc --noEmit` pasa sin errores
