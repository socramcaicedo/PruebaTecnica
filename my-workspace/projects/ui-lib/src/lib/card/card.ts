import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Clases CSS base compartidas por todos los niveles de elevación */
const BASE = 'rounded-xl overflow-hidden transition-all duration-200';

/** Mapa de clases CSS para cada nivel de elevación de la tarjeta */
const ELEVATIONS: Record<string, string> = {
  flat: 'bg-dimension-card',
  raised: 'bg-dimension-card shadow-lg shadow-rick-green/5',
  outlined: 'bg-dimension-card border border-rick-green/20',
};

/**
 * Componente de tarjeta reutilizable con header clickeable, elevación configurable
 * y proyección de contenido arbitrario en el body mediante `ng-content`.
 *
 * @example
 * ```html
 * <ui-card title="Rick Sanchez" subtitle="Character" elevation="raised" (headerClicked)="onClick()">
 *   <p>Contenido proyectado en el body.</p>
 * </ui-card>
 * ```
 */
@Component({
  selector: 'ui-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {

  /** Título que se muestra en el header de la tarjeta */
  readonly title = input.required<string>();

  /** Subtítulo opcional que se muestra debajo del título en el header */
  readonly subtitle = input<string | null>(null);

  /** Nivel de elevación visual: sin sombra, con sombra o con borde contorneado */
  readonly elevation = input<'flat' | 'raised' | 'outlined'>('raised');

  /** Se emite cuando el usuario hace clic en el header de la tarjeta */
  readonly headerClicked = output<void>();

  /** Genera las clases CSS dinámicas de la tarjeta según el nivel de elevación seleccionado */
  readonly cardClasses = computed(() => `${BASE} ${ELEVATIONS[this.elevation()]}`);
}
