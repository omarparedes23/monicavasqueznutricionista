# Delta for profesional-planes-upload

## MODIFIED Requirements

### Requirement: Subida de plan alimentario PDF

El profesional MUST poder subir un archivo PDF como plan alimentario para un paciente.
El archivo MUST ser de tipo `application/pdf`.
El archivo MUST tener un tamaño máximo de 10MB.
El campo `titulo` es REQUIRED. El campo `descripcion` es OPTIONAL.
El archivo MUST ser almacenado en Cloudflare R2 bajo la ruta `pacientes/{pacienteId}/planes/{uuid}-{filename}`.
El registro en `nutri_planes` MUST ser creado solo si el upload a R2 fue exitoso.
(Previously: el archivo se almacenaba en Supabase Storage bucket `planes` bajo `planes/{pacienteId}/{uuid}-{filename}`)

#### Scenario: Upload exitoso

- GIVEN el profesional está en `/profesional/pacientes/{id}`
- WHEN selecciona un PDF válido (≤ 10MB), ingresa un título y envía el formulario
- THEN el archivo es subido a R2 bajo `pacientes/{id}/planes/`
- AND se crea un registro en `nutri_planes` con `paciente_id = {id}` y `file_url = r2_key`
- AND el plan aparece en la lista de planes del paciente con botón de descarga

#### Scenario: Archivo no es PDF

- GIVEN el profesional selecciona un archivo que no es PDF (ej: .docx, .jpg)
- WHEN envía el formulario
- THEN el upload es rechazado
- AND se muestra un mensaje de error indicando que solo se aceptan PDFs
- AND ningún registro es creado en `nutri_planes`

#### Scenario: Archivo excede el tamaño máximo

- GIVEN el profesional selecciona un PDF mayor a 10MB
- WHEN envía el formulario
- THEN el upload es rechazado
- AND se muestra un mensaje de error indicando el límite de tamaño
- AND ningún registro es creado en `nutri_planes`

#### Scenario: Título vacío

- GIVEN el profesional selecciona un PDF válido pero no ingresa título
- WHEN envía el formulario
- THEN el formulario es rechazado con validación
- AND se muestra el error "El título es requerido"

#### Scenario: Fallo en R2

- GIVEN el profesional envía un formulario válido
- WHEN el upload a R2 falla
- THEN NO se crea ningún registro en `nutri_planes`
- AND se muestra un mensaje de error genérico al profesional

### Requirement: Descarga del plan por el paciente

Los planes subidos por el profesional MUST ser descargables por el paciente asignado
desde su panel (`/paciente`) usando una presigned URL de Cloudflare R2 de corta duración.
(Previously: la URL firmada era generada por Supabase Storage `createSignedUrl`)

#### Scenario: Paciente descarga su plan

- GIVEN existe un plan asignado al paciente con un archivo en R2
- WHEN el paciente hace clic en "Descargar" desde su panel
- THEN se genera una presigned URL de R2 válida por 60 segundos
- AND el archivo PDF es descargado correctamente
