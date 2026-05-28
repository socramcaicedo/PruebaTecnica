import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {

// Inputs usando Signals API
  label = input.required<string>();
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  // Output usando Signals API
  clicked = output<void>();

  // Lógica de emisión protegida
  onClick() {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }

    alert("diste click")
  }

  // Computando las clases de Tailwind dinámicamente
  buttonClasses = computed(() => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Variantes visuales (Puedes ajustar los colores al tema Rick & Morty)
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };

    // Tamaños
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    // Estados de bloqueo
    const states = (this.disabled() || this.loading()) 
      ? 'opacity-50 cursor-not-allowed' 
      : '';

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${states}`;
  });
}
