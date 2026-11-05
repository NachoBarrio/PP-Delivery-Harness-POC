# Spec Delta

## Purpose

Permitir capturar solicitudes internas en una MDA de prueba, con una descripcion obligatoria segun prioridad y resultados verificables con un unico administrador. La capacidad se limita a una POC desechable, sin evolucion posterior ni garantia de validacion en servidor.

## ADDED Requirements

### Requirement: Captura de solicitudes en la MDA

La MDA SHALL permitir al administrador crear, consultar y reabrir solicitudes desde una unica entrada de navegacion, utilizando un formulario principal con titulo, prioridad, descripcion y estado. El titulo y la prioridad SHALL ser obligatorios; el estado inicial SHALL ser Nuevo.

#### Scenario: Crear y reabrir una solicitud

- **WHEN** el administrador abre "Solicitudes POC", crea una solicitud con titulo sintetico unico, prioridad Alta y descripcion, y guarda
- **THEN** la solicitud se persiste con estado Nuevo y aparece en la lista
- **AND** al reabrirla conserva titulo, prioridad, descripcion y estado

### Requirement: Descripcion obligatoria para prioridad Alta

El formulario POC SHALL exigir una descripcion con al menos un caracter distinto de espacio cuando la prioridad sea Alta. Sin descripcion valida SHALL mostrar el mensaje "La descripcion es obligatoria para prioridad Alta." e impedir tanto el guardado explicito como el automatico.

#### Scenario: Guardado explicito sin descripcion

- **WHEN** el administrador introduce titulo y prioridad Alta, deja la descripcion vacia e intenta guardar
- **THEN** el formulario indica que la descripcion es obligatoria y muestra el mensaje de validacion
- **AND** no se crea una solicitud ni se persiste una modificacion invalida

#### Scenario: Descripcion compuesta solo por espacios

- **WHEN** una solicitud de prioridad Alta contiene una descripcion compuesta solo por espacios y se intenta guardar
- **THEN** se muestra el mismo mensaje y se impide el guardado

#### Scenario: Guardado automatico invalido

- **WHEN** el guardado automatico intenta persistir una solicitud de prioridad Alta sin descripcion valida
- **THEN** se impide la persistencia con el mismo mensaje

#### Scenario: Corregir la descripcion

- **WHEN** el administrador completa una descripcion valida en una solicitud de prioridad Alta que mostraba el mensaje
- **THEN** el mensaje desaparece y la solicitud se puede guardar
- **AND** la descripcion continua siendo obligatoria mientras la prioridad sea Alta

### Requirement: Descripcion opcional para otras prioridades

Para prioridades Media y Baja el formulario POC SHALL permitir guardar sin descripcion. Al cambiar desde Alta a una de ellas SHALL retirar la obligatoriedad y el mensaje de esta regla, sin borrar una descripcion existente.

#### Scenario: Cambiar de Alta a Baja

- **WHEN** una solicitud Alta sin descripcion muestra el mensaje y el administrador cambia la prioridad a Baja
- **THEN** la descripcion pasa a ser opcional y desaparece el mensaje
- **AND** el administrador puede guardar y reabrir la solicitud sin descripcion

#### Scenario: Cambiar de Alta a Media conservando el texto

- **WHEN** el administrador cambia a Media una solicitud Alta que contiene descripcion
- **THEN** la descripcion pasa a ser opcional y su contenido se conserva

### Requirement: Evaluacion al abrir y editar el formulario

El formulario POC SHALL aplicar la regla al abrir una solicitud y al cambiar su prioridad o descripcion. El resultado visible y el bloqueo de guardado SHALL corresponder siempre a los valores actuales, incluso cuando se reabra una solicitud ya persistida.

#### Scenario: Abrir una solicitud Alta valida

- **WHEN** el administrador reabre una solicitud Alta con descripcion valida
- **THEN** la descripcion aparece como obligatoria, no se muestra el mensaje y el guardado esta permitido

#### Scenario: Vaciar una descripcion previamente valida

- **WHEN** el administrador elimina la descripcion de una solicitud Alta
- **THEN** aparece el mensaje y un intento de guardar no modifica el registro persistido

### Requirement: Preservacion de componentes preexistentes

La POC SHALL reutilizar la tabla y la vista existentes sin alterar su esquema, consultas o registros previos. La regla SHALL ejecutarse solo en el formulario POC; la aplicacion y el formulario preexistentes SHALL conservar su configuracion y comportamiento.

#### Scenario: Abrir la aplicacion preexistente

- **WHEN** el administrador abre el formulario Information desde Internal Requests
- **THEN** ese formulario conserva sus campos y no carga la regla de prioridad de la POC

### Requirement: Evidencia reproducible con un administrador

La POC SHALL aportar pruebas unitarias del JavaScript realmente desplegado y dos escenarios de navegador repetibles sobre la MDA real. Las pruebas SHALL usar exclusivamente la sesion administradora y datos sinteticos identificados por ejecucion, sin depender de registros de una ejecucion anterior ni publicar credenciales.

#### Scenario: Verificacion del recorrido valido

- **WHEN** se ejecuta el primer escenario de navegador con una sesion administradora vigente
- **THEN** crea una solicitud Alta con descripcion, la guarda y comprueba su persistencia al reabrir

#### Scenario: Verificacion del bloqueo y recuperacion

- **WHEN** se ejecuta el segundo escenario de navegador con titulo nuevo y prioridad Alta sin descripcion
- **THEN** comprueba el mensaje y el bloqueo de persistencia
- **AND** cambia a Baja, comprueba que desaparece el mensaje, guarda y verifica el resultado al reabrir

#### Scenario: Sesion no disponible

- **WHEN** una prueba de navegador no dispone de sesion administradora vigente
- **THEN** informa que requiere autenticacion y no presenta el escenario funcional como superado

### Requirement: Retirada limitada a la POC

La POC SHALL proporcionar un inventario que distinga los componentes nuevos de las dependencias reutilizadas y los registros sinteticos creados. Toda eliminacion SHALL ser preparada para ejecucion humana y SHALL preservar la tabla, la vista, el formulario, la aplicacion y los registros preexistentes.

#### Scenario: Preparar la retirada

- **WHEN** la persona responsable decide retirar la POC
- **THEN** dispone de identificadores y orden de retirada de sus componentes nuevos y registros de prueba
- **AND** la propuesta de retirada no incluye borrar dependencias reutilizadas ni otros registros
