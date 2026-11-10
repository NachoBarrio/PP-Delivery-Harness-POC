# Verificacion

## Precondiciones

DEV `SDD-Testing` identificado por PAC y tenant contrastado con la sesion Azure el 2026-11-06. Excepcion limitada al Environment ID en `docs/development/solutions.md`. Gates humanos sobre `85b6f52`; ADR aceptado en `54e8c36`; solucion unmanaged creada tras confirmacion expresa.

## Pruebas unitarias: red

Pruebas escritas por un subagente desde la especificacion y la API publica, antes del recurso de produccion. Proyecto existente `src\PowerPlatform\WebResources\RegistroUsuarios.WebResources`.

Comando: `npm test -- cap_/src/js/cap_request/RequestPocForm.test.js`.

Resultado: exit 1, 31 casos fallidos por ausencia del comportamiento publico requerido. Mensaje representativo:

```text
Required public API globalThis.RegistroUsuarios.RequestPocForm.onLoad is absent:
expected 'undefined' to be 'function'
```

Sin fallos de configuracion ni de lectura de archivo no controlada. El test evalua el archivo real cuando existe, en un contexto VM nuevo por caso; durante red, su ausencia se expresa con una asercion de API publica. No implementa una regla sustituta.

Lint del archivo de pruebas: `npx --no-install eslint cap_/src/js/cap_request/RequestPocForm.test.js`, exit 0. No se cambiaron dependencias.

## Pruebas unitarias: green

Recurso implementado con una regla pura privada, OnLoad publico, manejadores nombrados, desconexion/reconexion para evitar duplicados y cancelacion sincrona del guardado. No modifica texto, no usa DOM ni realiza consultas de red.

Validacion ejecutada el 2026-11-06 a las 21:12, tras reanudar apply en una sesion con permisos. Comando desde el proyecto:

```text
npm test -- cap_/src/js/cap_request/RequestPocForm.test.js && npm run lint
```

Resultado:

```text
Test Files  1 passed (1)
Tests       31 passed (31)
Duration    770ms
npm run lint: exit 0
```

La denegacion de permisos de la sesion anterior queda resuelta. Node `v26.12.1`, npm `11.12.1`, Vitest `5.1.0`; ESLint `10.14.0` segun el manifiesto existente. Sin cambios de dependencias ni build, bundling o transpilation.

Archivo real probado: `cap_\src\js\cap_request\RequestPocForm.js`. SHA256 de sus bytes: `01e03fb65533be482596b573741f38010438ac21da918d8e63a742816e9052da`. Las pruebas lo leen del disco y lo ejecutan en una VM nueva por caso, invocando la API publica y los manejadores capturados; no duplican su regla.

| Requisito | Casos de `RequestPocForm.test.js` | Evidencia observable |
| --- | --- | --- |
| Descripcion obligatoria para prioridad Alta | `WhenLoadingHighWith%s`, `WhenHighBecomes%sWithoutChangeEvent` | Nulo, vacio, espacios, tabuladores y saltos; obligatoriedad, mensaje exacto y cancelacion sincrona |
| Guardado explicito y automatico | Grupo `%s save mode %s`, `WhenHighIsInvalidInSaveMode%s` | Modos 1 y 70, ademas 2 y 59; bloqueo independiente del modo y reevaluacion de valores actuales |
| Correccion y vaciado | `WhenDescriptionIsCorrectedThenEmptied` | Retirada y reaparicion del mensaje propio, guardado permitido o cancelado |
| Descripcion opcional para otras prioridades | `WhenPriorityChangesTo%sAndBack`, `WhenLoading%s`, `WhenValuesBecome%sWithoutChangeEvent` | Baja y Media opcionales, sin borrar ni recortar el texto existente |
| Evaluacion al abrir y editar | Casos de carga, cambios y valores sin evento previo | Estado inicial y actual coherentes; texto con espacios exteriores conservado |
| Aislamiento de la regla | Aserciones `expectValid` y `expectInvalid` | La notificacion ajena permanece; solo se retira la propia |
| Carga repetida | `WhenOnLoadRepeats` | Manejadores nombrados sin duplicados; un efecto por evento |
| APIs soportadas y atributos ausentes | `WhenAttribute%sIsMissing` | Carga y eventos restantes seguros; sin DOM, red ni escrituras de texto |

