import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Definición de una columna de la tabla */
export interface TableColumn {
  key: string;
  header: string;
}

/** Acción emitida por la tabla al interactuar con una fila */
export interface TableAction<T> {
  action: 'view' | 'delete';
  row: T;
}

@Component({
  selector: 'ui-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table<T> {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<T[]>();
  readonly loading = input<boolean>(false);
  readonly emptyMessage = input<string>('No hay datos disponibles');
  readonly errorMessage = input<string | null>(null);

  readonly actionTriggered = output<TableAction<T>>();

  /** Emite una acción sobre una fila */
  onAction(action: 'view' | 'delete', row: T): void {
    this.actionTriggered.emit({ action, row });
  }

  /** Accede a una propiedad dinámica del objeto sin usar any en el template */
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
