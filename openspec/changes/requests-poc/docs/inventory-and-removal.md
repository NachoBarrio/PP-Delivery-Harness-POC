# Inventario y retirada

## Linea base

Capturada en lectura el 2026-11-06 en DEV `SDD-Testing`, tras verificar Environment ID, URL y tenant. Gates humanos sobre `85b6f52`; aceptacion del ADR en `54e8c36`. La excepcion autorizada de `docs/development/solutions.md` permite este entorno concreto.

| Dependencia preexistente | GUID | Estado observado |
| --- | --- | --- |
| Tabla `cap_request` | `237908ca-fffd-4ad1-bdbf-0729eeebbe27` | OrganizationOwned; conjunto `cap_requests`; clave `cap_requestid` |
| Formulario Information | `0da899bb-5d29-4b4c-83b7-9b9c92ae0ac5` | Principal; cuatro campos; sin bibliotecas ni manejadores |
| Vista All Requests | `18f51bbf-a7d0-f111-a05d-000d3a78b8ea` | Titulo, prioridad, estado y creacion; orden descendente por creacion, sin filtro de propietario |
| MDA `cap_InternalRequests` | `fed4bc72-d4c2-4a38-b358-53ae87722378` | Nombre Internal Requests; identificador de capa `e1581336-3053-416c-b63b-a7ef0cc95eee` |
| Mapa Internal Requests | `0ce0c25d-5057-4083-9ad8-87abfd9be6ef` | Una subarea para `cap_request`; descubierto mediante componentes de la app, no por nombre supuesto |
| Vista adicional de la MDA existente | `ffea2d3b-7bd5-4c37-b766-017bf709a939` | Referencia preexistente; no modificar |
| Vista adicional de la MDA existente | `ab77416d-a197-4196-9765-d45c074c5469` | Referencia preexistente; no modificar |

`cap_name`, `cap_priority` y `cap_requeststatus` son ApplicationRequired; `cap_description` es opcional. Prioridad: Low `767940000`, Medium `767940001`, High `767940002`, valor inicial Medium. Estado: New `767940000`, In progress `767940001`, Completed `767940002`, valor inicial New. Los valores, campos y ausencia de scripts coinciden con el contrato. No existe `cap_RequestsPoc` al capturar la linea base.

Las seis referencias de componentes de Internal Requests son el mapa (62), la tabla (1), Information (60) y las tres vistas (26). La captura completa queda en el archivo local de sesion `requests-poc-baseline.json`, sin registros de negocio ni credenciales.

| Captura | SHA256 de bytes UTF-8 |
| --- | --- |
| Information FormXML | `54ff2756f28eef3bae06be2cb61b86e676577017028a4d506c6eecf1d43c0f66` |
| All Requests FetchXML | `61ec62fb63ed4a90c4b89729c2526e6f33481af398318a3b0db38022c7749d6a` |
| All Requests LayoutXML | `43ddd369982cca416a43f14a8f49b972a31b16e08f259d4de22f88b637e9fe47` |
| Mapa SitemapXML | `edd24c69a2786fe448c8038190cb11f9c36a59b8fb09ac464498faaddeda5428` |
| Archivo de linea base | `5189d83b62c39ab342ba3862ef11338b11a3209277c414cc840e8bf3a4afa756` |

## Componentes nuevos