Revision de evidencia: solo valores sinteticos y metadatos; sin datos personales, tokens, credenciales ni cookies.

## Despliegue del recurso

El 2026-11-06, PAC volvio a confirmar DEV `SDD-Testing`, el Environment ID autorizado y la URL del proyecto; Azure confirmo el tenant esperado. Las aprobaciones siguen sobre `85b6f52`; el unico cambio versionado de los artefactos tecnicos es la aceptacion de ADR previamente requerida, en `54e8c36`. No se cambiaron decisiones ni requisitos.

Se repitieron el selector unitario y lint antes del despliegue: 31/31 casos superados, un archivo, exit 0; lint exit 0, a las 21:30. Se creo el recurso con el SDK oficial usando la sesion Azure ya verificada. La comprobacion de pertenencia detecto que el header de solucion aplicado a la sesion SDK no lo habia incorporado y detuvo la publicacion. Se corrigio mediante el comando oficial:

```text
pac solution add-solution-component --environment <DEV_URL> --solutionUniqueName feature_RequestsPoc --component 73cddcf1-20da-f111-84ea-000d3a78b8ea --componentType 61
```

PAC finalizo con exit 0. La consulta SDK posterior confirmo la pertenencia exacta; la accion oficial `PublishXml` publico solo ese recurso. Nombre y tipo recuperados: `cap_/src/js/cap_request/RequestPocForm.js`, JScript (3). Los 2102 bytes del contenido Base64 recuperado y de la respuesta del recurso publicado en `/WebResources/` coinciden byte a byte con el archivo probado; SHA256 `01e03fb65533be482596b573741f38010438ac21da918d8e63a742816e9052da`. GUID y pertenencia constan en el inventario. No se subieron las pruebas ni se publicaron otros componentes.

## Exportacion parcial al pausar

PAC exporto exclusivamente `feature_RequestsPoc` como unmanaged y desempaqueto su fuente real en `solutions\feature_RequestsPoc`. Ambos comandos finalizaron correctamente. Es una captura parcial de las dos referencias existentes, NO la entrega final de la tarea 5.2.

Inspeccion de los archivos generados: tabla como shell, `behavior="2"`, `unmodified="1"`, sin atributos; vista All Requests con sus columnas y orden existentes. Sin formulario POC, MDA, recurso, datos ni pruebas en la solucion. Las MissingDependencies son la tabla y las columnas preexistentes que deliberadamente no se incluyen.

La comprobacion final `git diff --check` y la retirada del ZIP temporal fueron denegadas por falta de autorizacion interactiva; no se afirma que se ejecutaran. El ZIP queda fuera del repositorio, en los archivos locales de sesion, como `feature_RequestsPoc-baseline.zip`.

## Navegador y preservacion

Pendientes MDA, comparacion completa con linea base y dos recorridos repetidos. El recurso y el formulario estan publicados; no se afirma todavia persistencia ni exito de los escenarios de navegador.

El 2026-11-06 la persona responsable autentico el perfil dedicado externo `RegistroUsuarios\requests-poc-browser` y el portal confirmo el Environment ID autorizado. En la solucion de feature se inicio un formulario principal nuevo, Solicitud POC, mediante el editor soportado. Su plantilla muestra Name, Priority, Status y Description; se anadio la biblioteca POC y un unico manejador On Load, `RegistroUsuarios.RequestPocForm.onLoad`. No se registraron manejadores On Save ni OnChange en el editor.

La seleccion de "Pass execution context as first parameter" fallo por una intercepcion del control visual; no se afirma que este activada. Al intentar reabrir el manejador para corregirla, la ejecucion fue denegada por falta de respuesta interactiva disponible. Se detuvo sin usar una via alternativa para la operacion denegada. El editor queda abierto con un borrador: NO se pulso Save and publish, no se confirma GUID persistido ni publicacion del formulario y la tarea 3.2 sigue pendiente. No se modifico Information. Antes de guardar, revisar el manejador On Load y activar execution context; despues recuperar FormXML, verificar pertenencia y comparar Information con la linea base.

## Reanudacion y publicacion del formulario

