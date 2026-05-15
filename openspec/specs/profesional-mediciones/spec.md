# Profesional — Mediciones Specification

## Purpose

Define los requisitos para que el profesional registre mediciones antropométricas
en nombre de cualquiera de sus pacientes.

## Requirements

### Requirement: Registro de medición por el profesional

El profesional MUST poder registrar una medición antropométrica para un paciente específico
desde la página de detalle de ese paciente.
La medición MUST quedar asociada al `paciente_id` del paciente, no al `id` del profesional.
El campo `peso` es REQUIRED. Los campos `porcentaje_grasa`, `cintura`, `cadera` y `notas` son OPTIONAL.
El campo `fecha` es REQUIRED y MUST ser una fecha válida en formato `YYYY-MM-DD`.

#### Scenario: Registro exitoso con campos mínimos

- GIVEN el profesional está autenticado y en `/profesional/pacientes/{id}`
- WHEN envía el formulario con `peso` y `fecha` válidos
- THEN la medición es insertada en `nutri_antropometria` con `paciente_id = {id}`
- AND el gráfico de evolución se actualiza con el nuevo punto

#### Scenario: Registro exitoso con todos los campos

- GIVEN el profesional está autenticado y en `/profesional/pacientes/{id}`
- WHEN envía el formulario con peso, grasa, cintura, cadera, fecha y notas
- THEN todos los campos son persistidos correctamente en `nutri_antropometria`

#### Scenario: Peso inválido

- GIVEN el profesional está en el formulario de medición
- WHEN envía el formulario con `peso` vacío o no numérico
- THEN la medición NO es guardada
- AND se muestra un mensaje de error indicando que el peso es requerido

#### Scenario: Fecha inválida

- GIVEN el profesional está en el formulario de medición
- WHEN envía el formulario con `fecha` vacía o en formato incorrecto
- THEN la medición NO es guardada
- AND se muestra un mensaje de error

#### Scenario: Paciente inexistente

- GIVEN el profesional navega a `/profesional/pacientes/{id-inexistente}`
- WHEN intenta registrar una medición
- THEN la página muestra 404 antes de que el formulario sea accesible

### Requirement: Visibilidad de mediciones registradas por el profesional

Las mediciones registradas por el profesional MUST ser visibles tanto en:
- El gráfico de evolución del detalle del paciente (vista del profesional)
- El panel del paciente (`/paciente`) en su propia vista de evolución

#### Scenario: Medición aparece en ambas vistas

- GIVEN el profesional registra una medición para el paciente P
- WHEN el paciente P accede a su panel
- THEN la medición aparece en su gráfico de evolución
