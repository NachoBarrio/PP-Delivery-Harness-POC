# Proposal

## Why

Validar el harness de Power Platform mediante una POC desechable de entrega SDD, con pocos componentes y un unico usuario administrador. El objetivo es demostrar trazabilidad entre requisitos, desarrollo JavaScript, pruebas unitarias y pruebas de navegador, no construir una aplicacion de produccion.

## What Changes

- Crear la MDA "Solicitudes POC" con una unica entrada de navegacion para solicitudes.
- Reutilizar la tabla existente `cap_request` y la vista "All Requests", sin alterar sus columnas, opciones ni consultas.
- Crear un formulario principal exclusivo de la POC con titulo, prioridad, descripcion y estado.
- Incorporar un unico automatismo JavaScript: prioridad Alta exige una descripcion no vacia; sin ella se muestra un mensaje y se bloquea el guardado. Media y Baja permiten omitirla.
- Verificar el comportamiento mediante pruebas unitarias del recurso JavaScript real y dos escenarios repetibles de Playwright en la MDA desplegada.
- Identificar los componentes y datos propios de la POC para que una persona pueda retirarlos sin eliminar dependencias preexistentes.
- Mantener fuera de alcance registro horario, pausas, flujos, plugins, integraciones, nuevos roles, pruebas multiusuario, pipelines y evolucion posterior.

## Capabilities

### New Capabilities

- `internal-requests`: captura de solicitudes en una MDA con descripcion obligatoria segun prioridad, aislamiento del formulario de prueba y verificacion reproducible como administrador.

### Modified Capabilities

Ninguna. El inventario OpenSpec no contiene capacidades actuales; los componentes existentes en DEV no tienen una especificacion local que se pueda modificar.

## Impact

- DEV: nueva MDA con su navegacion, un formulario y un recurso web; se referencian una tabla y una vista ya existentes.
- Codigo futuro: un recurso JavaScript en el proyecto WebResources existente y sus pruebas unitarias; una suite de navegador limitada a dos escenarios.
- Herramientas: conservar Vitest y ESLint existentes; introducir un runner de Playwright solo para la POC, sujeto al ADR y al gate tecnico.
- Datos: exclusivamente solicitudes sinteticas identificadas por ejecucion. No se modifican registros existentes ni se impone validacion en servidor.
- Seguridad: usar solo la cuenta administradora indicada por el usuario. No afirmar cobertura de permisos ni aislamiento de datos entre usuarios.
- Ciclo de entrega: rama `feature/requests-poc`; la futura solucion `feature_RequestsPoc` no se crea durante la planificacion.
- Bloqueo previo a implementacion: el DEV verificado se llama `SDD-Testing`, nombre que la comprobacion del harness rechaza para crear componentes. Resolverlo por una via aprobada antes de implementar; esta propuesta no modifica las reglas ni autoriza saltarlas.