El 2026-11-09 PAC verifico otra vez la URL, el Environment ID autorizado y el nombre SDD-Testing; Azure confirmo el tenant del proyecto. Se empleo la sesion Azure existente con el SDK oficial, como en el despliegue anterior. La autenticacion de `scripts/auth.py` solicito renovar el inicio de sesion por codigo de dispositivo y se detuvo sin imprimir tokens ni cambiar la configuracion de autenticacion.

El MCP de navegador no pudo iniciar su contexto. Playwright CLI recupero la sesion existente RegistroUsuarios, visible y persistente, con el perfil externo dedicado. El borrador seguia abierto. Se cerro sin enviar datos un dialogo de comentarios de Microsoft que interceptaba los clics. Para el checkbox se pulso su etiqueta visible, sin forzar clics ni modificar el DOM; el snapshot confirmo "Pass execution context as first parameter" checked. Se confirmo Done y se ejecuto Save and publish en el editor soportado.

El editor paso de la URL de creacion a la de edicion del formulario persistido `ae5e60e8-84dc-f111-84ea-000d3a78b8ea`. La lectura SDK de DEV confirmo `componentstate = 0`, los cuatro controles del contrato y exactamente una biblioteca POC. FormXML contiene un unico evento `onload` con `RegistroUsuarios.RequestPocForm.onLoad`, `enabled="true"`, `passExecutionContext="true"` y sin parametros adicionales. No contiene registros de OnSave ni OnChange. SHA256 del FormXML recuperado: `6b1fdd3895357c654c3b903c7ae0a4527fdb0ff063f4c367f773ca30a007044e`.

El SDK verifico pertenencia del formulario a feature_RequestsPoc, tipo 60. Information conserva SHA256 `54ff2756f28eef3bae06be2cb61b86e676577017028a4d506c6eecf1d43c0f66`, los cuatro campos y ausencia de bibliotecas y eventos, igual que la linea base. No se escribio FormXML ni fuente de solucion a mano. La tarea 3.2 queda completada; la apertura desde la MDA y los escenarios de persistencia siguen pendientes.

## MDA en borrador y pausa actual

El dialogo de creacion moderno solo ofrecio nombre, descripcion y seleccion de componentes de una solucion, sin un campo para fijar `cap_RequestsPoc`. Se cerro sin crear. El listado oficial apps.js comprobo tambien las apps no publicadas y no encontro ese nombre unico. Para conservar la identidad aprobada, el SDK oficial creo solo la fila appmodule, con el icono preexistente recuperado de Internal Requests y el header `MSCRM.SolutionUniqueName`; no se genero XML de componentes, ni tablas, roles, paginas generativas o recursos adicionales.

AppId `0b268e25-6fbb-4297-ad77-f3a5c08a930f`; nombre Solicitudes POC y nombre unico `cap_RequestsPoc`, contrastados con el listado oficial de la capa guardada. La app permanece `published=false`, `unpublishedChanges=true`.

El editor soportado abrio esa app desde la solucion de feature. Se anadio solo cap_request y se retiro de su navegacion la entrada vacia Subarea1 generada por el disenador; no se borro ningun componente Dataverse. Se pulso Save, no Save and Publish. La solucion contiene el mapa nuevo y el componente asociado tipo 10085 generado por la plataforma, identificados en el inventario.

La funcion RetrieveAppComponents devolvio 404 para esta app no publicada. No se interpreto como ausencia del borrador ni se creo otra app: la lectura de appmodulecomponent por SDK, filtrada por el AppModuleIdUnique real de la capa guardada, confirmo la tabla y el mapa. La accion oficial AddAppComponents incorporo explicitamente Solicitud POC y All Requests. La lectura posterior confirma exactamente esas cuatro referencias, sin Information ni otras vistas.

Antes de publicar se comprobo el mapa mediante SDK. Esa lectura devolvio una unica SubArea de plantilla sin atributo Entity, no la entrada cap_request requerida. La asercion detuvo el procedimiento ANTES de ValidateApp y PublishXml. Falta contrastar la capa no publicada del mapa con lo guardado por el editor; no se afirma que la navegacion ya sea correcta ni se fabrica XML para sustituirla.

