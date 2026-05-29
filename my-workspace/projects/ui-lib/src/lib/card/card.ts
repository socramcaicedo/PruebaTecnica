import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

const BASE = 'rounded-xl overflow-hidden transition-all duration-200';

const ELEVATIONS: Record<string, string> = {
  flat: 'bg-dimension-card',
  raised: 'bg-dimension-card shadow-lg shadow-rick-green/5',
  outlined: 'bg-dimension-card border border-rick-green/20',
};

@Component({
  selector: 'ui-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly elevation = input<'flat' | 'raised' | 'outlined'>('raised');

  readonly headerClicked = output<void>();

  readonly cardClasses = computed(() => `${BASE} ${ELEVATIONS[this.elevation()]}`);
}
