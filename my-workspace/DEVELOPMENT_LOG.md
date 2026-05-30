# Bitácora de Desarrollo — DEVELOPMENT_LOG

## Proyecto: UI Component Library — Angular + TypeScript

**Autor:** Marcos Daniel Caicedo
**Fecha de inicio:** 2026-05-27
**Plazo de entrega:** 4 días

---

## Decisiones de Arquitectura

Desde el inicio se tomaron decisiones que definieron la forma en que está construido el proyecto. Surgieron de leer los requisitos de la prueba y elegir el enfoque más adecuado para cada aspecto.

### Framework y configuración base

**Angular 21.** La prueba exigía Angular 17+ como mínimo, pero se optó por la versión 21 (la más reciente al momento). Esto dio acceso directo a la Signals API completa sin configuraciones extras y garantiza soporte a largo plazo.

**Tailwind CSS v3.** Se forzó la instalación de la versión 3 porque la prueba lo especifica directamente. La versión 4 tiene cambios breaking en configuración que habrían generado inconsistencias.

**Tipado estricto.** Se activó `strict: true` en `tsconfig.json` y se eliminó cualquier uso de `any`. Cada recurso de la API tiene su interfaz propia (Character, Episode, Location) y la tabla usa generics de TypeScript.

### Estructura y separación del proyecto

**Dos proyectos aislados.** El workspace tiene `ui-lib` (librería) y `demo-app` (aplicación) completamente separados. La demo-app importa componentes de ui-lib **solo a través de `public-api.ts`**, nunca accede a archivos internos. La librería se podría publicar en npm tal como está.

**Sin librerías externas.** No se usó Angular Material, PrimeNG ni ninguna otra librería UI. La prueba exige construir todo desde cero con Tailwind CSS.

**Prefijo `ui-` consistente.** Todos los selectores de la librería usan `ui-` (ui-button, ui-card, ui-select, ui-table). Es la convención de Angular para librerías propias y evita colisiones con componentes de terceros.

### Convenciones de Angular modernas

**Standalone + OnPush.** Se descartó el uso de NgModules. Todos los componentes son standalone con `ChangeDetectionStrategy.OnPush`. Esto eliminó archivos innecesarios y mejoró el rendimiento.

**Signals API exclusivamente.** No se usaron `@Input()` ni `@Output()`. Todo se maneja con `input()`, `output()` y `model()`. El código quedó más reactivo, más limpio y consistente con Angular 17+.

### Estado y lógica de negocio

**Estado centralizado en `ResourceState`.** Todo el estado del flujo (recurso activo, filtro, datos, loading, error, fila seleccionada) vive en un servicio con signals. Los componentes no hacen llamadas HTTP. El `effect()` del servicio reacciona automáticamente cuando cambia el recurso o el filtro, y los componentes solo se encargan de presentar la información.

**Tabla genérica sin conocimiento del dominio.** `ui-table` es genérica (`Table<T>`) y no sabe nada de Character, Episode ni Location. Solo recibe columnas y filas, renderiza y emite acciones. El componente padre decide qué mostrar y cómo manejar cada acción.

**Filtro de status solo para Characters.** El select de filtro (Alive/Dead/Unknown) está siempre visible, pero la lógica del servicio solo agrega el parámetro `status` cuando el recurso activo es `character`. La API no lo soporta en episodes ni locations, así que se maneja de forma transparente.

**Eliminación local.** El botón Eliminar remueve el registro del array local con `removeRow()`. No hace DELETE a la API porque la prueba indica que es opcional. Lo importante es que `actionTriggered` emita correctamente la acción `'delete'` con el registro.

### Diseño visual

**Paleta Rick & Morty personalizada.** Se definió una paleta propia en `tailwind.config.js` con dos grupos: `rick` (verdes portal y azulado) y `dimension` (fondo oscuro, tarjetas, bordes, hover). Evoca el multiverso oscuro con acentos del portal verde, sin usar imágenes con derechos de autor. Los valores hex se ajustaron manualmente para asegurar contraste y legibilidad.

**Fuente Creepster solo en el título.** Se importó Creepster de Google Fonts exclusivamente para el h1 principal. El resto de la app usa una fuente system-ui. Creepster evoca la serie pero no es legible en textos largos, así que se reservó solo para el header.

---

## Retos y Soluciones

Durante el desarrollo se enfrentaron varios bloqueos y desafíos técnicos que requerían entender conceptos nuevos antes de poder implementarlos correctamente. A continuación se describen los principales y cómo se resolvieron.

---

### 1. Aprendizaje de Angular 21 y Signals API

**Reto:** Angular 21 usa APIs modernas que difieren completamente de versiones anteriores. La prueba exige usar `input()`, `output()` y `model()` en vez de los decoradores tradicionales `@Input()` y `@Output()`. También exige componentes standalone con `ChangeDetectionStrategy.OnPush`, sin NgModules. Ninguno de estos conceptos era familiar al inicio del proyecto.

**Solución:** Se investigó la documentación oficial de Angular y recursos de apoyo sugeridos en el PDF. Se aprendió que:
- `input()` crea una signal reactiva que se puede leer como función (`label()`) y que Angular rastrea automáticamente.
- `output()` reemplaza a `EventEmitter` y se conecta con `(clicked)` en el template.
- `model()` permite two-way binding nativo con signals, reemplazando `@Input()` + `@Output()` + `EventEmitter`.
- Los componentes standalone eliminan la necesidad de NgModules y simplifican la estructura.

El mayor error repetido fue que la IA generaba código con decoradores `@Input()`/`@Output()` por defecto. Cada vez se identificaba y se reescribía manualmente con la Signals API. Esto obligó a entender profundamente cada signal en vez de solo copiar código.

---

### 2. Tailwind CSS v3 vs v4

**Reto:** La prueba exige específicamente Tailwind CSS v3. Sin embargo, al instalar `tailwindcss` sin versión, npm instala la v4 por defecto, que tiene cambios breaking en la configuración (`@config` ya no existe, el archivo `tailwind.config.js` se reemplaza por CSS, los content paths cambian). Esto causó errores de estilos que no se aplicaban.

**Solución:** Se forzó la instalación con `npm install -D tailwindcss@3` y se verificó la versión con `npx tailwindcss --help`. Se configuró `.postcssrc.json` manualmente porque Angular 21 lo requiere para integrar Tailwind. Los content paths se definieron para cubrir tanto `demo-app` como `ui-lib`. Cada vez que se aplicaban estilos y no funcionaban, se verificaba que las clases estuvieran dentro de los content paths.

---

### 3. Organización del workspace y separación de proyectos

**Reto:** La prueba exige dos proyectos completamente aislados dentro de un mismo workspace: `ui-lib` (librería) y `demo-app` (aplicación). La demo-app debe importar componentes **solo a través de `public-api.ts`**, nunca directamente a archivos internos de la librería. Además, cada componente necesita su propia carpeta con `.ts`, `.html`, `.css` y `.spec.ts`, todos con prefijo `ui-`.