La siguiente inspeccion de la navegacion por Playwright CLI fue denegada porque no habia una respuesta interactiva disponible para aprobar el comando. Se detuvo sin repetirlo por otra herramienta o script. Comando preparado para la persona responsable, en una sesion interactiva:

```powershell
playwright-cli -s=RegistroUsuarios snapshot "getByRole('tree', { name: 'list', exact: true })" --depth=6
```

La tarea 3.3 sigue pendiente: resolver la verificacion del mapa, publicar la app y comprobar navegacion, formulario y acceso real. Progreso al pausar: 7/16 tareas. No se han ejecutado escenarios de navegador ni creado solicitudes sinteticas, y la fuente de solucion exportada sigue siendo la captura parcial anterior.

## Resolucion del mapa y publicacion de la MDA

El 2026-11-10 la misma inspeccion de Playwright CLI fue autorizada y confirmo Requests view y Requests form, sin Subarea1. PAC revalido DEV y Azure el tenant del proyecto. La discrepancia anterior era de capa: la lectura ordinaria del mapa devolvia la plantilla publicada, mientras el editor habia guardado una edicion no publicada. La funcion oficial composable RetrieveUnpublishedMultiple de sitemaps recupero esa edicion: exactamente una SubArea con Entity=cap_request. No se escribio ni altero su XML a mano.

La lectura de appmodulecomponent por SDK confirmo exclusivamente tabla, mapa, formulario POC y All Requests. ValidateApp respondio ValidationSuccess=true y ValidationIssueList vacia. PublishXml publico solo la app POC; la lectura posterior muestra componentstate=0 y conserva las mismas cuatro referencias.

Desde el perfil dedicado autorizado se abrio la app publicada en una pagina nueva. La navegacion muestra Requests y abre All Requests, cuyo viewid coincide con el inventario. New abre una pagina titulada "Request: Solicitud POC: New Request - Power Apps", con Name, Priority, Status y Description; Medium y New son los valores iniciales observados. Se selecciono High en el control real y aparecio el mensaje exacto de la regla. No se introdujo titulo ni se guardo una solicitud en esta comprobacion.

La tarea 3.3 queda completada. El acceso real verifica esta cuenta administradora, no otros usuarios ni un modelo de permisos multiusuario. Los dos escenarios reproducibles y su repeticion siguen pendientes; no se presentan estas comprobaciones manuales como sustituto de la suite.

## Preservacion integrada

El 2026-11-10 la comparacion de lectura con la captura anterior devuelve true para la identidad y propiedad de la tabla; tipo y obligatoriedad de los cuatro campos; valores, etiquetas y valores iniciales de ambas opciones; Information; All Requests; identidad y componentes de Internal Requests; y su mapa. Se usaron consultas SDK para registros y GET de metadatos avanzados acotados a los cuatro campos, sin escrituras.

Los hashes siguen siendo los de la linea base: Information `54ff2756f28eef3bae06be2cb61b86e676577017028a4d506c6eecf1d43c0f66`, FetchXML `61ec62fb63ed4a90c4b89729c2526e6f33481af398318a3b0db38022c7749d6a`, LayoutXML `43ddd369982cca416a43f14a8f49b972a31b16e08f259d4de22f88b637e9fe47` y mapa `edd24c69a2786fe448c8038190cb11f9c36a59b8fb09ac464498faaddeda5428`.

Se abrio Internal Requests en otra pagina del perfil dedicado y New cargo "Request: Information: New Request - Power Apps", con los cuatro campos esperados. Information no contiene bibliotecas ni eventos en su FormXML. Al elegir High con descripcion vacia no aparece el mensaje POC y el campo no queda marcado como obligatorio. No se introdujo titulo ni se guardo ese borrador. La tarea 3.4 queda completa, sin restaurar ni modificar componentes compartidos.

## Preparacion de la suite reproducible

Se consulto npm el 2026-11-10: la version estable de @playwright/test era 1.65.0. El paquete privado tests\requests-poc fija esa version exacta y conserva el lockfile generado. No se cambiaron dependencias ni configuracion de WebResources. Chromium se ejecuta visible por su canal msedge, el mismo motor y perfil dedicado utilizados en las comprobaciones previas; un worker, sin reintentos ni trazas autenticadas.

Comandos desde tests\requests-poc:

