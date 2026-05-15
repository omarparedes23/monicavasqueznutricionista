# Tasks: Profesional — Fase 2 y 3

## Phase 1: Configuración e infraestructura

- [x] 1.1 En `next.config.ts`, agregar `serverActions: { bodySizeLimit: "10mb" }` dentro de `nextConfig`

## Phase 2: Server Actions — Mediciones

- [x] 2.1 En `lib/actions/antropometria.ts`, agregar `addMedicionPorProfesional(pacienteId: string, formData: FormData): Promise<ActionResult<Antropometria>>`
  - Usar `createServiceRoleClient()`
  - Leer campos del `formData`: `peso` (required), `porcentaje_grasa`, `cintura`, `cadera`, `fecha` (required), `notas`
  - Validar `peso` numérico > 0 y `fecha` formato `YYYY-MM-DD`
  - INSERT en `nutri_antropometria` con `paciente_id = pacienteId`

## Phase 3: Server Actions — Upload de planes

- [x] 3.1 En `lib/actions/planes.ts`, agregar `subirPlanProfesional(pacienteId: string, formData: FormData): Promise<ActionResult<Plan>>`
  - Usar `createServiceRoleClient()`
  - Leer `file` (File), `titulo` (required), `descripcion` (optional) del `formData`
  - Validar `titulo` no vacío, `file.type === "application/pdf"`, `file.size <= 10 * 1024 * 1024`
  - Generar path: `planes/${pacienteId}/${crypto.randomUUID()}-${file.name}`
  - Convertir File a `ArrayBuffer` → `Buffer`; subir con `serviceClient.storage.from("planes").upload(path, buffer, { contentType: "application/pdf" })`
  - Si upload falla → retornar error sin INSERT
  - Si upload OK → llamar `createPlanRecord({ pacienteId, titulo, descripcion, filePath: path })`

## Phase 4: Componentes cliente

- [x] 4.1 Crear `components/dashboard/MedicionFormProfesional.tsx`
  - Props: `{ pacienteId: string }`
  - Campos: peso, porcentaje_grasa, cintura, cadera, fecha (default: hoy), notas
  - Llama `addMedicionPorProfesional(pacienteId, formData)` con `useActionState` o handler manual
  - Muestra error si `result.error`; llama `router.refresh()` si `result.success`

- [x] 4.2 Crear `components/dashboard/SubirPlanForm.tsx`
  - Props: `{ pacienteId: string }`
  - Campos: file (accept=".pdf"), titulo, descripcion
  - Llama `subirPlanProfesional(pacienteId, formData)` con handler manual + `useState` para loading/error/ok
  - Muestra error si `result.error`; llama `router.refresh()` si `result.success`

## Phase 5: Integración en página de detalle

- [x] 5.1 En `app/(dashboard)/profesional/pacientes/[id]/page.tsx`, agregar sección "Nueva medición"
  - Botón toggle que muestra/oculta `MedicionFormProfesional` (componente cliente con `pacienteId={id}`)
  - Colocar dentro de la sección "Evolución", debajo del `EvolucionChart`

- [x] 5.2 En `app/(dashboard)/profesional/pacientes/[id]/page.tsx`, agregar sección "Subir plan"
  - Botón toggle que muestra/oculta `SubirPlanForm` (componente cliente con `pacienteId={id}`)
  - Colocar dentro de la sección "Planes alimentarios", encima de la lista existente

## Phase 6: Verificación

- [x] 6.1 Ejecutar `tsc --noEmit` — verificar cero errores de tipos ✓
- [x] 6.2 Ejecutar `next lint` — N/A: `next lint` deprecado en v15.5; `tsc` pasa limpio
- [ ] 6.3 Prueba manual: registrar medición desde `/profesional/pacientes/{id}` → verificar que aparece en el gráfico del profesional y en `/paciente` del paciente
- [ ] 6.4 Prueba manual: subir PDF válido → verificar que aparece en lista de planes con descarga funcional
- [ ] 6.5 Prueba manual: intentar subir archivo `.docx` → verificar mensaje de error y sin registro en DB
- [ ] 6.6 Prueba manual: subir PDF sin título → verificar mensaje de validación
