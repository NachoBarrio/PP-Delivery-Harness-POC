# Design

## Context

Motivacion: [proposal.md](proposal.md), seccion Why. Comportamiento acordado: [internal-requests](specs/internal-requests/spec.md).

Inspeccion de DEV en lectura realizada el 2026-11-05, usando la identidad de `.power-platform/project.json`. PAC confirma el entorno `SDD-Testing`; la sesion Azure usada para las consultas pertenece al tenant esperado. Las consultas de registros se hicieron con el SDK de Dataverse y las de metadatos con GET. La autenticacion Python por codigo de dispositivo no termino; se utilizo la sesion Azure existente, sin cambiar la autenticacion del proyecto ni escribir componentes.

| Elemento observado | Estado relevante |
| --- | --- |
| Tabla `cap_request` | Existente, propiedad de organizacion; conjunto `cap_requests`, clave `cap_requestid` |
| Titulo `cap_name` | Texto, obligatorio en los metadatos |
| Prioridad `cap_priority` | Opcion local obligatoria; Baja/Low = `767940000`, Media/Medium = `767940001`, Alta/High = `767940002`; valor inicial Media |
| Descripcion `cap_description` | Texto multilinea opcional en los metadatos |
| Estado `cap_requeststatus` | Opcion local obligatoria; Nuevo/New = `767940000`, En curso/In progress = `767940001`, Completado/Completed = `767940002`; valor inicial Nuevo |
| Formulario `Information` | Principal; contiene los cuatro campos, sin bibliotecas ni manejadores de eventos |
| Vista `All Requests` | Muestra titulo, prioridad, estado y fecha de creacion; orden descendente por fecha, sin filtro de propietario |
| MDA `cap_InternalRequests` | Existente; no existe `cap_RequestsPoc` |
| Soluciones | Existen `feature_InternalRequests` y `feature_WorkdayTimeTracking`; no existe `feature_RequestsPoc` |
| Publisher | `Cap`, prefijo `cap` |
| Automatismos sobre `cap_request` | No se encontraron procesos con esta tabla como entidad principal ni pasos de plugin en las etapas de extension; existen pasos internos de la plataforma |
| Configuracion reutilizable | No se encontraron variables de entorno ni referencias de conexion con prefijo `cap_`; no se necesitan nuevas |
| Seguridad | Existe el rol System Administrator; no se ha auditado su asignacion ni el licenciamiento del usuario |

La busqueda de procesos por entidad principal no demuestra ausencia de flujos genericos que accedan a la tabla; no se inspeccionaron otros componentes ni datos ajenos a la POC. No hay ADRs aceptados en la biblioteca ni especificaciones principales existentes. La estructura local ya contempla recursos JavaScript, pruebas unitarias y lint; no contiene recursos funcionales ni suite de navegador.

La comprobacion de seguridad de `docs/development/solutions.md` rechaza nombres con `test`. Por tanto, `SDD-Testing` **bloquea la creacion de la solucion y de componentes**, aunque sea la URL declarada como DEV. La planificacion no cambia esa regla ni autoriza renombrar el entorno; una persona debe resolver el conflicto por una via aprobada antes de aplicar el cambio.

No hay guias de solutioning especificas para formularios, aplicaciones o pruebas de navegador; se aplica el gate comun. El detalle de entrega se mantiene en [el contrato de entrega](docs/delivery-contract.md), no en la biblioteca fija.

## Goals / Non-Goals

**Goals:**

- Separar la experiencia POC de la aplicacion preexistente sin duplicar tabla, columnas ni vista.
- Evaluar la regla de forma sincrona con los valores actuales, sin consultas de red ni cambios de datos implicitos.
- Demostrar el resultado con el recurso realmente desplegado, datos nuevos por ejecucion y evidencia que permita distinguir fallo funcional de falta de autenticacion.

**Non-Goals:**

- No garantizar integridad frente a Web API, importaciones, otras aplicaciones o edicion de la tabla fuera del formulario POC.
- No introducir traducciones de opciones, cambios globales de formulario, nuevos permisos, infraestructura de autenticacion o automatismos de limpieza.
- No convertir la POC en una convencion general de pruebas end-to-end ni en una entrega a otros entornos.

## Decisions

### D-01. Reutilizacion y aislamiento mediante configuracion

