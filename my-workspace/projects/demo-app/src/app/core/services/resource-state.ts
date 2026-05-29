import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse, Resource, ResourceType } from '../models/resource.models';

@Injectable({ providedIn: 'root' })
export class ResourceState {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseUrl = 'https://rickandmortyapi.com/api';

  readonly resourceType = signal<ResourceType>('character');
  readonly statusFilter = signal<string | null>(null);
  readonly rows = signal<Resource[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedRow = signal<Resource | null>(null);

  constructor() {
    effect(() => {
      this.fetchData(this.resourceType(), this.statusFilter());
    });
  }

  /** Cambia el recurso activo y resetea el filtro */
  setResource(type: ResourceType): void {
    this.statusFilter.set(null);
    this.resourceType.set(type);
  }

  /** Cambia el filtro de status */
  setFilter(status: string | null): void {
    this.statusFilter.set(status);
  }

  /** Abre el modal de detalle */
  selectRow(row: Resource): void {
    this.selectedRow.set(row);
  }

  /** Cierra el modal de detalle */
  clearSelection(): void {
    this.selectedRow.set(null);
  }

  /** Elimina un row de la tabla */
  removeRow(row: Resource): void {
    this.rows.update(rows => rows.filter(r => r !== row));
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
}