**Solución:** Se usó `--create-application=false` al crear el workspace para que quedara limpio. Luego se generó la librería con `--prefix=ui` y la app demo por separado. Se creó la carpeta `core/` con `models/` y `services/` dentro de demo-app. Se verificó que todas las importaciones pasaran por `public-api.ts` y que ningún archivo de demo-app accediera a rutas internas de ui-lib. La estructura final quedó limpia y la librería se podría publicar en npm tal como está.

---

### 4. Tipado estricto sin `any`

**Reto:** La prueba exige `strict: true` en `tsconfig.json` y cero uso de `any`. Esto fue un desafío constante porque la IA generaba código con `any` por defecto, especialmente en la tabla genérica donde se accede dinámicamente a propiedades de objetos desconocidos.

**Solución:** Se usó `Record<string, unknown>` como tipo intermedio para acceder a propiedades dinámicas sin violar strict mode. La tabla se hizo genérica con `Table<T>` usando generics de TypeScript. Se definieron interfaces claras para `Character`, `Episode`, `Location`, `SelectOption`, `TableColumn` y `TableAction`. Cada vez que aparecía un `any`, se reescribía con el tipo correcto. Esto obligó a entender el sistema de tipos de TypeScript a fondo.

---

### 5. Integración de todos los componentes en un flujo cohesivo

**Reto:** La prueba exige que los 4 componentes (button, card, select, table) trabajen juntos en un flujo completo: dos selects que controlan recurso y filtro, una tabla que reacciona a los cambios con estados de loading/empty/error, un modal de detalle con `ui-card` que cambia según el recurso, y un modal de confirmación de eliminación. Todo conectado con un servicio centralizado con signals.

**Solución:** Se construyó el `ResourceState` como servicio único con signals para cada estado (`resourceType`, `statusFilter`, `rows`, `loading`, `error`, `selectedRow`). Un `effect()` observa los cambios y dispara `fetchData()` automáticamente. Los componentes solo se encargan de presentar la información. El `computed()` genera columnas dinámicas según el recurso activo. Los modales usan `ui-card` con `ng-content` para proyectar contenido diferente según el tipo de registro. La clave fue conectar todo paso a paso, verificando que cada componente funcionara antes de integrar el siguiente.

---

### 6. Diseño visual Rick & Morty sin assets externos

**Reto:** La prueba exige que el diseño evoque el universo de Rick and Morty sin usar imágenes o assets con derechos de autor. Esto significaba lograr la atmósfera solo con colores, tipografía y estilos CSS.

**Solución:** Se investigó la paleta de colores característica de la serie (verde portal neón, fondo oscuro espacial) y se definió una paleta propia en `tailwind.config.js` con dos namespaces: `rick` (verdes neón) y `dimension` (tonos oscuros). Se importó la fuente Creepster de Google Fonts solo para el título. Se creó una clase utilitaria `.text-glow-green` con `text-shadow` para el efecto de brillo portal. Se personalizó el scrollbar y se agregaron animaciones fade-in para los modales. El resultado evoca la serie con solo CSS.

---

### Sesión 1 — Instalación y configuración del workspace

**Contexto:** Se proporcionó el PDF de la prueba técnica como contexto a la IA en cada prompt para que siempre tuviera los requisitos completos. En cada paso se le pidió que explicara qué entendió y cómo lo iba a hacer antes de generar código.

---

**Prompt 1 — Evaluación inicial:**
> "Lee este PDF (prueba-tecnica-frontend.pdf). Dime qué entendiste de los requisitos, qué tecnologías necesito instalar y en qué orden. No generes código aún, solo dime el plan."

**Qué respondió la IA:**
- Identificó las 4 tecnologías base: Angular CLI, TypeScript, Tailwind CSS v3, Rick and Morty API
- Sugirió el orden de instalación: Node.js → Angular CLI → crear workspace → Tailwind
- Detectó que la prueba exige Angular 17+ minimum

**Qué se aceptó:** El orden de instalación era correcto.
**Qué se modificó:** Se optó por instalar Angular 21 (la versión más reciente al momento de desarrollo) en vez de 17.

---

**Prompt 2 — Instalación de Angular CLI:**
> "Dime cómo instalar Angular CLI en su última versión y cómo verificar que se instaló correctamente."

**Proceso seguido:**
```bash
npm install -g @angular/cli@latest
ng version
```

**Qué se aceptó:** El comando de instalación global.
**Qué se modificó:** La IA sugería usar `npx` pero se prefirió instalación global para usar `ng` directamente.

---

**Prompt 3 — Creación del workspace:**
> "Con el contexto del PDF, dime cómo crear un Angular workspace con dos proyectos internos: una librería llamada ui-lib y una aplicación llamada demo-app. Dime qué entendiste y cómo lo vas a hacer paso a paso."

**Qué respondió la IA:**
1. Crear el workspace base con `ng new`
2. Generar la librería dentro con `ng generate library ui-lib`
3. Generar la app demo con `ng generate application demo-app`

**Proceso seguido:**
```bash
ng new my-workspace --create-application=false
cd my-workspace
ng generate library ui-lib --prefix=ui
ng generate application demo-app --prefix=app
```

**Qué se aceptó:**
- El flag `--create-application=false` para workspace limpio.
- El flag `--prefix=ui` para la librería (coincide con lo que pide la prueba).

**Qué se rechazó/modificó:**
- La IA no mencionaba los prefixes personalizados. Se agregaron manualmente.
- Sugería crear el workspace con routing y stylesheet preconfigurado. Se hizo minimal para configurar Tailwind después.

---

**Prompt 4 — Armado de la jerarquía de carpetas:**
> "Con base en el PDF, dime cómo debe quedar la estructura de carpetas del workspace. Dime qué carpetas existen, qué va dentro de cada una y para qué sirve. Luego dime cómo crear las carpetas que falten dentro de ui-lib para los 4 componentes."

**Qué respondió la IA:**