Para Captura de solicitudes y Preservacion de componentes preexistentes se creara `cap_RequestsPoc`, nombre visible "Solicitudes POC", con una sola entrada de tabla y la vista `All Requests`. Incluira exclusivamente el nuevo formulario principal "Solicitud POC" para editar solicitudes. Se seleccionaran explicitamente los formularios de la app, sin modificar el orden global, el formulario de reserva, `Information` ni la composicion de `cap_InternalRequests`. [Microsoft documenta la seleccion de formularios por aplicacion](https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/create-and-edit-a-model-driven-form#control-which-form-is-visible-in-your-model-driven-app).

El formulario nuevo mostrara titulo, prioridad, descripcion y estado, conservando los controles y opciones existentes. Nuevo procede del valor inicial de `cap_requeststatus`, no de un segundo automatismo. Alta y Nuevo en la especificacion identifican los valores de negocio; las etiquetas inglesas existentes se conservan. No se modifican las traducciones ni las consultas compartidas.

Alternativas: usar la MDA y `Information` existentes impediria conservar su configuracion; duplicar tabla o vista no satisface ninguna necesidad adicional y aumenta la retirada.

### D-02. Una sola validacion de formulario, sincrona y local

Para Descripcion obligatoria, Descripcion opcional y Evaluacion al abrir y editar se incorporara un unico recurso JavaScript exclusivo del formulario POC. Al cargar el formulario y al cambiar prioridad o descripcion, actualizara la obligatoriedad y una notificacion de formulario propia. Alta con descripcion nula, vacia o compuesta solo por espacios produce el mensaje exacto "La descripcion es obligatoria para prioridad Alta.". El texto se examina sin modificarlo ni recortarlo al persistir.

Antes de cualquier guardado, explicito o automatico, se reevaluaran los valores y se cancelara sincronicamente la operacion invalida. No basta con una notificacion visual: el bloqueo de guardado es explicito. No se discrimina por modo de guardado. Al corregir la descripcion se retira solo la notificacion propia; mientras sea Alta, la descripcion sigue siendo obligatoria. Media y Baja retiran obligatoriedad y notificacion sin borrar texto. Se usan exclusivamente las APIs soportadas del formulario, sin modificar su DOM. [OnSave admite cancelacion sincrona y cubre AutoSave](https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/events/form-onsave).

Escalera: los campos y valores iniciales se resuelven con configuracion. Una [regla de negocio de formulario](https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/create-business-rules-recommendations-apply-logic-form) cubre obligatoriedad y mensajes, pero no cumple por si sola la evidencia exigida sobre un recurso JavaScript real. Un unico script cubre tambien los espacios en blanco y evita duplicar la regla entre codigo y configuracion. No se afirma que la validacion condicional ordinaria exija codigo.

Alternativas: regla de negocio mas script duplica responsabilidad; flujo corrige despues de persistir; plugin afectaria otros puntos de entrada y excederia el aislamiento de esta POC.

### D-03. Evidencia acotada al recurso y a dos recorridos reales

Para Evidencia reproducible se probaran los eventos publicos del recurso real y exactamente dos recorridos de navegador: Alta valida con reapertura, y Alta invalida seguida de cambio a Baja y reapertura. Las pruebas unitarias cubren ademas espacios, Media, correccion del texto, reapertura y cancelacion de guardado automatico. El detalle de herramientas y superficie publica pertenece al contrato de entrega.

La suite de navegador usara una unica sesion administradora en un perfil dedicado fuera del repositorio, titulos sinteticos unicos por escenario y ejecucion, y verificaciones de persistencia mediante la aplicacion real. En el recorrido invalido se comprobara tambien que el titulo no aparece en una segunda pagina de lista antes de cambiar a Baja; un mensaje o un formulario abierto no son evidencia suficiente de ausencia de persistencia. Al faltar autenticacion se informa un fallo de precondicion, nunca un resultado superado.

La dependencia nueva de ejecucion queda limitada a la POC en el [ADR propuesto](docs/adr/ADR-requests-poc-01-browser-test-runner.md). La trazabilidad y los criterios de evidencia siguen el enfoque de [Success by Design para estrategia de pruebas](https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/testing-strategy), sin atribuir a Microsoft soporte especifico de este runner para automatizar la MDA.

Alternativas: solo pruebas unitarias no demuestran persistencia ni despliegue; una sesion interactiva sin suite repetible no cumple reproducibilidad; un framework completo de UI o una pipeline anaden alcance innecesario.

### D-04. Limites de datos, acceso y retirada humana

Para Preservacion y Retirada se identificaran los componentes nuevos y cada registro sintetico creado, separados de las dependencias reutilizadas. No se borran registros al terminar las pruebas ni se ejecuta automaticamente la retirada. Una persona revisa identificadores y dependencias y ejecuta las eliminaciones.

Se mantiene la propiedad de organizacion de `cap_request`: esta POC no ofrece aislamiento por usuario. No hay roles nuevos ni modificaciones de roles. Solo se usa la cuenta administradora acordada y datos ficticios sin informacion personal. El acceso funcional y la licencia habilitada se verifican antes de las pruebas; el nombre del rol o una consulta exitosa no acreditan licencia. No se introducen integraciones ni conexiones. El volumen previsto es dos registros nuevos por ejecucion completa; no se hacen consultas no acotadas, pruebas de carga ni afirmaciones sobre capacidad de produccion.

Alternativas: limpieza automatica viola la retirada humana; una tabla separada para datos o configuracion no aporta un requisito; nuevos roles o pruebas multiusuario quedan fuera de alcance.

### Components contract

| Component | Type | Logical name | Behaviour | Decision |
| --- | --- | --- | --- | --- |
| Solicitudes | Tabla reutilizada | `cap_request` | Persistencia existente; sin cambios de esquema, propiedad ni valores iniciales | D-01 |
| All Requests | Vista reutilizada | No aplica; identificar por su GUID existente | Lista existente, sin cambiar consulta o columnas | D-01 |
| Solicitudes POC | MDA nueva | `cap_RequestsPoc` | Una entrada de navegacion, solo el formulario POC para edicion | D-01 |
| Navegacion POC | Mapa del sitio nuevo de la MDA | `cap_RequestsPoc` | Una unica subarea de `cap_request`; confirmar el nombre generado en el inventario | D-01 |
| Solicitud POC | Formulario principal nuevo en `cap_request` | No aplica; GUID generado por Dataverse | Cuatro campos; carga de la regla solo en este formulario | D-01, D-02 |
| Regla de prioridad POC | Recurso web JavaScript nuevo | `cap_/src/js/cap_request/RequestPocForm.js` | Evaluacion sincrona en carga, cambios y guardado; cancela el guardado invalido | D-02 |
| Evidencia de la regla | Pruebas unitarias, fuera de Dataverse | No aplica | Ejecutan el recurso real mediante sus eventos | D-03 |
| Recorridos POC | Dos pruebas de navegador, fuera de Dataverse | No aplica | Persistencia, bloqueo, recuperacion y reapertura con administrador | D-03 |
| Inventario y retirada | Documentacion de entrega | No aplica | Identifica componentes nuevos, dependencias y datos; eliminacion humana | D-04 |

El nombre del recurso de la tabla es su identificador de Dataverse, no una propuesta de estructura adicional. La retirada de cualquiera de los componentes nuevos elimina una experiencia, validacion o evidencia exigida por la especificacion; no se anaden componentes para necesidades futuras. La asignacion a soluciones sigue los estandares de desarrollo.

## Risks / Trade-offs

- [Nombre de DEV rechazado por el harness] -> No crear solucion ni componentes hasta resolverlo por una via aprobada y volver a comprobar identidad y tenant; mantener ambos gates pendientes.
- [Validacion limitada al cliente] -> Declarar explicitamente la ausencia de garantia en servidor; no extender el script a formularios ajenos.
- [DEV compartido y cambios concurrentes] -> Capturar la configuracion de dependencias antes de desplegar, compararla despues y detenerse ante diferencias no atribuibles a la POC.
- [Sesion administradora caducada o perfil de navegador ocupado] -> Perfil dedicado externo, un solo navegador de pruebas, autenticacion humana y error de precondicion; nunca guardar credenciales o cookies en Git.
- [Etiquetas y estructura de la MDA variables] -> Usar etiquetas observadas y localizadores semanticos; comprobar el formulario seleccionado, no depender de posiciones o ids DOM efimeros.
- [Pruebas fallidas dejan datos sinteticos] -> Registrar los identificadores disponibles y el identificador de ejecucion incluso en fallo; preparar limpieza humana, sin dependencia entre ejecuciones.
- [Licencia o acceso de la cuenta no comprobados] -> Confirmar acceso autorizado antes de probar; no crear licencias ni permisos como parte de este cambio.
- [Disponibilidad de herramientas de creacion] -> Usar el editor soportado o las herramientas oficiales; cuando no soporten una operacion, prepararla para el desarrollador, no fabricar metadatos ni XML nuevo.

## Migration Plan

1. Resolver fuera de este cambio el bloqueo de seguridad del entorno y comprobar de nuevo los requisitos de DEV. Revisar y aprobar ambos gates sobre el commit de planificacion; no basta con que los artefactos existan.
2. En apply, aceptar los ADRs tras los gates y seguir el procedimiento de la rama para crear la solucion de feature, antes de la primera tarea.
3. Capturar la linea base de tabla, vista, `Information` y composicion de la MDA existente. Incorporar las dependencias reutilizadas sin editar sus definiciones.
4. Implementar y verificar primero el recurso y sus pruebas; despues crear el formulario y la MDA, registrar la regla y publicar los componentes nuevos.
5. Verificar preservacion de los componentes existentes y ejecutar los dos recorridos con datos sinteticos. Completar inventario, evidencia y fuente exportada de la solucion.
6. Si el despliegue falla, detener la POC y preparar para una persona la retirada de la MDA y su navegacion, del formulario y del recurso, tras comprobar dependencias. No restaurar ni borrar definiciones compartidas. Los datos de prueba y la solucion se retiran solo por decision humana; borrar una solucion no equivale a borrar sus componentes.
