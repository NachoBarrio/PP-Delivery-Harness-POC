# Contrato de entrega

Detalle de desarrollo de D-01 a D-04 de [design.md](../design.md). No autoriza implementacion; ambos gates y el conflicto con el nombre de DEV deben resolverse antes de apply.

## Identificadores verificados

Inspeccion en lectura del 2026-11-05. Son referencias de inventario, no valores a incrustar en codigo o configuracion.

| Dependencia reutilizada | Identificador | Restriccion |
| --- | --- | --- |
| `cap_request` | MetadataId `237908ca-fffd-4ad1-bdbf-0729eeebbe27` | No alterar ni eliminar |
| `Information` | FormId `0da899bb-5d29-4b4c-83b7-9b9c92ae0ac5` | No incorporar bibliotecas, eventos ni campos |
| `All Requests` | SavedQueryId `18f51bbf-a7d0-f111-a05d-000d3a78b8ea` | No alterar FetchXML ni LayoutXML |
| `cap_InternalRequests` | AppModuleId `fed4bc72-d4c2-4a38-b358-53ae87722378` | No editar componentes, formularios ni navegacion |

Usar `cap_name`, `cap_priority`, `cap_description` y `cap_requeststatus`; no crear `cap_title` ni `cap_status`. Valores de prioridad: Low `767940000`, Medium `767940001`, High `767940002`. Estado inicial: New `767940000`. El formulario puede tener etiquetas propias para los campos; las opciones inglesas compartidas no se traducen.

## Recurso y pruebas unitarias

- Proyecto existente: `src\PowerPlatform\WebResources\RegistroUsuarios.WebResources`; no crear otro proyecto ni actualizar dependencias existentes.
- Recurso: `cap_\src\js\cap_request\RequestPocForm.js`; nombre Dataverse `cap_/src/js/cap_request/RequestPocForm.js`.
- Pruebas colocadas junto al recurso: `RequestPocForm.test.js`; nunca se suben a Dataverse.
- API publica unica: `RegistroUsuarios.RequestPocForm.onLoad(executionContext)`, con IIFE y Revealing Module Pattern conforme a `docs/development/javascript.md`. No exponer reglas privadas cubiertas mediante eventos.
- Registrar solo OnLoad en el formulario, pasando execution context. OnLoad conecta manejadores nombrados para los cambios de prioridad y descripcion y para OnSave; evalua tambien el estado inicial. Evitar duplicar conexiones cuando se repita la carga.
- Separar la decision pura basada en prioridad y texto del acceso a formContext. Usar `setRequiredLevel`, una notificacion de formulario con identificador exclusivo de la regla y `preventDefault()` sincrono ante valores invalidos; no usar DOM, consultas de red ni guardar desde el manejador.
- Vitest ejecuta el fichero real en un global nuevo por caso; obtiene los manejadores capturados al llamar OnLoad sobre mocks. No duplicar la regla en pruebas ni sustituirla por un falso recurso.

| Caso unitario | Resultado observable |
| --- | --- |
| Alta con descripcion nula, vacia o solo espacios | Descripcion requerida, mensaje exacto y cancelacion en guardado explicito y automatico |
| Alta con descripcion valida | Descripcion requerida, sin mensaje propio ni cancelacion |
| Correccion o vaciado mediante cambio de descripcion | Mensaje y bloqueo corresponden al texto actual |
| Cambio Alta a Baja o Media | Descripcion opcional, sin mensaje; texto conservado |
| Carga de solicitud existente | Estado de obligatoriedad y mensaje corresponde a sus valores |
| Carga repetida | Un solo efecto por evento, sin multiplicar manejadores |

Escribir las pruebas antes del recurso, confirmar el fallo por ausencia de comportamiento y despues hacerlas pasar. Mantener los comandos existentes: `npm test -- cap_/src/js/cap_request/RequestPocForm.test.js` y `npm run lint`, ejecutados desde el proyecto. La ruta con barras en el selector npm y el nombre Dataverse son identificadores portables; las rutas locales usan separadores Windows. No hay bundling ni transpilation: los bytes del fichero probado son los que se despliegan.

## Suite de navegador

Solo tras aceptar el ADR, crear `tests\requests-poc` con un `package.json` privado, lockfile, `playwright.config.mjs` y `requests.spec.js`. El unico nuevo paquete de desarrollo sera `@playwright/test`, fijado a la version estable exacta consultada en npm al crearlo. Script `test`: `playwright test`. No modificar dependencias ni configuracion de Vitest del proyecto WebResources.

Usar Chromium en modo visible, un solo worker y sin reintentos automaticos. El contexto persistente utiliza un perfil dedicado; cada prueba abre paginas nuevas y crea titulos nuevos. La fixture de contexto no inicia sesion por contraseña ni copia el perfil personal del navegador.

Entradas de ejecucion, sin valores por defecto propios de un entorno:

| Variable de proceso | Uso |
| --- | --- |
| `DATAVERSE_URL` | URL de DEV, contrastada con `.power-platform/project.json` |
| `POC_APP_ID` | AppModuleId de la MDA nueva, obtenido del inventario tras desplegar |
| `POC_USER_DATA_DIR` | Ruta absoluta de un perfil dedicado fuera del repositorio, correspondiente a la sesion administradora RegistroUsuarios |