Estructura esperada:
```
my-workspace/
├── projects/
│   ├── ui-lib/
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── button/
│   │       │   │   ├── button.ts
│   │       │   │   ├── button.html
│   │       │   │   ├── button.css
│   │       │   │   └── button.spec.ts
│   │       │   ├── card/
│   │       │   ├── select/
│   │       │   └── table/
│   │       └── public-api.ts
│   └── demo-app/
│       └── src/
│           └── app/
│               ├── core/
│               │   ├── models/
│               │   └── services/
│               ├── app.ts
│               ├── app.html
│               └── app.css
├── angular.json
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Qué se aceptó:**
- La separación clara entre ui-lib y demo-app.
- La carpeta `lib/` dentro de ui-lib con subcarpetas por componente.
- La carpeta `core/` en demo-app con `models/` y `services/`.
- El archivo `public-api.ts` como punto de exportación de la librería.

**Qué se rechazó/modificó:**
- La IA no mencionaba que cada componente debía ser standalone. Se verificó que los componentes generados incluyeran `standalone: true` (Angular 21 lo genera por defecto).
- Sugería un archivo `styles.css` global en demo-app pero no explicaba qué poner. Se dejó para la sesión de diseño visual.

---

**Prompt 5 — Instalación de Tailwind CSS v3:**
> "Ahora dime cómo instalar y configurar Tailwind CSS v3 en este workspace. Específicamente v3, NO v4. Dime qué archivos necesito crear y qué va en cada uno."

**Proceso seguido:**
```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init
```

**Archivos creados/configurados:**

`tailwind.config.js` — content paths para ambos proyectos:
```js
content: [
  "./projects/demo-app/src/**/*.{html,ts}",
  "./projects/ui-lib/src/lib/**/*.{html,ts}"
]
```

`.postcssrc.json` — configuración PostCSS:
```json
{
  "plugins": {
    "tailwindcss": {},
    "autoprefixer": {}
  }
}
```

`projects/demo-app/src/styles.css` — directivas Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Qué se aceptó:**
- Los content paths que cubren tanto demo-app como ui-lib.
- La configuración de PostCSS.

**Qué se rechazó/modificó:**
- La IA intentó instalar Tailwind v4 por defecto (`npm install tailwindcss` sin versión). Se forzó `tailwindcss@3` como exige la prueba.
- No generaba `.postcssrc.json`. Se creó manualmente porque Angular 21 lo requiere para integrar Tailwind.
- Sugería usar `@tailwind` directives en cada componente. Se usó solo en `styles.css` global como es la convención.

---

**Prompt 6 — Verificación de la configuración:**
> "Verifica que la configuración está completa: tsconfig con strict: true, angular.json con ambos proyectos, tailwind configurado. Dime si falta algo."

**Qué se verificó:**
- `tsconfig.json` → `strict: true` presente
- `angular.json` → ui-lib (library) y demo-app (application) configurados
- `tsconfig.json` paths → `"ui-lib": ["./projects/ui-lib/src/public-api.ts"]`
- Tailwind v3 instalado con content paths correctos
- `.postcssrc.json` presente

**Resultado:** Configuración completa y verificada. Se procedió a la creación de componentes en las sesiones siguientes.

---

**Resumen del enfoque usado en esta sesión:**

En cada prompt se le pidió a la IA que primero explicara **qué entendió** y **cómo lo iba a hacer** antes de generar código. El PDF se incluyó como contexto en cada interacción para asegurar que las respuestas cumplieran con los requisitos de la prueba. Yo decidí qué aceptar, qué modificar y qué rechazar en cada paso.

---

### Sesión 2 — Componentes de la librería (ui-button, ui-table) y servicio ResourceState

**Contexto:** En esta sesión se construyeron los componentes principales de la librería y el servicio de estado. Se continuó con la misma metodología: proporcionar el PDF como contexto y pedir a la IA que explicara qué entendió y cómo lo iba a hacer antes de generar código.

---

**Prompt 1 — Componente ui-button:**
> "Con el contexto del PDF, dime qué entendiste del componente Button y cómo lo vas a implementar. Debe ser standalone con OnPush, usar input()/output() signals, tener variantes primary/secondary/danger, tamaños sm/md/lg, estados disabled y loading con spinner inline. No generes código aún, dime qué entiendes y cómo lo vas a hacer."

**Qué respondió la IA:**
- Componente standalone con `ChangeDetectionStrategy.OnPush`
- Inputs: `label` (string), `variant` (primary/secondary/danger), `size` (sm/md/lg), `disabled` (boolean), `loading` (boolean)
- Output: `clicked` que solo emite si no está disabled ni loading
- Usar `computed()` para armar las clases CSS dinámicamente según variante y tamaño
- Cuando `loading` es true, mostrar un spinner SVG inline y bloquear el click

**Qué se aceptó:**
- La estructura del componente con `input()` signals en vez de `@Input()`.
- La lógica de `onClick()` que solo emite si no está disabled ni loading.
- El uso de `computed()` para generar las clases CSS dinámicamente.

**Qué se rechazó/modificó:**
- La IA generó el componente usando `@Input()` y `@Output()` decoradores. Se reescribió completamente con `input()`/`output()` signals como exige la prueba.
- Las clases CSS no seguían el tema Rick & Morty. Se reescribieron con los colores personalizados del `tailwind.config.js` (rick-green, dimension-bg, dimension-border).
- El spinner SVG generado era muy grande. Se ajustó a tamaño inline (`h-4 w-4`).

**Código generado:**

`button.ts`:
```typescript
const VARIANTS: Record<string, string> = {
  primary: 'bg-rick-green text-dimension-bg hover:brightness-110 hover:shadow-[0_0_12px_#39FF1480] focus:ring-rick-green/60 active:brightness-90',
  secondary: 'bg-dimension-card text-gray-200 border border-dimension-border hover:border-rick-green/40 hover:text-rick-green focus:ring-rick-green/40 active:bg-dimension-hover',
  danger: 'bg-red-900/60 text-red-300 border border-red-800/60 hover:bg-red-800/70 hover:text-red-200 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] focus:ring-red-500/50 active:bg-red-900/80',
};

