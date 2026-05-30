# Prueba Tecnica - UI Component Library

**Rick & Morty Explorer** — Aplicacion construida con Angular 21 y Tailwind CSS v3 que permite explorar personajes, episodios y ubicaciones de la Rick and Morty API. El proyecto implementa una libreria de componentes UI reutilizables (`ui-lib`) y una aplicacion demostrativa (`demo-app`) que la consume.

**Autor:** Marcos Daniel Caicedo
**Repositorio:** https://github.com/socramcaicedo/PruebaTecnica.git

---

## Tecnologias

| Tecnologia | Version |
|---|---|
| Angular CLI | 21.2.13 |
| TypeScript | 5.9.2 (strict) |
| Tailwind CSS | 3.x |
| Node.js | 24.14.0 |
| npm | 11.9.0 |

---

## Arquitectura

```text
my-workspace/
├── projects/
│   ├── ui-lib/                    # Libreria de componentes UI
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── button/        # ui-button
│   │       │   ├── card/          # ui-card
│   │       │   ├── select/        # ui-select
│   │       │   └── table/         # ui-table
│   │       └── public-api.ts      # Punto de exportacion unico
│   └── demo-app/                  # App que consume la libreria
│       └── src/
│           ├── app/
│           │   ├── core/
│           │   │   ├── models/    # Interfaces (Character, Episode, Location)
│           │   │   └── services/  # ResourceState (estado centralizado con signals)
│           │   ├── app.ts         # Componente principal del Explorer
│           │   ├── app.html       # Template del Explorer
│           │   ├── app.config.ts  # Configuracion (HttpClient, Router)
│           │   └── app.routes.ts
│           └── styles.css         # Estilos globales + Tailwind + Creepster
├── angular.json
├── tailwind.config.js             # Paleta Rick & Morty personalizada
├── tsconfig.json                  # strict: true
├── package.json
├── DEVELOPMENT_LOG.md             # Bitacora de desarrollo
└── README.md
```

### Separacion de proyectos

- **ui-lib**: Libreria de componentes desacoplados con prefijo `ui-`. Publicable en npm tal como esta. La demo-app importa componentes **exclusivamente** a traves de `public-api.ts`, nunca accede a archivos internos.
- **demo-app**: Aplicacion que consume la Rick and Morty API. Todo el estado se maneja en un servicio con Angular Signals. Los componentes no hacen llamadas HTTP directas.

### Convenciones aplicadas

- **Standalone + OnPush**: Todos los componentes son standalone con `ChangeDetectionStrategy.OnPush`. Sin NgModules.
- **Signals API**: Se usa `input()`, `output()` y `model()` exclusivamente. Prohibido `@Input()` y `@Output()`.
- **Prefijo `ui-`**: Todos los selectores de la libreria usan el prefijo `ui-` (ui-button, ui-card, ui-select, ui-table).
- **Public API limpia**: Toda exportacion pasa por `public-api.ts`.
- **Tipado estricto**: `strict: true` en `tsconfig.json`. Cero uso de `any`. Generics en la tabla (`Table<T>`).
- **Sin librerias externas**: No se usa Angular Material, PrimeNG ni ninguna otra libreria UI.

---

## Instalacion y Ejecucion

### Prerrequisitos

- Node.js 18+
- npm 9+

### Instalar

```bash
git clone https://github.com/socramcaicedo/PruebaTecnica.git
cd PruebaTecnica/my-workspace
npm install
```

### Ejecutar

```bash
ng serve demo-app
```

Abrir `http://localhost:4200`

Si el puerto esta ocupado:

```bash
ng serve demo-app --port 4201
```

### Compilar

```bash
ng build demo-app    # Aplicacion
ng build ui-lib      # Libreria
```

Los archivos generados se almacenan en `dist/`.

---

## API de Componentes

### ui-button

Boton con variantes visuales, tamaños, estados disabled y loading con spinner inline.