La persona inicia sesion interactivamente en ese perfil con las herramientas de navegador y cierra ese navegador antes de ejecutar la suite, evitando dos procesos que usen el mismo perfil. El runner no persiste un storageState adicional. Si el perfil no esta autenticado, si esta ocupado o si faltan entradas, la suite falla con un mensaje de precondicion; no usa otra cuenta ni presenta pruebas omitidas como superadas.

Cada ejecucion genera un identificador nuevo y titulos como `REQUESTS-POC-<run>-valid` y `REQUESTS-POC-<run>-recovery`. Los tests nunca leen datos de una ejecucion previa para decidir su resultado. No escribir datos por API para aparentar que el formulario los creo.

1. **Recorrido valido:** abrir "Solicitudes POC", confirmar "Solicitud POC", crear Alta/High con descripcion sintetica, guardar, localizar el titulo exacto en All Requests y reabrir. Comprobar titulo, prioridad, descripcion y estado Nuevo/New.
2. **Bloqueo y recuperacion:** abrir el mismo formulario con otro titulo, seleccionar Alta/High y dejar descripcion vacia; intentar guardar y comprobar el mensaje. Verificar ausencia del registro en una segunda pagina de All Requests con busqueda por titulo exacto, sin abandonar el borrador invalido. Volver al borrador, cambiar a Baja/Low, comprobar que desaparece el mensaje, guardar y reabrir el registro desde la lista; comprobar titulo, prioridad, descripcion vacia y estado Nuevo/New.

Usar localizadores semanticos de la UI desplegada, no XPath por posicion ni ids DOM generados. Las aserciones esperan estados concretos del formulario y de la lista, con tiempos limite; no usar pausas fijas como evidencia de persistencia. Los dos casos no pretenden cubrir AutoSave en navegador: ese modo se ejercita invocando el OnSave real en las pruebas unitarias.

Ejecutar la suite desde `tests\requests-poc` con `npm test`. Para demostrar reproducibilidad, repetir una ejecucion completa con otro identificador, sin limpiar ni reutilizar registros anteriores. Son los mismos dos escenarios, no pruebas adicionales.

## Evidencia y preservacion

En apply, completar `docs\verification.md` en esta carpeta con commit, entorno verificado por nombre, componentes desplegados, version de herramientas, comandos, resultados y trazabilidad a los requisitos. No declarar pruebas realizadas durante propose.

Antes de desplegar, capturar una linea base local y despues comparar: metadatos de los cuatro campos, FetchXML/LayoutXML de All Requests, FormXML de Information y componentes/mapa de la MDA existente. Verificar tambien, como comprobacion manual de preservacion, que Internal Requests abre Information sin el recurso POC. Una diferencia inesperada bloquea la entrega; no se revierte trabajo de otras personas.

Los informes y capturas locales se guardan en las rutas ignoradas `test-results` y `playwright-report`; no generar trazas de red autenticadas por defecto. Revisar cualquier evidencia antes de versionarla: no publicar nombres reales, correos, cookies, tokens ni el perfil del navegador. La evidencia Markdown contiene solo datos sinteticos y resultados.

## Inventario, exportacion y retirada

En apply, completar `docs\inventory-and-removal.md` con GUIDs reales del formulario, app, mapa del sitio y recurso nuevos; solucion de feature y pertenencia de componentes; dependencias reutilizadas y registros sinteticos por ejecucion. No inventar los identificadores de componentes pendientes de creacion.

Registrar los GUIDs de registros persistidos y titulos disponibles tambien cuando un escenario falle. Si no se pudo recuperar el GUID, la persona resuelve el titulo exacto y comprueba el contenido antes de eliminar; un prefijo general no es una autorizacion de borrado.

Crear los componentes nuevos en `feature_RequestsPoc`, unmanaged, publisher Cap, solo mediante herramientas oficiales o editor soportado, despues de las comprobaciones y confirmaciones de `docs/development/solutions.md`. Incorporar referencias a las dependencias reutilizadas sin seleccionar todas las subpartes de la tabla ni editar sus definiciones. Confirmar las dependencias que Dataverse resuelva automaticamente.

Exportar y desempaquetar la solucion de feature en `solutions\feature_RequestsPoc`, usando `dv-solution` y PAC conforme al estandar. La fuente de formularios, vista y app procede de Dataverse; no construir XML de componentes nuevos a mano. No exportar soluciones preexistentes ni introducir datos en la solucion.

Preparar, sin ejecutar, la retirada humana: revisar dependencias; eliminar la MDA y su mapa nuevo, despues el formulario y despues el recurso, adaptando el orden a dependencias reales. Los registros se eliminan individualmente por GUID comprobado. La solucion de feature solo se elimina por decision humana y nunca se considera que borrarla elimine automaticamente los componentes. Mantener intactas las cuatro dependencias reutilizadas y todo registro ajeno a la ejecucion.

No existen estandares especificos para MDA, formularios o suites de navegador; en esas tareas rige `docs/agents/development-standards.md`. Este contrato concreta la POC, no modifica la biblioteca fija ni el harness.