```text
npm install --no-audit --no-fund --quiet
npm test -- --list
node --check requests.spec.js
node --check playwright.config.mjs
```

Instalacion: tres paquetes, exit 0. Deteccion: exactamente dos tests en un archivo. Ambas comprobaciones de sintaxis terminaron con exit 0. La fixture exige las tres variables del contrato, contrasta la URL con DEV, valida el GUID de la app y rechaza perfiles ausentes o dentro del repositorio. No inicia sesion por contrasena ni copia perfiles. Un perfil sin acceso autenticado a Solicitudes POC produce un fallo de precondicion, no un resultado funcional superado.

Se ejecutaron dos comprobaciones negativas del primer escenario, antes de abrir navegador: sin las tres variables, exit 1 con "Precondition: missing process inputs: DATAVERSE_URL, POC_APP_ID, POC_USER_DATA_DIR."; y con URL/GUID validos pero un perfil externo inexistente, exit 1 con "Precondition: the dedicated authenticated browser profile is unavailable.". Son fallos esperados de precondicion: no se ejecutaron pasos funcionales ni se crearon datos. Selector compatible con Windows: `npm test -- --grep=High.with.description --reporter=line`.

La tarea 4.1 queda completa. Los escenarios funcionales aun deben ejecutarse y repetirse con la sesion dedicada disponible.

## Primer recorrido valido superado

El escenario High con descripcion paso en la ejecucion `7a04a74c-c784-446f-a375-464e08fd9fcd`. Creo `REQUESTS-POC-7a04a74c-c784-446f-a375-464e08fd9fcd-valid`, GUID `9a1c1a34-fadc-f111-84ea-000d3a78b8ea`, y lo reabrio desde All Requests, verificando titulo, High, descripcion sintetica y New. La respuesta GET real de la consulta de lista contiene ese mismo GUID; no se crearon datos por API.

La preparacion identifico tres detalles del cliente: debe finalizar la carga autenticada antes de interactuar; el dropdown Fluent admite seleccion por teclado; y el nombre accesible del filtro cambia al introducir texto. Se usan estados y roles semanticos, no pausas fijas, IDs generados ni indices de opciones. La reapertura usa el enlace de registro, evitando su tooltip oculto duplicado.

El escenario de bloqueo y recuperacion todavia no paso: despues de intentar guardar no se encontro el mensaje esperado. No se marca 4.3 ni la repeticion completa como realizadas. Se conserva evidencia local de intentos fallidos y del registro sintetico `f75ddb9d-f8dc-f111-84ea-000d3a78b8ea`, creado durante la calibracion del primer escenario; no se elimina ningun registro.

## Bloqueo y recuperacion superados

Al reanudar el 2026-11-10, PAC confirma otra vez DEV SDD-Testing, el Environment ID autorizado y la URL del proyecto; Azure confirma el tenant esperado. El perfil dedicado externo estaba disponible y la fixture comprobo acceso real a Solicitudes POC.

La evidencia mas reciente anterior, ejecucion `c31c9e7b-5dfc-42bc-a378-6b4c2af51ad8`, ya habia verificado el mensaje y la ausencia del registro, pero fallo al seleccionar Low: `Expected substring: "Low"; Received string: "High"`. Se reprodujo sin modificar la suite con `npm test -- --grep=High.without.description`, ejecucion `70780052-09bf-4112-b76f-732124fbc4d9`, exit 1, mismo fallo y `blocked=true`, sin GUID persistido.

La inspeccion minima en el mismo formulario, sin titulo ni guardado, confirmo que pulsar L y Enter dejaba High seleccionado. Seleccionar la opcion real mediante `getByRole("option", { name: "Low", exact: true })` cambio a Low. Se sustituyo solo la seleccion por inicial por el clic semantico de opcion; no se modifico el recurso JavaScript, el formulario ni otro componente de DEV. La prueba existente reproduce la regresion y conserva todas sus aserciones.

Comandos: `node --check requests.spec.js` y `npm test -- --grep=High.without.description`. Resultado: exit 0, un escenario superado en 7.2 s; ejecucion `86cd29d7-baf5-4a93-b73b-597017751609`. El titulo `REQUESTS-POC-86cd29d7-baf5-4a93-b73b-597017751609-recovery` no existia en la segunda pagina de All Requests mientras el borrador era High; el mensaje desaparecio al elegir Low. Despues se guardo y reabrio el registro `9f66944c-19dd-f111-84ea-000d3a78b8ea`, verificando titulo, Low, descripcion vacia y New (`blocked=true`, `reopened=true`).