| Componente | GUID | Verificacion |
| --- | --- | --- |
| Solucion `feature_RequestsPoc` | `664fe01f-19da-f111-84ea-000d3a78b8ea` | Creacion autorizada; unmanaged, version 1.0.0.0, publisher Cap (`6b9f157d-32ce-f111-a05c-000d3a78b8ea`), prefijo cap |
| Recurso `cap_/src/js/cap_request/RequestPocForm.js` | `73cddcf1-20da-f111-84ea-000d3a78b8ea` | Tipo 3 (JScript), publicado; 2102 bytes identicos al archivo probado y al recurso servido por DEV; SHA256 `01e03fb65533be482596b573741f38010438ac21da918d8e63a742816e9052da` |
| Formulario principal Solicitud POC | `ae5e60e8-84dc-f111-84ea-000d3a78b8ea` | Publicado el 2026-11-09 mediante el editor soportado; cuatro campos y un unico OnLoad habilitado con execution context; `componentstate = 0` |
| MDA Solicitudes POC, `cap_RequestsPoc` | `0b268e25-6fbb-4297-ad77-f3a5c08a930f` | Publicada el 2026-11-10; navegacion real y apertura de Solicitud POC verificadas con la sesion administradora autorizada |
| Mapa Solicitudes POC | `db96fad3-87dc-f111-84ea-000d3a78b8ea` | Creado por el editor soportado; la capa guardada contiene una unica SubArea Entity=cap_request, que la app publicada abre en All Requests |
| Componente asociado a la app, tipo 10085 | `0439139a-87dc-f111-84ea-000d3a78b8ea` | Generado por la plataforma al crear la app; tipo recuperado de solutioncomponent, sin atribuir un nombre logico no verificado |

MDA, mapa y formulario publicados y verificados. La preservacion integrada y los dos recorridos de navegador repetidos constan en `verification.md`.

## Pertenencia verificada

Consulta SDK de `solutioncomponent` acotada a la solucion de feature, tras incorporar las referencias con `AddSolutionComponent`:

| Componente reutilizado | SolutionComponentId | Inclusion |
| --- | --- | --- |
| `cap_request` (1) | `1f0daa29-1ada-f111-84ea-000d3a78b8ea` | `rootcomponentbehavior = 2` (shell); sin metadatos compartidos ni subcomponentes |
| All Requests (26) | `210daa29-1ada-f111-84ea-000d3a78b8ea` | Referencia explicita a la vista existente |

Exactamente dos componentes en este punto. `AddRequiredComponents = false`, `DoNotIncludeSubcomponents = true`; para la tabla, `IncludedComponentSettingsValues = []`. No se incorporaron Information, la MDA existente, su mapa ni otras dependencias. PAC no expone la exclusion de subcomponentes; se utilizo la accion Web API oficial documentada por Microsoft. No se modificaron las definiciones reutilizadas.

El 2026-11-06 se incorporo el recurso nuevo mediante PAC, tipo 61, sin solicitar dependencias adicionales. SolutionComponentId `d6bb10fb-20da-f111-84ea-000d3a78b8ea`, pertenencia a `feature_RequestsPoc` confirmada mediante SDK antes de publicar. El header de solucion aplicado a la sesion del SDK no produjo la pertenencia esperada en la creacion; la comprobacion detuvo la publicacion y PAC realizo la incorporacion explicita. No se recreo ni se elimino el recurso.

El 2026-11-09 el editor creo y publico Solicitud POC dentro de la solucion de feature. El SDK confirmo el componente tipo 60, SolutionComponentId `bb5e60e8-84dc-f111-84ea-000d3a78b8ea`, y cuatro componentes totales: tabla como shell, vista reutilizada, recurso y formulario nuevo. No se incorporo Information ni la MDA existente.

La app se creo con el header oficial `MSCRM.SolutionUniqueName: feature_RequestsPoc`; pertenencia confirmada antes de editarla. SolutionComponentId de la app, tipo 80: `0839139a-87dc-f111-84ea-000d3a78b8ea`; del mapa, tipo 62: `dd96fad3-87dc-f111-84ea-000d3a78b8ea`; del componente asociado tipo 10085: `0a39139a-87dc-f111-84ea-000d3a78b8ea`. La lectura posterior muestra siete componentes en la solucion; la tabla sigue como shell, sin incluir todas sus subpartes.

El icono obligatorio de la app reutiliza el recurso preexistente `cap_InternalRequests_icon`, GUID `29166f96-3ad2-f111-a05d-000d3a78b8ea`, obtenido por SDK desde Internal Requests. Es una dependencia adicional reutilizada, no un componente creado por la POC; no se modifico y queda excluido de la retirada.