const SIZES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};
```

---

**Prompt 2 — Componente ui-card:**
> "Con el contexto del PDF, dime qué entendiste del componente Card y cómo lo vas a hacer. Debe tener title, subtitle opcional, elevation (flat/raised/outlined), headerClicked output y ng-content para proyectar contenido en el body."

**Qué respondió la IA:**
- Componente standalone con OnPush
- Inputs: `title` (string requerido), `subtitle` (string | null), `elevation` (flat/raised/outlined)
- Output: `headerClicked` que emite al hacer clic en el header
- `ng-content` para proyectar contenido arbitrario en el body
- `computed()` para las clases de elevación dinámicas

**Qué se aceptó:**
- Las tres elevaciones con estilos visualmente distintos usando clases Tailwind.
- El `computed()` para generar las clases del contenedor dinámicamente.
- La proyección de contenido con `<ng-content />` en el body.

**Qué se rechazó/modificó:**
- La IA sugería usar `@ContentChild` para proyectar contenido. No era necesario, `ng-content` es suficiente para este caso.
- El borde del header no se veía bien con el tema oscuro. Se ajustó a `border-dimension-border`.

---

**Prompt 3 — Componente ui-select:**
> "Con el contexto del PDF, dime qué entendiste del componente Select y cómo lo vas a implementar. Debe usar model() para two-way binding, options con SelectOption, loading skeleton, disabled y selectionChange output."

**Qué respondió la IA:**
- Componente standalone con OnPush
- Inputs: `options` (SelectOption[]), `label` (string), `placeholder` (string), `loading` (boolean), `disabled` (boolean)
- `model()` para two-way binding del valor seleccionado
- Output: `selectionChange` que emite el objeto completo `SelectOption` al cambiar
- Skeleton loading con `animate-pulse` cuando loading es true

**Qué se aceptó:**
- El uso de `model()` para two-way binding del valor seleccionado.
- El skeleton loading con `animate-pulse` de Tailwind cuando `loading()` es true.
- La interfaz `SelectOption` con `label` y `value`.

**Qué se rechazó/modificó:**
- La IA usaba `@Input()` y `@Output()` con `EventEmitter`. Se reemplazó con `input()`, `model()` y `output()` signals.
- El evento `change` del select nativo no sincronizaba con el `model()`. Se agregó `this.value.set()` en el método `onChange()` para mantener la sincronización.
- No incluía la opción de placeholder disabled. Se agregó `<option value="" disabled>`.

---

**Prompt 4 — Componente ui-table genérico:**
> "Con el contexto del PDF, dime qué entendiste del componente Table y cómo lo vas a hacer. Debe ser genérico con T[], tener skeleton loading, empty state, error state, y output actionTriggered con tipo TableAction<T>. Dime qué entiendes y cómo lo vas a hacer."

**Qué respondió la IA:**
- Componente genérico `Table<T>` con `input.required()` para columns y rows
- Inputs: `columns` (TableColumn[]), `rows` (T[]), `loading` (boolean), `emptyMessage` (string), `errorMessage` (string | null)
- Output: `actionTriggered` que emite `TableAction<T>` con action ('view' | 'delete') y row
- Tres estados visuales: skeleton loading, empty state, error state
- Interfaz `TableColumn` con key y header

**Qué se aceptó:**
- La estructura genérica `Table<T>` con `input.required()` para columns y rows.
- Los tres estados: loading (skeleton rows), empty y error con íconos SVG.
- La interfaz `TableAction<T>` con action y row.
- El `@for` con `$index` para trackear las filas.

**Qué se rechazó/modificó:**
- La IA tipaba rows como `any[]`. Se corrigió a `T[]` con generics de TypeScript.
- El `getCellValue` usaba `any`. Se reescribió con `Record<string, unknown>` para respetar strict mode sin usar `any`.
- No tenía la columna de acciones. Se agregó manualmente con botones "Ver" y "Eliminar".
- No incluía la interfaz `TableColumn`. Se creó con `{ key: string, header: string }`.

**Código generado:**

`table.ts` — método para acceder a celdas sin `any`:
```typescript
getCellValue(row: T, key: string): string {
  const value = (row as Record<string, unknown>)[key];
  if (value == null) return '';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return String(obj['name'] ?? '');
  }
  return String(value);
}
```

---

**Prompt 5 — Exportación en public-api.ts:**
> "Con el contexto del PDF, dime cómo debe quedar el archivo public-api.ts para exportar todos los componentes de la librería. La demo app no debe hacer importaciones internas directas."

**Qué respondió la IA:**
- Exportar cada componente desde su archivo
- Exportar también los tipos/interfaces que los componentes exponen (SelectOption, TableColumn, TableAction)

**Qué se aceptó:**
- La estructura de exports individuales por componente.
- La exportación de tipos con `export type` para SelectOption, TableColumn, TableAction.

**Qué se rechazó/modificó:**
- La IA no incluía la exportación de tipos. Se agregó manualmente para que la demo app pueda importarlos.

---

**Prompt 6 — Modelos de la Rick and Morty API:**
> "Con el contexto del PDF, dime qué modelos necesito para tipar las respuestas de la Rick and Morty API. Necesito interfaces para Character, Episode y Location con todos sus campos. Dime qué entiendes y qué campos tiene cada uno."

**Qué respondió la IA:**
- Interface `Character` con id, name, status, species, type, gender, origin, location, image, episode, url, created
- Interface `Episode` con id, name, air_date, episode, characters, url, created
- Interface `Location` con id, name, type, dimension, residents, url, created
- Interface genérica `ApiResponse<T>` con info (count, pages, next, prev) y results
- Tipos auxiliares: `ResourceType` y `Resource` union type

**Qué se aceptó:**
- Los modelos Character, Episode y Location con todos los campos que usa la app.
- El tipo `ApiResponse<T>` genérico para tipar la respuesta paginada.
- Los tipos `ResourceType` y `Resource` union type.

**Qué se rechazó/modificó:**
- La IA no incluía el tipo `ApiResponse<T>`. Se creó manualmente para tipar correctamente la respuesta.
- No definía `ResourceType` ni `Resource`. Se agregaron manualmente.

---

**Prompt 7 — Servicio ResourceState con signals:**
> "Con el contexto del PDF, dime qué entendiste del flujo principal. Necesito un servicio con signals que maneje resourceType, statusFilter, rows, loading, error y selectedRow. Los componentes no deben hacer llamadas HTTP directas. Dime qué entiendes y cómo lo vas a hacer."

**Qué respondió la IA:**
- Servicio `ResourceState` inyectable con `providedIn: 'root'`
- Signals: `resourceType`, `statusFilter`, `rows`, `loading`, `error`, `selectedRow`
- `effect()` para observar cambios en resourceType y statusFilter y disparar `fetchData()`
- `HttpClient` para las peticiones a la API
- Métodos públicos: `setResource()`, `setFilter()`, `selectRow()`, `clearSelection()`, `removeRow()`

**Qué se aceptó:**
- La estructura del servicio con signals para cada estado.
- El uso de `effect()` para disparar `fetchData()` automáticamente al cambiar recurso o filtro.
- El manejo de errores con el signal de error.

**Qué se rechazó/modificó:**
- La IA no incluía `takeUntilDestroyed` para limpiar suscripciones. Se agregó para evitar memory leaks.
- No reiniciaba el filtro al cambiar de recurso. Se agregó `statusFilter.set(null)` en `setResource()`.
- El filtro de status solo aplica a characters en la API. Se agregó validación en `fetchData()` para solo incluir el parámetro `status` cuando el recurso es `character`.

**Código generado:**

`resource-state.ts` — effect que dispara fetch:
```typescript
constructor() {
  effect(() => {
    this.fetchData(this.resourceType(), this.statusFilter());
  });
}