Se conservaron los informes anteriores y los de esta reanudacion en los archivos locales de sesion, fuera de Git. La tarea 4.3 queda completa; faltan las dos ejecuciones completas para demostrar reproducibilidad.

## Suite completa y repeticion

El 2026-11-10 se ejecutaron los mismos dos escenarios completos, con un worker, Chromium visible mediante msedge, perfil dedicado externo, sin reintentos, limpieza de datos ni reutilizacion de registros. La fixture verifico en ambas ejecuciones acceso autenticado a Solicitudes POC. Ninguna prueba escribe datos por API.

Preparacion desde la raiz del repositorio, con el GUID de app obtenido del inventario:

```powershell
$project = Get-Content -LiteralPath .power-platform\project.json -Raw | ConvertFrom-Json
$env:DATAVERSE_URL = $project.connections.dataverse.devUrl
$env:POC_APP_ID = '<AppModuleId del inventario>'
$env:POC_USER_DATA_DIR = Join-Path $env:LOCALAPPDATA 'RegistroUsuarios\requests-poc-browser'
$env:PLAYWRIGHT_HTML_OPEN = 'never'
Set-Location tests\requests-poc
npm test
npm test
```

Cerrar antes el navegador que use ese perfil. Las ejecuciones efectivas usaron adicionalmente `--output=<carpeta local de evidencia>`: `requests-poc-full-first` y `requests-poc-full-repeat`, dentro de los archivos locales de esta sesion, fuera del repositorio. Se conservo tambien una copia del informe JSON de cada ejecucion. Las rutas predeterminadas `test-results` y `playwright-report` estan ignoradas; no se genera storageState ni trazas autenticadas.

| Ejecucion | Resultado | Alta valida: GUID | Recuperacion a Baja: GUID |
| --- | --- | --- | --- |
| `ad139b12-22a4-4adc-afce-4f2e8d262673` | 2/2 superados, exit 0, 19.4 s | `39a4b11a-1fdd-f111-84ea-000d3a78b8ea` | `d03f7c21-1fdd-f111-84ea-000d3a78b8ea` |
| `d52f18d1-24ad-4ada-80e6-edeaac3ba5bf` | 2/2 superados, exit 0, 32.4 s | `17e4a6ae-23dd-f111-84ea-000d3a78b8ea` | `a24a13b6-23dd-f111-84ea-000d3a78b8ea` |

En cada ejecucion, `valid` crea un titulo nuevo, persiste y reabre High con descripcion sintetica y New. `recovery` verifica el mensaje y ausencia de su titulo en una segunda lista (`blocked=true`), cambia a Low, comprueba la desaparicion del mensaje, guarda y reabre sin descripcion y con New. Todos los GUIDs de formulario coinciden con los devueltos por la consulta real de All Requests; las cuatro reaperturas son `reopened=true`.

Trazabilidad: Captura de solicitudes y Evaluacion al abrir -> reapertura en ambos recorridos; Descripcion obligatoria -> mensaje, guardado rechazado y segunda lista sin registro; Descripcion opcional -> cambio a Low y persistencia vacia; Evidencia reproducible -> dos ejecuciones completas independientes. AutoSave, espacios y Media siguen cubiertos por las pruebas unitarias, no se atribuyen a estos dos recorridos. La tarea 4.4 queda completa.

## Inventario final y exportacion

El SDK, mediante `scripts/auth.py`, solicito renovar la autenticacion por codigo de dispositivo: `Precondition: Dataverse SDK authentication requires interactive renewal.` No se mostro ni almaceno el codigo. La persona eligio expresamente usar la sesion Azure vigente solo para lecturas SDK, sin editar `auth.py`. Se volvio a contrastar su tenant con el proyecto antes de usar AzureCliCredential. No se introdujo infraestructura ni cambio de autenticacion del repositorio.