La lectura SDK de los componentes de la app, usando su AppModuleIdUnique `c9a2c460-3806-4323-be7e-da7c4cd03825`, confirma cuatro referencias antes y despues de publicar: tabla, mapa, Solicitud POC y All Requests. Se incorporaron formulario y vista mediante AddAppComponents, sin eliminar componentes de ninguna app. Information no esta en esa lista. El 2026-11-10 se verifico navegacion real y acceso autorizado desde la MDA publicada.

La captura parcial anterior queda sustituida por la exportacion final del 2026-11-10, realizada exclusivamente sobre `feature_RequestsPoc` y desempaquetada por PAC en `solutions\feature_RequestsPoc`. La lectura SDK de ese dia confirma exactamente los siete componentes inventariados, sus SolutionComponentId y la tabla como shell (`rootcomponentbehavior = 2`); sin Information ni componentes de Internal Requests.

La fuente final contiene diez archivos: manifiesto y Customizations, shell y RibbonDiff vacio de la tabla, All Requests, Solicitud POC, app, mapa, recurso y sus metadatos. No contiene atributos, nuevas opciones, definiciones de roles, procesos, datos ni pruebas como recursos web. Los bytes del recurso exportado coinciden con los probados y recuperados de DEV. No se genero ni edito XML a mano.

El manifiesto mantiene dependencias preexistentes explicitas: `cap_request`, sus campos utilizados por formulario y vista, el icono `cap_InternalRequests_icon` y la definicion de plataforma AppChannel de AppFramework. No se incorporaron para ocultar MissingDependencies. La app incluye una configuracion AppChannel generada por la plataforma y vinculos a dos roles existentes, no nuevos roles. La solucion sigue sin ser un paquete independiente para otro entorno; no se importo ni promovio.

## Dependencias para la retirada

Contrastadas con la fuente real exportada y la pertenencia SDK del 2026-11-10:

| Componente POC | Referencias observadas | Limite de retirada |
| --- | --- | --- |
| `cap_RequestsPoc` | Tabla, All Requests, Solicitud POC, mapa POC; icono y roles preexistentes; configuracion AppChannel | Retirar solo la app y sus asociaciones propias; conservar todos los elementos reutilizados |
| Mapa POC | Una SubArea para `cap_request` | Retirar solo el mapa nuevo, nunca la tabla ni el mapa de Internal Requests |
| Solicitud POC | Cuatro campos existentes y biblioteca `RequestPocForm.js`, unico OnLoad con execution context | Retirar el formulario antes del recurso; no tocar Information, campos ni configuracion global |
| Recurso POC | Biblioteca registrada en Solicitud POC | Retirar solo el GUID nuevo tras comprobar que ningun componente ajeno lo referencia |
| Componente asociado tipo 10085 | Pertenencia a la solucion POC; la exportacion incluye AppChannel ligado a la app nueva | Revisar su dependencia real en el editor antes de retirarlo; nunca borrar la definicion compartida AppChannel |

Esta captura no sustituye la comprobacion de dependencias inmediatamente antes de cada eliminacion en DEV compartido. Si aparece una referencia ajena, detenerse; no retirarla ni forzar su eliminacion.

## Registros sinteticos

La reconciliacion SDK del 2026-11-10 consulto solo `cap_request` con `startswith(cap_name,'REQUESTS-POC-')`, cinco columnas y limite 50. Devolvio ocho registros, todos con titulos sinteticos del contrato. Esta lectura sirve al inventario, no decide resultados de pruebas ni reutiliza registros.

El titulo exacto de cada fila es `REQUESTS-POC-<ejecucion>-<escenario>`. Todos conservan New; `valid` tiene High y descripcion sintetica, y `recovery` tiene Low sin descripcion.

