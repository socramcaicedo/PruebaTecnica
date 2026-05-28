import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ApiResponse, Character, Episode, Location, Resource, ResourceType } from '../models/resource.models';

@Injectable({ providedIn: 'root' })
export class ResourceState {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://rickandmortyapi.com/api';

  readonly resourceType = signal<ResourceType>('character');
  readonly statusFilter = signal<string | null>(null);
  readonly rows = signal<Resource[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedRow = signal<Resource | null>(null);

  constructor() {
    this.fetchData();
  }

  /** Cambia el recurso activo y resetea el filtro */
  setResource(type: ResourceType): void {
    this.resourceType.set(type);
    this.statusFilter.set(null);
    this.fetchData();
  }

  /** Cambia el filtro de status */
  setFilter(status: string | null): void {
    this.statusFilter.set(status);
    this.fetchData();
  }

  /** Abre el modal de detalle */
  selectRow(row: Resource): void {
    this.selectedRow.set(row);
  }

  /** Cierra el modal de detalle */
  clearSelection(): void {
    this.selectedRow.set(null);
  }

  private fetchData(): void {
    this.loading.set(true);
    this.error.set(null);

    const url = `${this.baseUrl}/${this.resourceType()}`;
    const params: Record<string, string> = {};

    if (this.statusFilter() && this.resourceType() === 'character') {
      params['status'] = this.statusFilter()!;
    }

    this.http.get<ApiResponse<Character> | ApiResponse<Episode> | ApiResponse<Location>>(url, { params }).subscribe({
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