#### Inputs

| Nombre | Tipo | Default | Descripcion |
|---|---|---|---|
| `label` | `string` | *(requerido)* | Texto visible del boton |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Estilo visual del boton |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del boton |
| `disabled` | `boolean` | `false` | Bloquea la interaccion |
| `loading` | `boolean` | `false` | Muestra spinner y bloquea el click |

#### Outputs

| Nombre | Tipo | Descripcion |
|---|---|---|
| `clicked` | `void` | Emite solo si no esta disabled ni loading |

#### Ejemplo de uso

```html
<ui-button
  label="Guardar"
  variant="primary"
  size="md"
  (clicked)="onSave()" />

<ui-button
  label="Cargando..."
  variant="secondary"
  size="sm"
  [loading]="true" />

<ui-button
  label="Eliminar"
  variant="danger"
  size="lg"
  [disabled]="!canDelete()"
  (clicked)="onDelete()" />
```

---

### ui-card

Tarjeta con header clickeable, elevaciones y proyeccion de contenido.

#### Inputs

| Nombre | Tipo | Default | Descripcion |
|---|---|---|---|
| `title` | `string` | *(requerido)* | Titulo del header de la card |
| `subtitle` | `string \| null` | `null` | Subtitulo opcional bajo el titulo |
| `elevation` | `'flat' \| 'raised' \| 'outlined'` | `'raised'` | Estilo visual del contenedor |

#### Outputs

| Nombre | Tipo | Descripcion |
|---|---|---|
| `headerClicked` | `void` | Emite al hacer clic en el header |

#### Proyeccion de contenido

El body de la card acepta contenido arbitrario via `ng-content`.

#### Ejemplo de uso

```html
<ui-card
  title="Rick Sanchez"
  subtitle="Character"
  elevation="raised"
  (headerClicked)="onHeaderClick()">

  <p>Contenido proyectado en el body de la card.</p>

</ui-card>
```

---

### ui-select

Select con two-way binding, skeleton loading y evento de cambio.

#### Interfaces

```typescript
interface SelectOption {
  label: string;
  value: string;
}
```

#### Inputs

| Nombre | Tipo | Default | Descripcion |
|---|---|---|---|
| `options` | `SelectOption[]` | *(requerido)* | Lista de opciones `{ label, value }` |
| `label` | `string` | *(requerido)* | Etiqueta visible sobre el select |
| `placeholder` | `string` | `'Seleccionar...'` | Texto cuando no hay seleccion |
| `loading` | `boolean` | `false` | Estado de carga (skeleton) |
| `disabled` | `boolean` | `false` | Bloquea la interaccion |

#### Model (two-way binding)

| Nombre | Tipo | Default | Descripcion |
|---|---|---|---|
| `value` | `string \| null` | `null` | Two-way binding del valor seleccionado |

#### Outputs

| Nombre | Tipo | Descripcion |
|---|---|---|
| `selectionChange` | `SelectOption` | Emite el objeto completo al cambiar la seleccion |

#### Ejemplo de uso

```html
<ui-select
  [options]="resourceOptions"
  label="Recurso"
  placeholder="Seleccionar recurso..."
  [value]="selectedResource()"
  (selectionChange)="onResourceChange($event)" />
```

```typescript
resourceOptions: SelectOption[] = [
  { label: 'Characters', value: 'character' },
  { label: 'Episodes', value: 'episode' },
  { label: 'Locations', value: 'location' },
];

onResourceChange(option: SelectOption): void {
  this.state.setResource(option.value as ResourceType);
}
```

---

### ui-table

Tabla generica con skeleton loading, empty state, error state y acciones por fila.

#### Interfaces

```typescript
interface TableColumn {
  key: string;
  header: string;
}

interface TableAction<T> {
  action: 'view' | 'delete';
  row: T;
}
```

#### Inputs

