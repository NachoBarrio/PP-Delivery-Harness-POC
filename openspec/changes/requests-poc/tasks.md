# Tasks

Referencia: [design.md](design.md) y [contrato de entrega](docs/delivery-contract.md). Las tareas implementan D-01 a D-04; no cambian la especificacion ni toman nuevas decisiones de arquitectura.

**Precondiciones de apply, fuera del progreso de tareas:** resolver por una via aprobada el rechazo de `SDD-Testing`; comprobar identidad y tenant; validar ambos gates contra sus commits; aceptar el ADR y crear con confirmacion la solucion `feature_RequestsPoc` siguiendo `docs/development/solutions.md`, antes de la primera tarea. Mientras falte una precondicion no se escribe codigo ni se crean componentes.

## 1. Dependencias y linea base

- [ ] 1.1 [solutions] Capturar en lectura la linea base de `cap_request`, los cuatro campos verificados, All Requests, Information y componentes/mapa de `cap_InternalRequests`; registrar las referencias en `docs\inventory-and-removal.md`. Verificar que nombres, opciones, valores iniciales y ausencia de scripts coinciden con el contrato; detenerse ante diferencias que alteren el plan.
- [ ] 1.2 [solutions] Incorporar en `feature_RequestsPoc` las referencias necesarias a `cap_request` y All Requests, sin incluir todas las subpartes ni editar dependencias. Verificar la pertenencia real a la solucion y que no se ha incorporado la MDA existente ni componentes ajenos salvo dependencias requeridas documentadas.

## 2. Recurso JavaScript y pruebas unitarias

- [ ] 2.1 [javascript] Escribir primero `RequestPocForm.test.js` a partir de la especificacion y la API publica definida, mediante un subagente de pruebas si esta disponible, conforme al estandar. Cubrir carga, Alta invalida y valida, espacios, correccion y vaciado, cambios a Baja y Media, guardado explicito/automatico y carga repetida. Ejecutar el selector de Vitest del contrato y conservar evidencia de que los casos fallan por ausencia del comportamiento requerido, no por errores de configuracion.
- [ ] 2.2 [javascript] Implementar `RequestPocForm.js` en el proyecto WebResources existente, con la API `RegistroUsuarios.RequestPocForm.onLoad`, regla pura privada y manejadores nombrados conforme al contrato. Verificar que las pruebas ejecutan el fichero real y pasan, que `npm run lint` pasa y que el script no modifica texto ni usa DOM ni consulta la red.
- [ ] 2.3 [javascript] Completar en `docs\verification.md` la trazabilidad de casos unitarios a requisitos, comandos y resultados red/green; verificar que la evidencia corresponde al recurso real y no contiene datos personales ni credenciales.

## 3. Formulario y MDA POC en DEV

- [ ] 3.1 [javascript] Desplegar el recurso probado en la solucion de feature y publicarlo con las herramientas oficiales. Verificar nombre Dataverse y coincidencia de bytes entre el contenido desplegado y el fichero sometido a pruebas; registrar GUID y pertenencia en `docs\inventory-and-removal.md`.
- [ ] 3.2 [model-driven-form] Crear y publicar el formulario principal Solicitud POC sobre `cap_request` con los cuatro campos y solo OnLoad registrado pasando execution context. Verificar FormXML recuperado de DEV, biblioteca y manejador correctos, sin registros de OnChange/OnSave en el editor ni cambios en Information.
- [ ] 3.3 [model-driven-app] Crear y publicar `cap_RequestsPoc`, nombre Solicitudes POC, con su mapa y una unica entrada para `cap_request`, All Requests y solo Solicitud POC como formulario de edicion. Verificar navegacion real, seleccion del formulario y acceso de la cuenta administradora autorizada; registrar GUIDs de app, mapa y formulario en el inventario.
- [ ] 3.4 [model-driven-app] Comparar las dependencias preexistentes con la linea base y abrir Information desde Internal Requests como comprobacion de preservacion. Verificar configuracion intacta y ausencia del recurso POC; documentar el resultado en `docs\verification.md` sin revertir diferencias de otras personas.

## 4. Dos escenarios de navegador reproducibles

- [ ] 4.1 [browser-tests] Crear la suite separada `tests\requests-poc` exactamente como define el contrato y el ADR aceptado: paquete privado, version estable exacta de `@playwright/test`, lockfile, configuracion Chromium visible con un worker y fixture de perfil externo. Verificar instalacion, deteccion de exactamente dos tests y fallo claro de precondicion ante entradas o sesion no disponibles, sin credenciales incrustadas ni cambios al stack WebResources.
- [ ] 4.2 [browser-tests] Implementar el recorrido Alta valida con titulo unico, guardado y reapertura desde All Requests. Ejecutarlo con la sesion administradora vigente y verificar titulo, prioridad, descripcion y estado Nuevo del registro realmente persistido; registrar identificador de ejecucion y GUID sintetico.
- [ ] 4.3 [browser-tests] Implementar el recorrido Alta sin descripcion: mensaje y ausencia del registro en una segunda pagina de lista; cambiar el borrador a Baja, guardar y reabrir. Ejecutarlo y verificar bloqueo antes del cambio, desaparicion del mensaje y persistencia posterior sin descripcion; registrar identificadores incluso cuando el caso falle.
- [ ] 4.4 [browser-tests] Repetir la suite completa con un identificador nuevo sin limpiar datos ni reutilizar registros previos. Verificar que ambos escenarios pasan de nuevo y completar `docs\verification.md` con comandos, resultados, precondiciones y evidencia revisada; los informes locales quedan ignorados y el perfil fuera de Git.

## 5. Inventario final y fuente de entrega

- [ ] 5.1 [delivery-documentation] Completar `docs\inventory-and-removal.md` con componentes nuevos, referencias reutilizadas, pertenencia a solucion y registros de todas las ejecuciones; preparar el orden de retirada humana segun dependencias reales. Verificar que no incluye eliminacion automatica, dependencias preexistentes ni otros registros, y que distingue borrar la solucion de borrar sus componentes.
- [ ] 5.2 [solutions] Exportar y desempaquetar solo `feature_RequestsPoc` mediante `dv-solution` y PAC en `solutions\feature_RequestsPoc`. Verificar que la fuente proviene de DEV, contiene los componentes POC esperados y no introduce modificaciones de definiciones compartidas, datos ni pruebas como recursos web.
- [ ] 5.3 [solutions] Revisar la entrega integrada contra los requisitos y la Definition of Done: evidencia del recurso desplegado, resultados unitarios/lint y de los dos recorridos repetidos, preservacion e inventario. Verificar el diff y la ausencia de secretos; versionar codigo, fuente de solucion y documentacion del cambio en `feature/requests-poc`, sin incluir cambios ajenos.
