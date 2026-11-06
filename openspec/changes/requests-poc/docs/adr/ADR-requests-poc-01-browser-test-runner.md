# ADR-requests-poc-01. Runner de navegador limitado a la POC

- Status: Accepted
- Date: 2026-11-06
- Change: requests-poc
- Supersedes: Ninguno
- Requirements: internal-requests: Evidencia reproducible con un administrador

## Context

La especificacion exige exactamente dos escenarios repetibles de navegador sobre una MDA desplegada, ademas de pruebas unitarias del JavaScript real. El proyecto WebResources ya tiene Vitest y ESLint, que se conservan; no existe una suite end-to-end ni un runner de navegador en el repositorio. La configuracion local de Playwright mencionada por `.gitignore` tampoco existe.

Success by Design recomienda una estrategia de pruebas con criterios, datos, responsabilidades y evidencia trazables: [estrategia de pruebas](https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/testing-strategy). Esa recomendacion no implica soporte especifico de Microsoft para automatizar una MDA con Playwright.

## Decision

Introducir `@playwright/test` exclusivamente en una suite POC separada bajo `tests\requests-poc`, con dos pruebas y un perfil administradora dedicado fuera del repositorio. No sustituye Vitest, no modifica el stack del recurso web y no establece una convencion general end-to-end.

## Alternatives considered

- Pruebas unitarias existentes: no verifican que el formulario desplegado guarde y reabra registros.
- Solo comprobacion manual o comandos de navegador sin suite: no proporcionan los dos escenarios repetibles exigidos.
- Incorporar Playwright al proyecto WebResources: mezcla ejecucion contra DEV con las pruebas unitarias y el lint del recurso.
- Framework adicional de automatizacion de Dynamics o pipeline: introduce dependencias y operaciones ajenas a esta POC.

## Consequences

- Positive: escenarios ejecutables con resultados, capturas y trazabilidad independientes de las pruebas unitarias.
- Negative: nueva dependencia de desarrollo y mantenimiento de localizadores; autenticacion interactiva, MFA o cambios de UI pueden impedir la ejecucion.
- Follow-up: fijar la version estable exacta al crear la suite, conservar el lockfile y documentar el perfil externo. Ejecutar con un solo worker y sin borrado automatico de datos; ninguna credencial, cookie o traza autenticada se publica.

## Revisit when

La POC deja de ser desechable, se solicitan mas escenarios, otros usuarios o una pipeline; cualquiera de esos cambios requiere otra decision, no ampliar este ADR por defecto.
