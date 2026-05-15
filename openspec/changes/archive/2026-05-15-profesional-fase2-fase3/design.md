# Design: Profesional — Fase 2 y 3

## Technical Approach

Dos server actions nuevas con `createServiceRoleClient()` (patrón establecido en el proyecto).
Dos componentes cliente nuevos que reciben `pacienteId` como prop.
Ambos se integran en la página de detalle existente con secciones toggle (show/hide).
Storage: bucket `planes` de Supabase ya configurado — sin R2, sin dependencias nuevas.

## Architecture Decisions

| Decisión | Elección | Alternativa rechazada | Razón |
|----------|----------|-----------------------|-------|
| Auth en mediciones | `createServiceRoleClient()` + `paciente_id` explícito | Reusar `addMedicion` con impersonación | Supabase no soporta impersonación sin token separado |
| Upload estrategia | Server Action recibe `FormData` + llama Storage SDK | Presigned URL + fetch cliente | Consistente con patrón del proyecto; PDFs de dietas < 2MB |
| Orden de operaciones (planes) | Upload Storage → INSERT DB | INSERT DB → Upload Storage | Evita registros huérfanos en `nutri_planes` sin archivo |
| UI toggle | Estado local `useState` show/hide | Modal / página separada | Menor fricción; no requiere navegación extra |

## Data Flow

**Fase 2 — Medición:**

```
MedicionFormProfesional (client)
  │  FormData { peso, fecha, ... }
  ▼
addMedicionPorProfesional(pacienteId, formData)  [Server Action]
  │  createServiceRoleClient()
  ▼
nutri_antropometria INSERT { paciente_id: pacienteId, peso, fecha, ... }
  │
  ▼
router.refresh() → página recarga historial actualizado
```

**Fase 3 — Upload plan:**

```
SubirPlanForm (client)
  │  FormData { file: PDF, titulo, descripcion }
  ▼
subirPlanProfesional(pacienteId, formData)  [Server Action]
  │  1. Validar MIME = "application/pdf" y tamaño ≤ 10MB
  │  2. serviceClient.storage.from("planes").upload(path, buffer)
  │     path = "planes/{pacienteId}/{uuid}-{filename}"
  │  3. Si upload OK → createPlanRecord({ pacienteId, titulo, descripcion, filePath: path })
  │  4. Si upload FAIL → return error, NO INSERT
  ▼
nutri_planes INSERT + lista de planes se actualiza vía router.refresh()
```

## File Changes

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `lib/actions/antropometria.ts` | Modify | Agregar `addMedicionPorProfesional(pacienteId, formData)` |
| `lib/actions/planes.ts` | Modify | Agregar `subirPlanProfesional(pacienteId, formData)` |
| `components/dashboard/MedicionFormProfesional.tsx` | Create | Form con prop `pacienteId`, llama `addMedicionPorProfesional` |
| `components/dashboard/SubirPlanForm.tsx` | Create | Form upload PDF con prop `pacienteId`, llama `subirPlanProfesional` |
| `app/(dashboard)/profesional/pacientes/[id]/page.tsx` | Modify | Agregar secciones "Nueva medición" y "Subir plan" con toggle |
| `next.config.ts` | Modify | Agregar `serverActions: { bodySizeLimit: "10mb" }` |

## Interfaces / Contracts

```ts
// lib/actions/antropometria.ts
export async function addMedicionPorProfesional(
  pacienteId: string,
  formData: FormData
): Promise<ActionResult<Antropometria>>

// lib/actions/planes.ts
export async function subirPlanProfesional(
  pacienteId: string,
  formData: FormData
): Promise<ActionResult<Plan>>

// components/dashboard/MedicionFormProfesional.tsx
interface Props { pacienteId: string }

// components/dashboard/SubirPlanForm.tsx
interface Props { pacienteId: string }
```

`ActionResult<T>` ya existe en `types/index.ts`: `{ success: boolean; data?: T; error?: string }`.

## Testing Strategy

Sin test runner configurado (strict_tdd: false). Verificación manual:

| Caso | Verificar |
|------|-----------|
| Medición registrada | Aparece en gráfico del profesional Y en panel del paciente |
| Upload PDF válido | Plan aparece con botón de descarga funcional |
| Upload no-PDF | Mensaje de error; sin registro en DB |
| PDF > 10MB | Mensaje de error; sin registro en DB |
| `tsc --noEmit` | Sin errores de tipos |
| `next lint` | Sin warnings |

## Migration / Rollout

No hay migración de DB. Las tablas `nutri_antropometria` y `nutri_planes` ya existen con las columnas necesarias. El bucket `planes` ya existe.

## Open Questions

- Ninguna. Todos los bloqueantes resueltos en la exploración.
