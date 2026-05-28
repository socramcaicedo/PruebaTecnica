import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

/** Opción del select */
export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'ui-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {
  readonly options = input.required<SelectOption[]>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>('Seleccionar...');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly value = model<string | null>(null);
  readonly selectionChange = output<SelectOption>();

  /** Maneja el cambio del select nativo */
  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selected = this.options().find(opt => opt.value === select.value);
    if (selected) {
      this.value.set(selected.value);
      this.selectionChange.emit(selected);
    }
  }
}
