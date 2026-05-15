# Profesional — Upload de Fotos Specification

## Purpose

Define los requisitos para que el profesional suba fotos de evolución de pacientes
(imágenes corporales de progreso) almacenadas en Cloudflare R2.

## Requirements

### Requirement: Subida de foto de evolución

El profesional MUST poder subir una imagen de evolución para un paciente desde su página de detalle.
Los tipos de archivo aceptados MUST ser: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
El archivo MUST tener un tamaño máximo de 5MB.
El campo `titulo` es REQUIRED. El campo `descripcion` es OPTIONAL.
El archivo MUST ser almacenado en Cloudflare R2 bajo la ruta `pacientes/{pacienteId}/fotos/{uuid}-{filename}`.
El registro en `nutri_fotos` MUST ser creado solo si el upload a R2 fue exitoso.

#### Scenario: Upload exitoso

- GIVEN el profesional está en `/profesional/pacientes/{id}`
- WHEN selecciona una imagen válida (JPEG/PNG/WebP ≤ 5MB), ingresa un título y envía el formulario
- THEN el archivo es subido a R2 bajo `pacientes/{id}/fotos/`
- AND se crea un registro en `nutri_fotos` con `paciente_id = {id}` y `r2_key = path`
- AND la foto aparece en la sección de fotos del paciente

#### Scenario: Tipo de archivo inválido

- GIVEN el profesional selecciona un archivo que no es imagen (ej: .pdf, .docx)
- WHEN envía el formulario
- THEN el upload es rechazado
- AND se muestra un mensaje de error indicando los tipos aceptados (JPEG, PNG, WebP)
- AND ningún registro es creado en `nutri_fotos`

#### Scenario: Archivo excede 5MB

- GIVEN el profesional selecciona una imagen mayor a 5MB
- WHEN envía el formulario
- THEN el upload es rechazado
- AND se muestra un mensaje de error indicando el límite de 5MB
- AND ningún registro es creado en `nutri_fotos`

#### Scenario: Título vacío

- GIVEN el profesional selecciona una imagen válida pero no ingresa título
- WHEN envía el formulario
- THEN el formulario es rechazado con validación
- AND se muestra el error "El título es requerido"

#### Scenario: Fallo en R2

- GIVEN el profesional envía un formulario válido
- WHEN el upload a R2 falla
- THEN NO se crea ningún registro en `nutri_fotos`
- AND se muestra un mensaje de error genérico

### Requirement: Visualización de fotos del paciente

Las fotos subidas MUST ser accesibles desde la página de detalle del paciente
mediante una URL firmada de Cloudflare R2 con duración de 60 segundos.
Las fotos MUST NOT ser accesibles sin autenticación (bucket privado).

#### Scenario: Profesional ve fotos del paciente

- GIVEN existen fotos subidas para un paciente
- WHEN el profesional accede a `/profesional/pacientes/{id}`
- THEN se muestra la lista de fotos con título y botón para ver/descargar
- AND al hacer clic se genera una presigned URL válida por 60 segundos

#### Scenario: Paciente sin fotos

- GIVEN un paciente no tiene fotos registradas
- WHEN el profesional accede a la sección de fotos
- THEN se muestra un estado vacío ("No hay fotos registradas")