private fetchData(type: ResourceType, filter: string | null): void {
  this.loading.set(true);
  this.error.set(null);

  const url = `${this.baseUrl}/${type}`;
  const params: Record<string, string> = {};

  if (filter && type === 'character') {
    params['status'] = filter;
  }

  this.http.get<ApiResponse<Resource>>(url, { params })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res) => {
        this.rows.set(res.results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los datos. Intenta de nuevo.');
        this.rows.set([]);
        this.loading.set(false);
      }
    });
}
```

---

**Resumen del enfoque usado en esta sesión:**

Se construyeron los 4 componentes de la librería (ui-button, ui-card, ui-select, ui-table), el archivo public-api.ts, los modelos de la API y el servicio ResourceState. En cada prompt se le pidió a la IA que primero explicara qué entendió y cómo lo iba a hacer. Los errores más frecuentes de la IA fueron: usar decoradores `@Input()`/`@Output()` en vez de signals, tipar con `any` en vez de generics, y no incluir tipos auxiliares. Todos estos se corrigieron manualmente.

---

### Sesión 3 — Flujo Principal: Explorer de Recursos (demo-app)

**Contexto:** En esta sesión se construyó la integración completa del flujo principal de la demo-app. Se le indicó a Claude Code que consumiera directamente la Rick and Morty API para entender la estructura de los datos y generar las entidades, interfaces y toda la lógica de integración correctamente. Se continuó con la misma metodología: proporcionar el PDF como contexto y pedir a la IA que explicara qué entendió y cómo lo iba a hacer antes de generar código.

---

**Prompt 1 — Consumo de la API para generar entidades:**
> "Consume la Rick and Morty API (https://rickandmortyapi.com/api). Haz una petición real a los endpoints de character, episode y location. Con base en las respuestas reales, dime la estructura exacta de los datos y genera las interfaces TypeScript correctas para cada recurso."

**Qué respondió la IA:**
- Consumió `GET /api/character` y detectó la estructura paginada con `info` y `results`
- Consumió `GET /api/episode` y detectó los campos: id, name, air_date, episode, characters, url, created
- Consumió `GET /api/location` y detectó los campos: id, name, type, dimension, residents, url, created
- Detectó que `origin` y `location` en Character son objetos anidados con `name` y `url`
- Detectó que `episode` en Character es un array de strings (URLs)

**Qué se aceptó:**
- Las interfaces generadas a partir de datos reales de la API. Esto garantizó que el tipado fuera exacto y no tuviera campos inventados ni faltantes.
- La estructura `ApiResponse<T>` con `info` (count, pages, next, prev) y `results`.
- Los tipos `ResourceType` y `Resource` union type.

**Qué se rechazó/modificó:**
- La IA inicialmente no incluía el campo `type` en Character. Se agregó tras verificar el endpoint real.
- No generaba el tipo `ApiResponse<T>` genérico. Se creó manualmente para tipar correctamente las respuestas paginadas.

---

**Prompt 2 — Configuración de HttpClient en la app:**
> "Con el contexto del PDF, dime cómo configurar HttpClient en la demo-app para poder hacer peticiones a la Rick and Morty API. Dime qué archivo hay que modificar y qué proveedores agregar."

**Qué respondió la IA:**
- Importar `provideHttpClient` desde `@angular/common/http`
- Agregarlo en los providers de `app.config.ts`
- También agregar `provideClientHydration` para compatibilidad con SSR

**Proceso seguido:**

`app.config.ts`:
```typescript
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideRouter(routes)
  ],
};
```

**Qué se aceptó:**
- La configuración de `provideHttpClient` con `withFetch()` para usar fetch API en vez de XMLHttpRequest.

**Qué se rechazó/modificó:**
- La IA sugería usar `HttpClientModule` (módulo legacy). Se usó `provideHttpClient()` que es la forma moderna en Angular standalone.

---

**Prompt 3 — Selects de recurso y filtro:**
> "Con el contexto del PDF, dime qué entendiste del flujo del Explorer. Necesito dos selects: uno para elegir el recurso (Characters/Episodes/Locations) y otro para filtrar por status (Alive/Dead/Unknown). Al cambiar el recurso, el filtro debe resetearse. Dime cómo lo vas a hacer."

**Qué respondió la IA:**
- Dos instancias de `ui-select` en el template del App Component
- `resourceOptions` con las 3 opciones de recurso
- `filterOptions` con las 3 opciones de status (Alive/Dead/Unknown)
- Al cambiar el recurso se llama a `state.setResource()` que internamente resetea el filtro
- Al cambiar el filtro se llama a `state.setFilter()`

**Qué se aceptó:**
- La estructura de dos selects con opciones fijas definidas como arrays.
- La lógica de reseteo del filtro al cambiar recurso ya estaba en `setResource()` del servicio.
- El binding de los selects con `[value]="state.resourceType()"` y `[value]="state.statusFilter()"`.

**Qué se rechazó/modificó:**
- La IA sugería usar `(ngModelChange)` para detectar cambios. Se usó `(selectionChange)` que es el output del ui-select.
- No consideraba que el filtro de status solo aplica a characters. Se dejó que la lógica del servicio lo maneje (solo agrega el parámetro cuando type es 'character').

**Código generado:**

`app.ts` — opciones y handlers:
```typescript
readonly resourceOptions: SelectOption[] = [
  { label: 'Characters', value: 'character' },
  { label: 'Episodes', value: 'episode' },
  { label: 'Locations', value: 'location' },
];

readonly filterOptions: SelectOption[] = [
  { label: 'Alive', value: 'Alive' },
  { label: 'Dead', value: 'Dead' },
  { label: 'Unknown', value: 'Unknown' },
];

onResourceChange(option: SelectOption): void {
  const type = option.value as 'character' | 'episode' | 'location';
  this.state.setResource(type);
}