| Nombre | Tipo | Default | Descripcion |
|---|---|---|---|
| `columns` | `TableColumn[]` | *(requerido)* | Definicion de columnas `{ key, header }` |
| `rows` | `T[]` | *(requerido)* | Datos a renderizar (generico) |
| `loading` | `boolean` | `false` | Muestra skeleton rows en lugar de datos |
| `emptyMessage` | `string` | `'No hay datos disponibles'` | Mensaje cuando `rows` esta vacio |
| `errorMessage` | `string \| null` | `null` | Mensaje de error de red visible en la tabla |

#### Outputs

| Nombre | Tipo | Descripcion |
|---|---|---|
| `actionTriggered` | `TableAction<T>` | Emite `{ action: 'view' \| 'delete', row: T }` |

La tabla es generica — no conoce el dominio de los datos. Solo renderiza columnas y emite acciones. El componente padre es responsable de interpretar cada accion recibida.

#### Ejemplo de uso

```html
<ui-table
  [columns]="columns()"
  [rows]="state.rows()"
  [loading]="state.loading()"
  emptyMessage="No se encontraron resultados en esta dimension."
  [errorMessage]="state.error()"
  (actionTriggered)="onTableAction($event)" />
```

```typescript
columns = computed<TableColumn[]>(() => {
  switch (this.state.resourceType()) {
    case 'character':
      return [
        { key: 'name', header: 'Nombre' },
        { key: 'status', header: 'Estado' },
        { key: 'species', header: 'Especie' },
        { key: 'gender', header: 'Genero' },
      ];
    case 'episode':
      return [
        { key: 'name', header: 'Nombre' },
        { key: 'air_date', header: 'Fecha emision' },
        { key: 'episode', header: 'Codigo' },
      ];
    case 'location':
      return [
        { key: 'name', header: 'Nombre' },
        { key: 'type', header: 'Tipo' },
        { key: 'dimension', header: 'Dimension' },
      ];
  }
});

onTableAction(action: TableAction<Resource>): void {
  if (action.action === 'view') this.state.selectRow(action.row);
  if (action.action === 'delete') this.pendingDelete.set(action.row);
}
```

---

## Flujo de la Aplicacion

1. Angular inicia mediante `bootstrapApplication()`.
2. App Component inyecta `ResourceState`.
3. Un `effect()` observa `resourceType` y `statusFilter`.
4. Cuando alguno cambia, se ejecuta `fetchData()` que consulta la Rick and Morty API via `HttpClient`.
5. Los Signals actualizan el estado automaticamente.
6. Los componentes UI re-renderizan de forma reactiva.

### Estados manejados

| Estado | Comportamiento |
|---|---|
| **Loading** | Skeleton rows con `animate-pulse` de Tailwind |
| **Data** | Tabla con datos del recurso activo y columnas dinamicas |
| **Error** | Icono SVG y mensaje descriptivo |
| **Empty** | Icono SVG y mensaje "No se encontraron resultados en esta dimension." |

### Selects de recurso y filtro

- **Select de Recurso**: Cambia entre Characters, Episodes y Locations. Al cambiar, resetea el filtro de status y dispara una nueva peticion.
- **Select de Filtro (Status)**: Filtra por Alive, Dead, Unknown. Solo se aplica el parametro `status` cuando el recurso es `character` (la API no lo soporta en episodes/locations).

### Modal de detalle

Al hacer clic en **Ver**, se abre un modal con `ui-card` mostrando todos los campos del registro. El contenido varia segun el tipo de recurso. Characters incluyen imagen circular. Se cierra al hacer clic en el boton Cerrar o fuera del modal.

### Eliminacion

Al hacer clic en **Eliminar**, se abre un modal de confirmacion con `ui-card`. Al confirmar, se remueve el registro del array local. No se hace DELETE a la API.

---

## Modelos de la API