| Ejecucion | Escenario | GUID persistido | Evidencia |
| --- | --- | --- | --- |
| `7aab9196-cc2a-4b6a-afbd-ac8d3cdda02e` | `valid` | `f75ddb9d-f8dc-f111-84ea-000d3a78b8ea` | Intento anterior de calibracion; persistencia reconciliada, sin atribuir exito de reapertura |
| `7a04a74c-c784-446f-a375-464e08fd9fcd` | `valid` | `9a1c1a34-fadc-f111-84ea-000d3a78b8ea` | Primer recorrido valido superado |
| `c6511dfb-8738-46c9-9f13-284c8ccd9761` | `valid` | `57cca484-fbdc-f111-84ea-000d3a78b8ea` | Intento anterior recuperado en la reconciliacion; resultado de prueba no acreditado |
| `86cd29d7-baf5-4a93-b73b-597017751609` | `recovery` | `9f66944c-19dd-f111-84ea-000d3a78b8ea` | Bloqueo, cambio a Low y reapertura superados |
| `ad139b12-22a4-4adc-afce-4f2e8d262673` | `valid` | `39a4b11a-1fdd-f111-84ea-000d3a78b8ea` | Primera suite completa superada |
| `ad139b12-22a4-4adc-afce-4f2e8d262673` | `recovery` | `d03f7c21-1fdd-f111-84ea-000d3a78b8ea` | Primera suite completa superada |
| `d52f18d1-24ad-4ada-80e6-edeaac3ba5bf` | `valid` | `17e4a6ae-23dd-f111-84ea-000d3a78b8ea` | Repeticion completa superada |
| `d52f18d1-24ad-4ada-80e6-edeaac3ba5bf` | `recovery` | `a24a13b6-23dd-f111-84ea-000d3a78b8ea` | Repeticion completa superada |

Intentos fallidos recuperables sin GUID: `c31c9e7b-5dfc-42bc-a378-6b4c2af51ad8-recovery` y `70780052-09bf-4112-b76f-732124fbc4d9-recovery`, ambos precedidos por `REQUESTS-POC-`. Sus informes acreditan el bloqueo antes del fallo de seleccion de Low; la reconciliacion no encontro esos titulos. Los fallos anteriores de precondicion no ejecutaron escenarios ni crearon datos. No se inventan identificadores de intentos cuyo informe ya no este disponible.

No se elimino ningun registro. Antes de cualquier retirada, la persona contrasta cada GUID con su titulo exacto y contenido; ni un prefijo general ni esta consulta autorizan un borrado masivo.

## Retirada humana

Procedimiento preparado, NO ejecutado. Una persona vuelve a verificar DEV, revisa las dependencias actuales y decide cada eliminacion. Ante una dependencia compartida o un identificador distinto, detenerse.

1. Eliminar individualmente los registros sinteticos confirmados por GUID y titulo de la tabla anterior, solo si la persona decide retirar los datos. No eliminar otros registros.
2. Retirar la app `cap_RequestsPoc` (`0b268e25-6fbb-4297-ad77-f3a5c08a930f`) y sus asociaciones propias con el editor soportado. Revisar el componente tipo 10085 (`0439139a-87dc-f111-84ea-000d3a78b8ea`); si su dependencia bloquea la app, retirar primero solo esa configuracion propia, nunca la definicion AppChannel ni los roles existentes.
3. Comprobar si permanecen el mapa POC (`db96fad3-87dc-f111-84ea-000d3a78b8ea`) y la configuracion propia anterior; retirarlos solo tras confirmar que ninguna app ajena los referencia. No asumir ni provocar una cascada sobre componentes reutilizados.
4. Retirar Solicitud POC (`ae5e60e8-84dc-f111-84ea-000d3a78b8ea`) una vez que no lo referencie la app; conservar Information y toda la configuracion compartida.
5. Retirar `RequestPocForm.js` (`73cddcf1-20da-f111-84ea-000d3a78b8ea`) tras comprobar que no queda ninguna biblioteca de formulario que lo referencie.
6. Solo por decision humana, borrar el contenedor unmanaged `feature_RequestsPoc` (`664fe01f-19da-f111-84ea-000d3a78b8ea`). Borrar esta solucion NO borra sus componentes: si solo se borra el contenedor, los componentes anteriores permanecen en DEV.

Quedan excluidos la tabla y todos sus campos, All Requests y las demas vistas, Information, Internal Requests y su mapa, el icono reutilizado, los roles y definiciones de plataforma, las soluciones preexistentes y todo registro ajeno. No se entrega ni ejecuta un script de eliminacion.
