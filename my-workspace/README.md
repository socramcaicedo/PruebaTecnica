# Prueba Técnica – Angular Workspace

## Repositorio

Repositorio GitHub del proyecto:

```text
https://github.com/socramcaicedo/PruebaTecnica.git
```

---

# Descripción

Este proyecto corresponde a una prueba técnica desarrollada utilizando Angular moderno y arquitectura basada en componentes reutilizables.

La solución fue construida mediante un Angular Workspace compuesto por:

* **ui-lib** → librería de componentes reutilizables
* **demo-app** → aplicación demostrativa que consume la librería y la Rick and Morty API

La aplicación permite explorar diferentes recursos de la API, incluyendo personajes, episodios y ubicaciones, implementando estados de carga, filtrado, visualización de detalles y eliminación local de registros.

---

# Tecnologías utilizadas

* Angular CLI 21.2.13
* TypeScript
* Angular Standalone Components
* Angular Signals
* HttpClient
* Tailwind CSS
* ChangeDetectionStrategy.OnPush
* Git y GitHub
* Rick and Morty API

---

# Arquitectura del proyecto

El workspace se encuentra dividido en dos proyectos principales:

```text
projects/
├── demo-app/
└── ui-lib/
```

## ui-lib

Librería de componentes reutilizables.

Incluye componentes UI desacoplados y reutilizables:

* ui-button
* ui-card
* ui-select
* ui-table

Estos componentes fueron diseñados para recibir configuración mediante Inputs, emitir eventos mediante Outputs y mantener separación entre lógica y presentación.

---

## demo-app

Aplicación demostrativa encargada de:

* Consumir la Rick and Morty API
* Manejar estado reactivo mediante Signals
* Renderizar la interfaz utilizando ui-lib
* Gestionar filtros y acciones del usuario
* Mostrar modales de detalle y confirmación

---

# Requisitos previos

Antes de ejecutar el proyecto se requiere:

* Node.js
* npm
* Angular CLI

Versiones utilizadas durante el desarrollo:

```text
Angular CLI : 21.2.13
Node.js     : 24.14.0
npm         : 11.9.0
```

Verificar instalación:

```bash
node -v
npm -v
ng version
```

---

# Instalación

Clonar el repositorio:

```bash
git clone https://github.com/socramcaicedo/PruebaTecnica.git
```

Ingresar al proyecto:

```bash
cd PruebaTecnica/my-workspace
```

Instalar dependencias:

```bash
npm install
```

---

# Ejecución del proyecto

Iniciar aplicación:

```bash
ng serve
```

Abrir en navegador:

```text
http://localhost:4200
```

Si el puerto 4200 se encuentra ocupado:

```bash
ng serve --port 4201
```

---

# Compilación

Compilar demo-app:

```bash
ng build demo-app
```

Compilar la librería:

```bash
ng build ui-lib
```

Los archivos generados se almacenan en:

```text
dist/
```

---

# Flujo general de la aplicación

La aplicación utiliza un flujo reactivo basado en Angular Signals.

Proceso general:

1. Angular inicia mediante `bootstrapApplication()`.
2. App Component inyecta `ResourceState`.
3. Un `effect()` observa:

   * `resourceType`
   * `statusFilter`
4. Cuando alguno cambia, se ejecuta `fetchData()`.
5. `HttpClient` consulta la Rick and Morty API.
6. Los Signals actualizan automáticamente el estado.
7. Los componentes UI re-renderizan dinámicamente.

Estados manejados:

* Loading
* Data
* Error
* Empty State

---

# Funcionalidades implementadas

## Exploración de recursos

Permite consultar:

* Characters
* Episodes
* Locations

---

## Filtrado

Los personajes pueden filtrarse por:

* Alive
* Dead
* Unknown

---

## Loading State

Durante consultas HTTP la interfaz muestra skeleton loaders utilizando Tailwind CSS y renderizado reactivo.

---

## Error State

Cuando ocurre un error HTTP, la interfaz muestra mensajes e indicadores visuales apropiados.

---

## Empty State

Si no existen resultados disponibles, la tabla muestra un estado vacío descriptivo.

---

## Modal de detalle

Permite visualizar información detallada del recurso seleccionado.

El contenido se renderiza dinámicamente dependiendo del tipo de recurso.

---

## Eliminación local

La aplicación permite eliminar registros localmente mediante modal de confirmación y actualización reactiva del estado.

---

# API utilizada

Rick and Morty API.

Endpoints principales:

```text
/api/character
/api/episode
/api/location
```

---

# Decisiones técnicas

Se utilizó Angular Standalone API para simplificar la arquitectura y evitar módulos innecesarios.

La separación entre `ui-lib` y `demo-app` permite desacoplamiento, reutilización y mejor mantenibilidad.

El manejo de estado fue implementado mediante Angular Signals y `effect()` para lograr actualización automática de la interfaz y flujo reactivo.

La aplicación funciona mediante renderizado cliente-side estándar utilizando `ng serve`. Aunque Angular generó archivos asociados a server-side rendering, SSR no fue utilizado activamente en la implementación.

---

# Documentación adicional

El archivo:

```text
DEVELOPMENT_LOG.md
```

documenta:

* Proceso de desarrollo
* Decisiones técnicas
* Retos encontrados
* Soluciones implementadas
* Uso de herramientas de IA

---

# Autor

**Marcos Daniel Caicedo**
