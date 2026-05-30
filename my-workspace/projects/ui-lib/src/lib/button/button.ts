import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Clases CSS base compartidas por todas las variantes del botón */
const BASE = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dimension-bg cursor-pointer';

/** Mapa de clases CSS por cada variante visual del botón */
const VARIANTS: Record<string, string> = {
  primary: 'bg-rick-green text-dimension-bg hover:brightness-110 hover:shadow-[0_0_12px_#39FF1480] focus:ring-rick-green/60 active:brightness-90',
  secondary: 'bg-dimension-card text-gray-200 border border-dimension-border hover:border-rick-green/40 hover:text-rick-green focus:ring-rick-green/40 active:bg-dimension-hover',
  danger: 'bg-red-900/60 text-red-300 border border-red-800/60 hover:bg-red-800/70 hover:text-red-200 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] focus:ring-red-500/50 active:bg-red-900/80',
};

/** Mapa de clases CSS por cada tamaño del botón */
const SIZES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

/**
 * Componente de botón reutilizable con soporte para variantes visuales,
 * tamaños configurables y estados de deshabilitado y carga.
 *
 * @example
 * ```html
 * <ui-button label="Guardar" variant="primary" size="md" (clicked)="onSave()" />
 * ```
 */
@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {

  /** Texto visible que se muestra dentro del botón */
  label = input.required<string>();

  /** Estilo visual del botón: primario (verde portal), secundario (contorno) o peligro (rojo) */
  variant = input<'primary' | 'secondary' | 'danger'>('primary');

  /** Tamaño del botón: pequeño, mediano o grande */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Indica si el botón está deshabilitado y no responde a interacción */
  disabled = input<boolean>(false);

  /** Indica si el botón está en estado de carga. Muestra un spinner y bloquea el clic */
  loading = input<boolean>(false);

  /** Se emite cuando el usuario hace clic en el botón y no está deshabilitado ni en carga */
  clicked = output<void>();

  /**
   * Maneja el evento de clic del botón.
   * Solo emite el output `clicked` si el botón no está deshabilitado ni en estado de carga.
   */
  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }

  /** Genera las clases CSS dinámicas del botón según la variante, tamaño y estado actual */
  buttonClasses = computed(() => {
    const states = (this.disabled() || this.loading())
      ? 'opacity-40 cursor-not-allowed pointer-events-none'
      : '';

    return `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]} ${states}`;
  });
}
