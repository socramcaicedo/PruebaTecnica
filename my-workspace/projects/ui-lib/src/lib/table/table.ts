import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Define una columna de la tabla genérica.
 * Cada columna tiene una clave para acceder al dato y un encabezado visible.
 */
export interface TableColumn {
  /** Clave del objeto que se usa para extraer el valor de cada fila */
  key: string;
  /** Texto del encabezado que se muestra en la parte superior de la columna */
  header: string;
}

/**
 * Representa una acción emitida por la tabla al interactuar con los botones de una fila.
 * El componente padre es responsable de interpretar y manejar cada acción.
 *
 * @typeparam T - Tipo de dato de la fila sobre la que se ejecuta la acción
 */
export interface TableAction<T> {
  /** Tipo de acción: ver detalle o eliminar registro */
  action: 'view' | 'delete';
  /** Fila sobre la que se ejecuta la acción */
  row: T;
}

/**
 * Tabla genérica reutilizable con soporte para skeleton loading, estado vacío,
 * estado de error y acciones por fila (ver detalle / eliminar).
 *
 * La tabla es genérica (`Table<T>`) y no conoce el dominio de los datos.
 * Solo renderiza columnas y emite acciones. El componente padre decide
 * qué columnas mostrar y cómo manejar cada acción recibida.
 *
 * @typeparam T - Tipo de dato de las filas que se renderizan en la tabla
 *
 * @example
 * ```html
 * <ui-table
 *   [columns]="columns()"
 *   [rows]="state.rows()"
 *   [loading]="state.loading()"
 *   emptyMessage="No se encontraron resultados."
 *   [errorMessage]="state.error()"
 *   (actionTriggered)="onTableAction($event)" />
 * ```
 */
@Component({
  selector: 'ui-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table<T> {

  /** Definición de columnas que determina qué campos se muestran y sus encabezados */
  readonly columns = input.required<TableColumn[]>();

  /** Arreglo de datos genéricos que se renderizan como filas de la tabla */
  readonly rows = input.required<T[]>();

  /** Indica si la tabla está cargando datos. Muestra filas skeleton con animación pulse */
  readonly loading = input<boolean>(false);

  /** Mensaje que se muestra cuando no hay datos disponibles en la tabla */
  readonly emptyMessage = input<string>('No hay datos disponibles');

  /** Mensaje de error que se muestra cuando falla la petición de datos. `null` oculta el estado de error */
  readonly errorMessage = input<string | null>(null);

  /** Se emite cuando el usuario interactúa con los botones de acción de una fila */
  readonly actionTriggered = output<TableAction<T>>();

  /**
   * Emite una acción sobre una fila específica de la tabla.
   * Se invoca desde los botones "Ver" y "Eliminar" de cada fila.
   *
   * @param action - Tipo de acción a ejecutar: ver detalle o eliminar
   * @param row - Fila sobre la que se ejecuta la acción
   */
  onAction(action: 'view' | 'delete', row: T): void {
    this.actionTriggered.emit({ action, row });
  }

  /**
   * Accede al valor de una propiedad dinámica de un objeto sin usar `any`.
   * Si el valor es un objeto anidado, extrae su propiedad `name`.
   * Si es nulo o indefinido, retorna una cadena vacía.
   *
   * Este método permite que la tabla genérica renderice cualquier tipo de dato
   * sin conocer su estructura en tiempo de compilación.
   *
   * @param row - Fila de datos de tipo genérico T
   * @param key - Clave de la propiedad a extraer
   * @returns El valor convertido a cadena, o cadena vacía si no existe
   */
  getCellValue(row: T, key: string): string {
    const value = (row as Record<string, unknown>)[key];
    if (value == null) return '';
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      return String(obj['name'] ?? '');
    }
    return String(value);
  }
}