onFilterChange(option: SelectOption): void {
  this.state.setFilter(option.value);
}
```

---

**Prompt 4 — Tabla con columnas dinámicas por recurso:**
> "Con el contexto del PDF, dime cómo hacer que la tabla muestre columnas diferentes según el recurso activo. Characters tiene unas columnas, Episodes tiene otras, Locations tiene otras. Dime qué entendiste y cómo lo vas a hacer."

**Qué respondió la IA:**
- Usar un `computed()` que retorne `TableColumn[]` según `state.resourceType()`
- Characters: nombre, estado, especie, género
- Episodes: nombre, fecha emisión, código
- Locations: nombre, tipo, dimensión
- Pasar las columnas dinámicas al `[columns]` del ui-table

**Qué se aceptó:**
- El uso de `computed()` para reaccionar al cambio de recurso y generar columnas automáticamente.
- La elección de columnas por recurso. Cada recurso muestra los campos más relevantes.
- El binding directo `[columns]="columns()"` en el template.

**Qué se rechazó/modificó:**
- La IA sugería usar un `switch` suelto en el template. Se mantuvo en el componente como `computed()` para mantener la lógica fuera del HTML.

**Código generado:**

`app.ts` — columnas dinámicas:
```typescript
readonly columns = computed<TableColumn[]>(() => {
  switch (this.state.resourceType()) {
    case 'character':
      return [
        { key: 'name', header: 'Nombre' },
        { key: 'status', header: 'Estado' },
        { key: 'species', header: 'Especie' },
        { key: 'gender', header: 'Género' },
      ];
    case 'episode':
      return [
        { key: 'name', header: 'Nombre' },
        { key: 'air_date', header: 'Fecha emisión' },
        { key: 'episode', header: 'Código' },
      ];
    case 'location':
      return [
        { key: 'name', header: 'Nombre' },
        { key: 'type', header: 'Tipo' },
        { key: 'dimension', header: 'Dimensión' },
      ];
  }
});
```

---

**Prompt 5 — Integración de la tabla con estados:**
> "Con el contexto del PDF, dime cómo conectar la tabla con el servicio ResourceState. La tabla debe mostrar skeleton loading durante las peticiones, empty state si no hay resultados, y error state si falla la petición. Dime cómo lo vas a hacer."

**Qué respondió la IA:**
- Bindar `[loading]="state.loading()"` para activar el skeleton
- Bindar `[errorMessage]="state.error()"` para mostrar errores
- Bindar `[rows]="state.rows()"` para los datos
- Pasar un `emptyMessage` personalizado con temática Rick & Morty

**Qué se aceptó:**
- Los bindings directos desde los signals del servicio a los inputs de la tabla.
- El mensaje de empty state: "No se encontraron resultados en esta dimensión."

**Qué se rechazó/modificó:**
- La IA sugería manejar los estados con `*ngIf`/`*ngElse` en el template. No era necesario porque el ui-table ya maneja internamente los tres estados.

**Código generado:**

`app.html` — tabla integrada:
```html
<ui-table
  [columns]="columns()"
  [rows]="state.rows()"
  [loading]="state.loading()"
  emptyMessage="No se encontraron resultados en esta dimensión."
  [errorMessage]="state.error()"
  (actionTriggered)="onTableAction($event)" />
```

---

**Prompt 6 — Acciones de la tabla: Ver detalle y Eliminar:**
> "Con el contexto del PDF, dime cómo manejar las acciones de la tabla. Al hacer clic en Ver debe abrirse un modal con el detalle del registro. Al hacer clic en Eliminar debe abrirse un modal de confirmación. Dime qué entendiste y cómo lo vas a hacer."

**Qué respondió la IA:**
- Un método `onTableAction()` que recibe `TableAction<Resource>` y distingue por `action.action`
- Si es `'view'`: llamar a `state.selectRow()` para abrir el modal de detalle
- Si es `'delete'`: setear un signal `pendingDelete` para abrir el modal de confirmación
- Modal de detalle usando `ui-card` con `ng-content`
- Modal de confirmación con botones Cancelar y Eliminar usando `ui-button`
- Al confirmar eliminación: llamar a `state.removeRow()` que filtra el row del array

**Qué se aceptó:**
- El uso de un solo handler `onTableAction` para ambas acciones.
- El signal `pendingDelete` para controlar el modal de confirmación.
- La eliminación local mediante `state.removeRow()` que filtra el array.
- Los dos modales separados (detalle y confirmación).

**Qué se rechazó/modificó:**
- La IA sugería un solo modal para ambos casos. Se separaron en dos modales independientes porque tienen contenido y propósito distinto.
- No incluía `cancelDelete()`. Se agregó manualmente para cerrar el modal sin eliminar.

**Código generado:**

`app.ts` — manejo de acciones:
```typescript
readonly pendingDelete = signal<Resource | null>(null);

onTableAction(action: TableAction<Resource>): void {
  if (action.action === 'view') {
    this.state.selectRow(action.row);
  }
  if (action.action === 'delete') {
    this.pendingDelete.set(action.row);
  }
}

confirmDelete(): void {
  const row = this.pendingDelete();
  if (row) {
    this.state.removeRow(row);
    this.pendingDelete.set(null);
  }
}

