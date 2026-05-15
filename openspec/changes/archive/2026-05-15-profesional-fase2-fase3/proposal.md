# Proposal: Profesional — Fase 2 y 3

## Intent

El profesional puede ver el historial y planes de sus pacientes pero no puede cargar datos.
Necesita: (1) registrar mediciones antropométricas en nombre del paciente, (2) subir PDFs de planes alimentarios directamente desde el detalle del paciente.

## Scope

### In Scope
- `addMedicionPorProfesional(pacienteId, input)` — server action con service role para INSERT en `nutri_antropometria`
- `subirPlanProfesional(pacienteId, formData)` — server action: valida PDF, sube a bucket `planes` de Supabase Storage, crea registro en `nutri_planes`
- `MedicionFormProfesional` — componente cliente que acepta `pacienteId` prop
- `SubirPlanForm` — componente cliente con input file, título y descripción
- Integración de ambos formularios en `/profesional/pacientes/[id]` como secciones expandibles
- Aumentar `serverActions.bodySizeLimit` a `"10mb"` en `next.config.ts`

### Out of Scope
- Cloudflare R2 (bucket `planes` de Supabase Storage ya existe y funciona)
- Editar o eliminar mediciones existentes
- Desactivar/eliminar planes subidos
- Notificación al paciente al subir plan

## Capabilities

### New Capabilities
- `profesional-mediciones`: El profesional registra mediciones antropométricas de sus pacientes
- `profesional-planes-upload`: El profesional sube PDFs de planes alimentarios a sus pacientes

### Modified Capabilities
- None

## Approach

**Mediciones**: Nueva action `addMedicionPorProfesional` con `createServiceRoleClient()` — INSERT directo con `paciente_id` explícito, sin depender de RLS. Reutiliza el tipo `AddMedicionInput` existente.

**Planes**: Server Action recibe `FormData` con el archivo. Valida MIME (`application/pdf`) y tamaño (≤ 10MB). Sube a `planes/{pacienteId}/{uuid}-{filename}` usando service role. Llama `createPlanRecord` solo si el upload fue exitoso (upload-first para evitar registros huérfanos).

**UI**: Ambos formularios se integran en la página de detalle existente. Sección "Nueva medición" con toggle show/hide. Sección "Subir plan" con toggle similar.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `lib/actions/antropometria.ts` | Modified | Agregar `addMedicionPorProfesional` |
| `lib/actions/planes.ts` | Modified | Agregar `subirPlanProfesional` |
| `components/dashboard/MedicionFormProfesional.tsx` | New | Form con `pacienteId` prop |
| `components/dashboard/SubirPlanForm.tsx` | New | Form upload PDF |
| `app/(dashboard)/profesional/pacientes/[id]/page.tsx` | Modified | Integrar ambos forms |
| `next.config.ts` | Modified | `bodySizeLimit: "10mb"` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| PDF > 10MB bloqueado | Low | PDFs de dietas típicamente < 2MB; límite suficiente |
| Archivo no-PDF subido | Med | Validar `file.type === "application/pdf"` en SA |
| Upload OK pero INSERT falla | Low | Upload primero; si INSERT falla, intentar delete del archivo |

## Rollback Plan

Sin migraciones de DB. Revertir consiste en:
1. Eliminar los dos nuevos server actions
2. Eliminar los dos nuevos componentes
3. Revertir `next.config.ts` a `bodySizeLimit` anterior
4. Revertir `page.tsx` al estado sin los formularios

## Dependencies

- Bucket `planes` en Supabase Storage (ya existe, confirmado)
- `createServiceRoleClient()` (ya existe en `lib/supabase/server.ts`)

## Success Criteria

- [ ] El profesional puede registrar una medición desde `/profesional/pacientes/[id]` y aparece en el gráfico
- [ ] El profesional puede subir un PDF y el paciente puede descargarlo desde su panel
- [ ] Un archivo que no es PDF es rechazado con mensaje de error
- [ ] `tsc --noEmit` y `next lint` pasan sin errores