La lectura oficial de DEV confirmo siete componentes de la solucion y ocho registros sinteticos, reconciliados en `inventory-and-removal.md`. Information, FetchXML y LayoutXML de All Requests y el mapa de Internal Requests conservan exactamente sus hashes de linea base. Solicitud POC sigue publicado, con el mismo FormXML y unico OnLoad pasando execution context. El recurso recuperado coincide byte a byte con el archivo real probado. No se hicieron escrituras SDK.

PAC 2.14.1 exporto exclusivamente `feature_RequestsPoc` desde el DEV verificado, unmanaged, y desempaqueto sobre `solutions\feature_RequestsPoc`. Comandos efectivos:

```powershell
pac solution export --environment <DEV_URL> --name feature_RequestsPoc --path <ZIP_LOCAL> --managed false
pac solution unpack --zipfile <ZIP_LOCAL> --folder solutions\feature_RequestsPoc --packagetype Unmanaged --allowWrite true --errorlevel Warning
```

Ambos finalizaron con exit 0. SHA256 del ZIP final: `d67b2d9210ab7e3f5c3d589fd5b51e48c2149c0031ccc02d7dd5f61f20b44228`. La revision de sus diez archivos confirma el formulario, app, mapa y recurso nuevos, All Requests y la tabla shell sin atributos. No contiene Information, la MDA existente, datos, pruebas como recursos web, nuevos roles o procesos. Las MissingDependencies se conservan: tabla y campos existentes, icono reutilizado y definicion de plataforma AppChannel. No se modifico XML a mano ni se importo la solucion.

SHA256 del JavaScript exportado y del archivo probado: `01e03fb65533be482596b573741f38010438ac21da918d8e63a742816e9052da`, iguales al recurso recuperado de DEV. La vista exportada conserva columnas, consulta y orden; RibbonDiff no contiene acciones ni reglas propias.

El ZIP final temporal se elimino tras contrastar la fuente; solo los archivos desempaquetados son fuente de entrega. Los informes JSON y metadatos de verificacion permanecen fuera de Git.

## Revision integrada de la entrega

El 2026-11-10 se volvieron a ejecutar, desde WebResources, `npm test -- cap_/src/js/cap_request/RequestPocForm.test.js && npm run lint`: 31/31 casos superados, un archivo, 727 ms; lint exit 0. El proyecto no tiene build, bundling ni transpilation por diseno; se entregan los bytes comprobados. No se modificaron dependencias.

La revision relaciona requisitos y evidencia: regla del archivo real y cancelacion de AutoSave en unitarias; despliegue y OnLoad en FormXML; navegacion y reapertura reales en los dos recorridos repetidos; preservacion por linea base, hashes y apertura manual de Information; retirada limitada mediante GUIDs, dependencias reales y procedimiento exclusivamente humano.

La comprobacion del indice Git detecto que `core.autocrlf=true` de la instalacion normalizaba a LF los dos recursos JavaScript, originalmente CRLF. Para preservar los 2102 bytes verificados se usaron opciones solo de esa invocacion, sin cambiar configuracion global, del repositorio ni archivos de atributos:

```powershell
git -c core.autocrlf=false add --renormalize -- <recurso fuente> <recurso exportado>
git -c core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol diff --cached --check
```

Los dos blobs preparados coinciden byte a byte con los archivos probados y recuperados de DEV. El segundo comando conserva las comprobaciones habituales de espacios, admitiendo solo CR como final de linea; exit 0. La comprobacion ordinaria inicial habia marcado esos CR como espacios finales, no defectos de formato del codigo. No se modificaron archivos de produccion ni metadatos para resolverlo.

Revision final: 19 archivos propios del cambio, busqueda dirigida de secretos sin coincidencias y revision de configuracion y manifiesto sin credenciales ni datos personales. `openspec validate requests-poc --strict --no-interactive` devuelve cambio valido. Se excluyen el perfil, informes, node_modules, ZIPs y los cambios preexistentes ajenos en la biblioteca fija, archivo de cambios, specs principales y scripts de autenticacion. No hay estandar especifico de navegador; se aplica el contrato POC aprobado y el gate comun.

La fuente, codigo, suite y documentos quedan versionados conjuntamente en el commit de `feature/requests-poc` que incorpora esta revision. No se efectua push, importacion, promocion, archivo del cambio ni eliminacion de componentes o registros.