cancelDelete(): void {
  this.pendingDelete.set(null);
}
```

---

**Prompt 7 — Modal de detalle con campos dinámicos:**
> "Con el contexto del PDF, dime cómo hacer el modal de detalle. Debe mostrar todos los campos del registro según el tipo de recurso usando ui-card. Los personajes deben mostrar su imagen. Dime qué entendiste y cómo lo vas a hacer."

**Qué respondió la IA:**
- Un `computed()` `detailFields` que retorna `{ label, value }[]` según `resourceType()`
- Cada recurso tiene sus propios campos mapeados
- Characters: nombre, estado, especie, género, origen, ubicación, episodios, creado
- Episodes: nombre, código, fecha emisión, personajes, creado
- Locations: nombre, tipo, dimensión, residentes, creado
- Imagen solo para Characters usando un `computed()` `detailImage`
- Usar `@for` en el template para renderizar los campos

**Qué se aceptó:**
- Los `computed()` para `detailTitle`, `detailSubtitle`, `detailImage` y `detailFields`.
- El bloque `@if (detailImage())` condicional solo para Characters.
- La imagen circular con borde `rick-green` y sombra.
- El `@for` con `track field.label` para renderizar cada campo como fila label/value.

**Qué se rechazó/modificó:**
- La IA sugería usar `JSON pipe` para mostrar todos los campos. Se rechazó porque no era legible. Se mapeó campo a campo manualmente para mejor presentación.
- No incluía la conversión de `created` a fecha local. Se agregó `new Date(c.created).toLocaleDateString()`.

**Código generado:**

`app.ts` — campos dinámicos:
```typescript
readonly detailFields = computed<{ label: string; value: string }[]>(() => {
  const row = this.state.selectedRow();
  if (!row) return [];

  switch (this.state.resourceType()) {
    case 'character': {
      const c = row as Character;
      return [
        { label: 'Nombre', value: c.name },
        { label: 'Estado', value: c.status },
        { label: 'Especie', value: c.species },
        { label: 'Género', value: c.gender },
        { label: 'Origen', value: c.origin.name },
        { label: 'Ubicación', value: c.location.name },
        { label: 'Episodios', value: String(c.episode.length) },
        { label: 'Creado', value: new Date(c.created).toLocaleDateString() },
      ];
    }
    case 'episode': {
      const e = row as Episode;
      return [
        { label: 'Nombre', value: e.name },
        { label: 'Código', value: e.episode },
        { label: 'Fecha emisión', value: e.air_date },
        { label: 'Personajes', value: String(e.characters.length) },
        { label: 'Creado', value: new Date(e.created).toLocaleDateString() },
      ];
    }
    case 'location': {
      const l = row as Location;
      return [
        { label: 'Nombre', value: l.name },
        { label: 'Tipo', value: l.type },
        { label: 'Dimensión', value: l.dimension },
        { label: 'Residentes', value: String(l.residents.length) },
        { label: 'Creado', value: new Date(l.created).toLocaleDateString() },
      ];
    }
  }
});
```

---

**Prompt 8 — Cierre de modales:**
> "Con el contexto del PDF, dime cómo hacer que los modales se cierren correctamente. El modal de detalle debe cerrar al hacer clic en el botón Cerrar o al hacer clic fuera. El modal de confirmación debe cerrar al hacer clic en Cancelar o fuera."

**Qué respondió la IA:**
- Overlay con `(click)="closeModal()"` para cerrar al clic fuera
- Contenido del modal con `(click)="$event.stopPropagation()"` para evitar que el clic dentro lo cierre
- Botón Cerrar usando `ui-button` con variante secondary
- `closeModal()` llama a `state.clearSelection()`
- `cancelDelete()` setea `pendingDelete` a null

**Qué se aceptó:**
- El patrón overlay + stopPropagation para cerrar modales.
- Los botones de cierre usando ui-button de la librería.
- La animación `animate-fade-in` en los modales.

**Qué se rechazó/modificó:**
- La IA sugería usar un servicio de modales separado. No era necesario para este caso, dos `@if` en el template son suficientes y más simples.

---

**Resumen del enfoque usado en esta sesión:**

Se construyó el flujo completo del Explorer de Recursos: los selects de recurso y filtro, la tabla con columnas dinámicas y tres estados (loading/empty/error), el modal de detalle con campos dinámicos por recurso, y el modal de confirmación de eliminación. Se le indicó a Claude Code que consumiera directamente la Rick and Morty API para generar las entidades correctas basándose en datos reales. En cada prompt se le pidió a la IA que primero explicara qué entendió y cómo lo iba a hacer. Los errores más frecuentes fueron: sugerir patrones legacy (`*ngIf`, `HttpClientModule`, `JSON pipe`) en vez de las APIs modernas de Angular 17+. Todos estos se corrigieron manualmente.

---

### Sesión 4 — Diseño Visual y UX (Tema Rick & Morty)

**Contexto:** En esta sesión se implementó todo el diseño visual de la aplicación. Se investigó primero el estilo visual de Rick and Morty (colores, atmosfera, referencias) para luego implementar un tema coherente con Tailwind CSS v3. El objetivo fue aplicar el diseño de forma limpia y organizada sin romper la funcionalidad ya construida en las sesiones anteriores. Se continuó con la misma metodología de trabajo con la IA.

---

**Prompt 1 — Investigación del estilo visual de Rick and Morty:**
> "Investiga el estilo visual de Rick and Morty. Dime qué colores, paleta, atmosfera y elementos visuales caracterizan la serie. Quiero implementar un diseño en Tailwind CSS que evoque el universo del show sin usar assets con derechos de autor. Dime qué entendiste y qué propones."

**Qué respondió la IA:**
- Paleta principal: verde neón (portal), verde azulado (dimensiones), azul oscuro (espacio/fondo)
- Colores secundarios: amarillo (personajes alienígenas), rojo oscuro (peligro/eliminación)
- Atmosfera: oscura, espacial, con toques de neón y brillo
- Elementos sugeridos: efecto glow en textos, scrollbar personalizado, animaciones suaves, bordes sutiles
- Sin usar imágenes o assets con derechos de autor, solo colores y tipografía

**Qué se aceptó:**
- La dirección general: fondo oscuro con verdes neón como acento principal.
- La idea de efectos glow y scrollbar personalizado.
- El enfoque de solo usar colores y tipografía sin assets con derechos.

**Qué se rechazó/modificó:**
- La IA sugería usar imágenes de fondo del portal. Se rechazó para evitar problemas de derechos de autor y mantener el diseño limpio.
- El "amarillo alienígena" sugerido no contrastaba bien con el fondo oscuro. Se eliminó y se usó `rick-portal` (#11E0AA) como color secundario.

---

**Prompt 2 — Paleta de colores en tailwind.config.js:**
> "Con base en la investigación del estilo, define una paleta de colores en tailwind.config.js. Necesito colores para: fondo principal, tarjetas, bordes, hover, acento verde del portal, y un segundo verde. Dime qué valores hex propones y por qué."

**Qué respondió la IA:**
Propuso una paleta con 2 namespaces: `rick` y `dimension`:

| Token | Valor | Uso |
|---|---|---|
| `rick-green` | #39FF14 | Verde portal neón, acento principal |
| `rick-portal` | #11E0AA | Verde azulado, acento secundario |
| `dimension-bg` | #0D1117 | Fondo principal oscuro |
| `dimension-card` | #161B22 | Fondo de tarjetas |
| `dimension-border` | #30363D | Bordes sutiles |
| `dimension-hover` | #1C2333 | Fondo hover en filas |

**Qué se aceptó:**
- Todos los valores hex propuestos. Contrastaban bien sobre fondo oscuro y eran legibles.
- La separación en dos namespaces (`rick` y `dimension`) para organizar los colores.
- Los colores de dimensión inspirados en GitHub Dark theme para mantener legibilidad.

**Qué se rechazó/modificó:**
- Los valores hex iniciales del verde no tenían suficiente contraste. Se ajustaron manualmente para que el texto sobre fondo oscuro fuera legible.
- La IA sugería agregar más colores (amarillo, morado). Se mantuvo la paleta mínima para coherencia visual.

**Código generado:**

`tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      rick: {
        green: '#39FF14',
        portal: '#11E0AA',
      },
      dimension: {
        bg: '#0D1117',
        card: '#161B22',
        border: '#30363D',
        hover: '#1C2333',
      }
    },
    fontFamily: {
      morty: ['"Segoe UI"', 'system-ui', 'sans-serif'],
    },
    animation: {
      'fade-in': 'fadeIn 0.2s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
        '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
      },
    }
  },
},
```

---

**Prompt 3 — Fuente Creepster y estilos globales:**
> "Ahora dime cómo importar la fuente Creepster de Google Fonts y configurarla como fuente principal del titulo. También necesito estilos globales para el body, scrollbar personalizado y una clase utilitaria para efecto de brillo neón en textos."

**Qué respondió la IA:**
- Importar Creepster desde Google Fonts con `@import url(...)` en `styles.css`
- Usar `@layer base` para estilos del body con las clases Tailwind
- Scrollbar personalizado con `::-webkit-scrollbar` usando los colores del tema
- Clase utilitaria `.text-glow-green` con `text-shadow` para el efecto neón

**Qué se aceptó:**
- La fuente Creepster solo para el titulo principal, no para toda la app.
- El scrollbar personalizado con colores del tema (verde portal).
- La clase `.text-glow-green` con doble sombra para efecto de brillo.

**Qué se rechazó/modificó:**
- La IA sugería Creepster como fuente global. Se limitó solo al titulo porque no es legible para texto de contenido.
- No incluía la clase `font-morty` en tailwind.config. Se agregó manualmente para la tipografía del body.

**Código generado:**

`projects/demo-app/src/styles.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-dimension-bg text-gray-100 font-morty antialiased;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-dimension-bg;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-rick-green/20 rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-rick-green/40;
  }
}

