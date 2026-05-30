import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

/**
 * Representa una opción individual dentro del componente select.
 * Cada opción tiene una etiqueta visible y un valor interno.
 */
export interface SelectOption {
  /** Texto visible que se muestra al usuario en la lista de opciones */
  label: string;
  /** Valor interno que identifica la opción seleccionada */
  value: string;
}

/**
 * Componente de select reutilizable con soporte para two-way binding,
 * skeleton loading, estado deshabilitado y evento de cambio de selección.
 *
 * Utiliza `model()` para permitir bidireccionalidad del valor seleccionado,
 * lo que habilita el uso de `[(value)]` en el template padre.
 *
 * @example
 * ```html
 * <ui-select
 *   [options]="resourceOptions"
 *   label="Recurso"
 *   placeholder="Seleccionar recurso..."
 *   [value]="selectedResource()"
 *   (selectionChange)="onResourceChange($event)" />
 * ```
 */
@Component({
  selector: 'ui-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {

  /** Lista de opciones disponibles para seleccionar */
  readonly options = input.required<SelectOption[]>();

  /** Etiqueta visible que se muestra encima del select */
  readonly label = input.required<string>();

  /** Texto placeholder que se muestra cuando no hay ninguna opción seleccionada */
  readonly placeholder = input<string>('Seleccionar...');

  /** Indica si el select está en estado de carga. Muestra un skeleton en lugar del control */
  readonly loading = input<boolean>(false);

  /** Indica si el select está deshabilitado y no responde a interacción */
  readonly disabled = input<boolean>(false);

  /**
   * Valor actualmente seleccionado. Soporta two-way binding mediante `model()`.
   * Permite lectura y escritura desde el componente padre con `[(value)]`.
   */
  readonly value = model<string | null>(null);

  /** Se emite cuando el usuario selecciona una opción, enviando el objeto `SelectOption` completo */
  readonly selectionChange = output<SelectOption>();

  /**
   * Maneja el evento de cambio del elemento `<select>` nativo del DOM.
   * Busca la opción seleccionada en la lista, sincroniza el model `value`
   * y emite el output `selectionChange` con la opción completa.
   *
   * @param event - Evento nativo de cambio del elemento `<select>`
   */
  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selected = this.options().find(opt => opt.value === select.value);
    if (selected) {
      this.value.set(selected.value);
      this.selectionChange.emit(selected);
    }
  }
}
