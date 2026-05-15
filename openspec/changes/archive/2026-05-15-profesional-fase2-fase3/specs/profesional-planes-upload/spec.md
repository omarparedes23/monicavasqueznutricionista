# Profesional — Upload de Planes Specification

## Purpose

Define los requisitos para que el profesional suba archivos PDF de planes alimentarios
y los asigne a un paciente específico desde la página de detalle.

## Requirements

### Requirement: Subida de plan alimentario PDF

El profesional MUST poder subir un archivo PDF como plan alimentario para un paciente.
El archivo MUST ser de tipo `application/pdf`.
El archivo MUST tener un tamaño máximo de 10MB.
El campo `titulo` es REQUIRED. El campo `descripcion` es OPTIONAL.
El archivo MUST ser almacenado en el bucket `planes` de Supabase Storage bajo la ruta
`planes/{pacienteId}/{uuid}-{filename}`.
El registro en `nutri_planes` MUST ser creado solo si el upload a Storage fue exitoso.

#### Scenario: Upload exitoso

- GIVEN el profesional está en `/profesional/pacientes/{id}`
- WHEN selecciona un PDF válido (≤ 10MB), ingresa un título y envía el formulario
- THEN el archivo es subido al bucket `planes`
- AND se crea un registro en `nutri_planes` con `paciente_id = {id}` y `file_url = path`
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

#### Scenario: Fallo en Storage (error de red o servicio)

- GIVEN el profesional envía un formulario válido
- WHEN el upload a Supabase Storage falla
- THEN NO se crea ningún registro en `nutri_planes`
- AND se muestra un mensaje de error genérico al profesional

### Requirement: Descarga del plan por el paciente

Los planes subidos por el profesional MUST ser descargables por el paciente asignado
desde su panel (`/paciente`) usando una URL firmada de corta duración.

#### Scenario: Paciente descarga su plan

- GIVEN existe un plan asignado al paciente con un archivo en Storage
- WHEN el paciente hace clic en "Descargar" desde su panel
- THEN se genera una URL firmada válida por 60 segundos
- AND el archivo PDF es descargado correctamente