@layer utilities {
  .text-glow-green {
    text-shadow: 0 0 10px #39FF14, 0 0 20px #39FF1480;
  }
}
```

---

**Prompt 4 — Header con título Rick and Morty:**
> "Diseña el header de la app con el titulo 'Rick and Morty Explorer' usando la fuente Creepster, el efecto de brillo neón y un subtitulo descriptivo. Debe verse bien en mobile y desktop."

**Qué respondió la IA:**
- Header centrado con padding vertical
- Título con `text-3xl md:text-5xl` para responsividad
- Clase `text-glow-green` para el efecto neón
- Fuente inline `font-family: 'Creepster', cursive`
- Subtitulo en gris con tracking amplio
- Borde inferior sutil con `border-dimension-border/50`

**Qué se aceptó:**
- El diseño completo del header. Evoca la serie sin usar imágenes.
- La responsividad con breakpoints `md:`.
- El borde inferior sutil que separa el header del contenido.

**Qué se rechazó/modificó:**
- La IA sugería agregar un ícono SVG del portal. Se eliminó para mantener el diseño limpio y minimalista.

**Código generado:**

`app.html` — header:
```html
<header class="pt-8 pb-6 px-4 text-center border-b border-dimension-border/50">
  <h1 class="text-3xl md:text-5xl font-bold text-rick-green text-glow-green"
      style="font-family: 'Creepster', cursive;">
    Rick & Morty Explorer
  </h1>
  <p class="text-gray-500 mt-2 text-xs md:text-sm tracking-wide">
    Explora personajes, episodios y localizaciones del multiverso
  </p>
</header>
```

---

**Prompt 5 — Estilos de los componentes de la librería:**
> "Ahora aplica los estilos del tema Rick and Morty a los componentes de la librería sin romper su funcionalidad. Los botones deben usar rick-green, la tabla debe usar dimension-bg/card/border, los selects deben verse coherentes con el tema. Dime qué archivos hay que modificar y qué cambiar."

**Qué respondió la IA:**
- `button.ts`: las clases VARIANTS ya usaban `rick-green`, `dimension-bg`, `dimension-border` — no requería cambios
- `table.html`: usar `dimension-border` para bordes, `dimension-card/80` para header, `rick-green/90` para texto de encabezados
- `select.html`: usar `dimension-border`, `dimension-card`, `rick-green` para label y focus
- `card.html`: usar `dimension-border` para borde del header, `dimension-hover` para hover del header

**Qué se aceptó:**
- No se modificó la lógica de ningún componente, solo las clases CSS.
- Los estilos se mantuvieron en los templates HTML y en los `const` de TypeScript, sin crear archivos CSS separados.
- Cada componente mantuvo sus estados visuales (default, hover, focus, disabled, loading, error) con el nuevo tema.

**Qué se rechazó/modificó:**
- La IA sugería crear archivos CSS separados para cada componente. Se mantuvo todo con clases Tailwind inline para simplicidad.
- No se tocó el TypeScript de los componentes más allá de las clases CSS en los `const`.

---

**Prompt 6 — Animaciones y transiciones:**
> "Agrega animaciones suaves: fade-in para los modales, transiciones en hover de filas de la tabla, y animación pulse para los skeletons. Todo con Tailwind CSS, sin CSS customizado adicional."

**Qué respondió la IA:**
- Modales: clase `animate-fade-in` definida en `tailwind.config.js` con opacity + translateY + scale
- Filas de tabla: `transition-colors duration-150` para hover suave
- Skeletons: `animate-pulse` de Tailwind para efecto de carga
- Botones: `transition-all duration-200` para hover y focus
- Selects: `transition-all duration-200` para hover y focus

**Qué se aceptó:**
- La animación fade-in personalizada en tailwind.config.js.
- Todas las transiciones con duraciones cortas (150ms-200ms) para que se sientan rápidas.
- El uso de `animate-pulse` nativo de Tailwind para skeletons.

**Qué se rechazó/modificó:**
- La IA sugería animaciones más elaboradas (scale, bounce). Se rechazaron para mantener el diseño limpio y profesional.

---

**Prompt 7 — Responsividad:**
> "Verifica que la app se vea correctamente en mobile y desktop. Los selects deben apilarse en mobile, la tabla debe hacer scroll horizontal, y los modales deben tener padding adecuado en pantallas pequeñas."

**Qué respondió la IA:**
- Selects: `flex-wrap gap-4` para que se apilen en mobile
- Tabla: `overflow-x-auto` para scroll horizontal
- Modales: `p-4` en el overlay, `max-h-[90vh] overflow-y-auto` en el contenido
- Header: `text-3xl md:text-5xl` para ajustar tamaño
- Contenedor principal: `max-w-6xl mx-auto px-4 md:px-6`

**Qué se aceptó:**
- Todos los ajustes responsivos propuestos.
- El uso de `max-w-6xl` como ancho máximo del contenido.
- Los breakpoints `md:` para diferenciar mobile de desktop.

**Qué se rechazó/modificó:**
- La IA sugería ocultar columnas en mobile. Se prefirió scroll horizontal para mantener toda la información visible.

---

**Prompt 8 — Verificación visual sin romper funcionalidad:**
> "Verifica que todos los estilos se aplicaron correctamente sin romper ninguna funcionalidad existente. Los estados de loading, empty y error deben seguir funcionando. Los modales deben abrir y cerrar correctamente. Los selects deben seguir haciendo two-way binding."

**Qué se verificó:**
- Botones: las 3 variantes (primary/secondary/danger) se ven distintas y correctas
- Tabla: skeleton loading, empty state, error state funcionan con el nuevo tema
- Selects: loading skeleton, disabled, y two-way binding funcionan
- Card: las 3 elevaciones (flat/raised/outlined) se ven distintas
- Modales: abren y cierran correctamente con animación fade-in
- Responsividad: se ve bien en mobile y desktop
- Ningún componente dejo de funcionar tras los cambios de estilos

**Resultado:** Diseño visual implementado correctamente. Todos los componentes mantienen su funcionalidad. El tema es coherente en toda la app.

---

**Resumen del enfoque usado en esta sesión:**

Se investigó primero el estilo visual de Rick and Morty para entender la paleta y atmosfera antes de implementar nada. Luego se definió la paleta de colores en `tailwind.config.js`, se agregaron estilos globales en `styles.css` (fuente Creepster, scrollbar, efecto glow), se aplicaron estilos a cada componente sin romper su funcionalidad, y se verificó la responsividad. El diseño se mantuvo limpio y organizado: solo clases Tailwind inline, sin archivos CSS adicionales, sin assets con derechos de autor. En cada paso se aseguró que los cambios de estilos no afectaran la lógica ya construida en las sesiones anteriores.
