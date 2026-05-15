# Módulo: Panel Profesional — PENDIENTE

> Este módulo fue documentado pero NO implementado.
> Un agente futuro debe ejecutar todas las fases SDD desde la propuesta.
> La exploración inicial está guardada en Engram: `sdd/profesional-dashboard/explore`

## Fases SDD requeridas

- [ ] sdd-propose
- [ ] sdd-spec
- [ ] sdd-design
- [ ] sdd-tasks
- [ ] sdd-apply
- [ ] sdd-verify
- [ ] sdd-archive

---

## Resumen del módulo

### Rutas que son PLACEHOLDERS hoy (código existe, sin datos)
- `/profesional` — `app/(dashboard)/profesional/page.tsx`
- `/profesional/pacientes` — `app/(dashboard)/profesional/pacientes/page.tsx`

### Rutas que NO EXISTEN (crear)
- `/profesional/pacientes/[id]` — detalle del paciente
- `/profesional/pacientes/[id]/mediciones` — cargar medición al paciente
- `/profesional/pacientes/[id]/planes` — subir PDF de dieta

---

## Server Actions que FALTAN (crear en lib/actions/)

| Action | Descripción |
|--------|-------------|
| `getPacientes()` | Lista todos los perfiles rol=paciente |
| `getPaciente(id)` | Detalle de un paciente |
| `getMedicionesPaciente(pacienteId)` | Historial de mediciones de un paciente |
| `crearMedicionPaciente(pacienteId, datos)` | Profesional carga medición en nombre del paciente |
| `crearPaciente(email, nombre)` | Invita paciente vía Supabase Auth |
| `subirPlanR2(file, pacienteId, titulo)` | Upload PDF a Cloudflare R2 + registro en DB |

## Server Actions que YA EXISTEN (reusar)
- `lib/actions/planes.ts` — `getPlanesPaciente`, `createPlanRecord`, `getPlanSignedUrl`
- `lib/actions/antropometria.ts` — `getMiHistorial`, `getMiUltimaMedicion`

## Componentes que YA EXISTEN (reusar)
- `components/dashboard/EvolucionChart.tsx`
- `components/dashboard/MedicionForm.tsx`
- `components/dashboard/DownloadPlanButton.tsx`

---

## Cloudflare R2 — integración requerida

**Bucket**: `monicanutricionista`
**SDK a instalar**: `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`

### Archivo a crear
`lib/r2/client.ts` — cliente S3-compatible con endpoint R2

### Rutas en el bucket
- PDFs: `planes/{pacienteId}/{uuid}-{filename}.pdf`
- Fotos: `fotos/{pacienteId}/{uuid}-{filename}.jpg`

### Variables de entorno a agregar
```
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=monicanutricionista
CLOUDFLARE_R2_PUBLIC_URL=
```

---

## Tablas de DB involucradas
| Tabla | Uso |
|-------|-----|
| `nutri_perfiles` | Leer lista de pacientes (service role) |
| `nutri_antropometria` | Leer y escribir mediciones |
| `nutri_planes` | Leer y escribir planes (file_url = R2 key) |
| `nutri_citas` | Leer citas próximas para el dashboard |

---

## Sugerencia: dividir en 2 cambios SDD

**Cambio 1: `profesional-dashboard`**
Dashboard, lista pacientes, detalle paciente, nueva medición.
Sin R2 — planes solo lectura/descarga existente.

**Cambio 2: `profesional-r2-uploads`**
`lib/r2/client.ts`, upload PDF, página subir plan, migración Supabase Storage → R2.

---

## Instrucciones para el agente que tome esto

1. Leer contexto desde Engram: `mem_search("sdd/profesional-dashboard/explore")`
2. Leer `openspec/config.yaml` para convenciones del proyecto
3. Leer el código actual en `app/(dashboard)/profesional/` antes de diseñar
4. Seguir el patrón de auth: `createServiceRoleClient()` para writes, verificar `rol === "profesional"` en cada page
5. Ejecutar todas las fases SDD en orden con `artifact_store: hybrid`
