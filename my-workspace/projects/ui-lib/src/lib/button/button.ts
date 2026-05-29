import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

const BASE = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dimension-bg cursor-pointer';

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

@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  label = input.required<string>();
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  clicked = output<void>();

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }

  buttonClasses = computed(() => {
    const states = (this.disabled() || this.loading())
      ? 'opacity-40 cursor-not-allowed pointer-events-none'
      : '';

    return `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]} ${states}`;
  });
}
