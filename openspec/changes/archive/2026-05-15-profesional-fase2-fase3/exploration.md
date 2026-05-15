## Exploration: Fase 2 (mediciones por profesional) + Fase 3 (subida de planes)

### Current State

**Fase 2 — Mediciones:**
- `addMedicion()` en `lib/actions/antropometria.ts` usa `auth.uid()` como `paciente_id` vía RLS.
  Solo funciona para el paciente autenticado — el profesional no puede usarla para otro paciente.
- `MedicionForm` en `components/dashboard/MedicionForm.tsx` llama `addMedicion` directamente.
  Está hardcodeada para el usuario autenticado; no acepta `pacienteId` externo.
- `getHistorialPaciente(id)` ya existe con service role — lectura OK, escritura falta.

**Fase 3 — Planes:**
- `createPlanRecord(input)` ya existe en `lib/actions/planes.ts` — crea el registro en DB.
- `getPlanSignedUrl(planId)` ya existe — genera URL firmada para descarga (Supabase Storage).
- El bucket `planes` ya existe en Supabase Storage (privado, `public: false`).
- `file_url` en `nutri_planes` almacena el path dentro del bucket (no una URL completa).
- **No hay R2**: el `openspec/config.yaml` mencionaba R2 pero no existe bucket R2 configurado.
  La integración correcta es Supabase Storage directamente.

**Página de detalle del paciente** (`app/(dashboard)/profesional/pacientes/[id]/page.tsx`):
- Ya muestra historial, planes y citas en modo lectura.
- Falta: botón/sección para agregar medición + subir plan desde la vista del profesional.

### Affected Areas

- `lib/actions/antropometria.ts` — agregar `addMedicionPorProfesional(pacienteId, input)`
- `lib/actions/planes.ts` — agregar `subirPlanProfesional(pacienteId, formData)`
- `app/(dashboard)/profesional/pacientes/[id]/page.tsx` — agregar secciones interactivas
- `components/dashboard/MedicionFormProfesional.tsx` — nuevo componente (acepta `pacienteId`)
- `components/dashboard/SubirPlanForm.tsx` — nuevo componente para upload de PDF
- `next.config.ts` — aumentar `serverActions.bodySizeLimit` para soportar PDFs

### Approaches

**Fase 2 — ¿Cómo escribe el profesional mediciones?**

1. **Nueva server action con service role** (recomendado)
   - `addMedicionPorProfesional(pacienteId, input)` usa `createServiceRoleClient()`
   - INSERT directo sin depender de `auth.uid()` en el where
   - Pros: simple, consistente con el patrón del proyecto
   - Cons: ninguno significativo
   - Effort: Low

2. **Reusar `addMedicion` con impersonación**
   - Forzar la sesión del paciente desde el servidor
   - Pros: reusar código
   - Cons: no es posible con Supabase sin tokens separados; complejo y frágil
   - Effort: High

**Fase 3 — ¿Cómo sube el profesional un PDF?**

1. **Server Action con FormData + Supabase Storage SDK** (recomendado)
   - El form envía el archivo como FormData al Server Action
   - El SA usa `serviceClient.storage.from("planes").upload(path, buffer)`
   - Luego llama `createPlanRecord` con el path
   - Requires: `serverActions.bodySizeLimit: "10mb"` en `next.config.ts`
   - Pros: patrón familiar, todo en server, sin JS extra en cliente
   - Cons: límite de tamaño (suficiente para PDFs de dietas, típicamente < 2MB)
   - Effort: Low-Medium

2. **Presigned upload URL (cliente sube directo a Storage)**
   - SA genera una URL firmada de upload; el cliente sube con fetch
   - Pros: sin límite de tamaño en SA, más escalable
   - Cons: requiere JS en cliente para el fetch, más piezas, más complejo
   - Effort: Medium-High

### Recommendation

**Fase 2**: Nueva action `addMedicionPorProfesional(pacienteId, input)` con service role.
Nuevo componente `MedicionFormProfesional` que acepta `pacienteId` como prop.
Se integra en la página de detalle del paciente como una sección colapsable o modal.

**Fase 3**: Server Action con FormData. Aumentar `bodySizeLimit` a `"10mb"` en `next.config.ts`.
La action: valida el archivo (tipo PDF, tamaño), sube a `planes/{pacienteId}/{uuid}-{filename}`,
llama `createPlanRecord` con el path. Componente `SubirPlanForm` con input file + título + descripción.

**NO usar Cloudflare R2**: el bucket `planes` de Supabase Storage ya está configurado y funcional.
`getPlanSignedUrl` ya lo usa. Mantener consistencia.

### Risks

- Upload de archivos grandes puede ser lento por timeout de SA (mitigado con límite 10MB práctico)
- El profesional podría subir archivos que no son PDF — validar MIME type en el SA
- Si el upload a Storage falla después del INSERT en DB → registro huérfano sin archivo;
  el orden correcto es: upload primero, INSERT después

### Ready for Proposal

Sí. Scope claro, dependencias mapeadas, decisiones técnicas tomadas.
Cambio: `profesional-fase2-fase3`