```typescript
interface ApiResponse<T> {
  info: { count: number; pages: number; next: string | null; prev: string | null };
  results: T[];
}

interface Character {
  id: number; name: string; status: string; species: string;
  type: string; gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string; episode: string[]; url: string; created: string;
}

interface Episode {
  id: number; name: string; air_date: string; episode: string;
  characters: string[]; url: string; created: string;
}

interface Location {
  id: number; name: string; type: string; dimension: string;
  residents: string[]; url: string; created: string;
}

type ResourceType = 'character' | 'episode' | 'location';
type Resource = Character | Episode | Location;
```

API: `https://rickandmortyapi.com/api`

| Endpoint | Descripcion |
|---|---|
| `/api/character` | Personajes (soporta filtro `?status=alive\|dead\|unknown`) |
| `/api/episode` | Episodios |
| `/api/location` | Ubicaciones |

---

## Paleta de Colores (Tema Rick & Morty)

Definida en `tailwind.config.js`:

| Token | Valor | Uso |
|---|---|---|
| `rick-green` | `#39FF14` | Verde portal neon, acento principal |
| `rick-portal` | `#11E0AA` | Verde azulado, acento secundario |
| `dimension-bg` | `#0D1117` | Fondo principal oscuro |
| `dimension-card` | `#161B22` | Fondo de tarjetas |
| `dimension-border` | `#30363D` | Bordes sutiles |
| `dimension-hover` | `#1C2333` | Fondo hover en filas |

- **Fuente Creepster** de Google Fonts solo para el titulo principal. El resto usa `system-ui`.
- **Efecto glow neon**: clase utilitaria `.text-glow-green` con `text-shadow`.
- **Scrollbar personalizado** con colores del tema.
- **Animacion fade-in** para modales (opacity + translateY + scale).

---

## Decisiones de Diseno

- **Angular 21** en vez de 17+: La prueba exige Angular 17+ como minimo. Se opto por la version 21 para tener acceso completo a la Signals API sin configuraciones extras y garantizar soporte a largo plazo.
- **Tailwind CSS v3**: La prueba lo especifica directamente. La v4 tiene cambios breaking en configuracion que habrian generado inconsistencias.
- **Signals API exclusivamente**: No se usan `@Input()` ni `@Output()`. Todo se maneja con `input()`, `output()` y `model()`. El codigo es mas reactivo, mas limpio y consistente con Angular 17+.
- **Estado centralizado en ResourceState**: Todo el estado (resourceType, statusFilter, rows, loading, error, selectedRow) vive en un servicio con signals. Los componentes no hacen llamadas HTTP. Un `effect()` reacciona automaticamente cuando cambia el recurso o el filtro.
- **Tabla generica sin conocimiento del dominio**: `ui-table` es generica (`Table<T>`) y no sabe nada de Character, Episode ni Location. Solo recibe columnas y filas, renderiza y emite acciones.
- **Paleta propia en tailwind.config.js**: Dos namespaces (`rick` y `dimension`) con valores hex ajustados manualmente para asegurar contraste y legibilidad sobre fondo oscuro. Sin assets con derechos de autor.
- **Sin librerias externas**: Todo construido desde cero con Tailwind CSS como exige la prueba.
- **Tipado estricto**: `strict: true` en tsconfig, sin uso de `any`. La tabla usa generics `Table<T>` y `Record<string, unknown>` para acceso dinamico a propiedades.
- **Eliminacion local**: El boton Eliminar remueve el registro del array local. No hace DELETE a la API (opcional segun la prueba).
- **provideHttpClient()** en vez de `HttpClientModule`: Forma moderna en Angular standalone.

---

## Documentacion Adicional

- **DEVELOPMENT_LOG.md** — Bitacora de desarrollo completa con sesiones de trabajo, prompts usados con IA, decisiones tecnicas paso a paso, errores corregidos y codigo relevante generado en cada sesion.

---

## Autor

**Marcos Daniel Caicedo**
