import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse, Resource, ResourceType } from '../models/resource.models';

/**
 * Servicio centralizado que gestiona todo el estado del flujo principal
 * de la aplicación Explorer de Recursos.
 *
 * Utiliza Angular Signals para mantener el estado reactivo:
 * recurso activo, filtro de status, datos de la tabla, estados de carga y error,
 * y la fila seleccionada para el modal de detalle.
 *
 * Los componentes no hacen llamadas HTTP directas.
 * Un `effect()` observa los cambios en el recurso y el filtro,
 * y dispara automáticamente la consulta a la Rick and Morty API.
 */
@Injectable({ providedIn: 'root' })
export class ResourceState {

  /** Cliente HTTP inyectado para realizar peticiones a la Rick and Morty API */
  private readonly http = inject(HttpClient);

  /** Referencia al ciclo de vida del componente para limpiar suscripciones automáticamente */
  private readonly destroyRef = inject(DestroyRef);

  /** URL base de la Rick and Morty API */
  private readonly baseUrl = 'https://rickandmortyapi.com/api';

  /** Tipo de recurso activo: character, episode o location */
  readonly resourceType = signal<ResourceType>('character');

  /** Filtro de status aplicado al recurso activo (Alive, Dead, Unknown). Solo aplica a characters */
  readonly statusFilter = signal<string | null>(null);

  /** Arreglo de registros obtenidos de la API para el recurso activo */
  readonly rows = signal<Resource[]>([]);

  /** Indica si hay una petición HTTP en curso */
  readonly loading = signal(false);

  /** Mensaje de error si la última petición falló. `null` si no hay error */
  readonly error = signal<string | null>(null);

  /** Fila seleccionada actualmente para mostrar en el modal de detalle */
  readonly selectedRow = signal<Resource | null>(null);

  /**
   * Inicializa el effect que observa los cambios en `resourceType` y `statusFilter`.
   * Cuando cualquiera de los dos cambia, se ejecuta automáticamente `fetchData()`
   * para consultar la API con los nuevos parámetros.
   */
  constructor() {
    effect(() => {
      this.fetchData(this.resourceType(), this.statusFilter());
    });
  }

  /**
   * Cambia el recurso activo y reinicia el filtro de status.
   * Al cambiar el recurso, el effect dispara automáticamente una nueva consulta.
   *
   * @param type - Nuevo tipo de recurso a consultar
   */
  setResource(type: ResourceType): void {
    this.statusFilter.set(null);
    this.resourceType.set(type);
  }

  /**
   * Actualiza el filtro de status.
   * Solo tiene efecto cuando el recurso activo es `character`,
   * ya que la API no soporta este filtro en episodes ni locations.
   *
   * @param status - Valor del filtro (Alive, Dead, Unknown) o null para limpiar
   */
  setFilter(status: string | null): void {
    this.statusFilter.set(status);
  }

  /**
   * Establece la fila seleccionada para mostrar su detalle en el modal.
   *
   * @param row - Registro de recurso seleccionado por el usuario
   */
  selectRow(row: Resource): void {
    this.selectedRow.set(row);
  }

  /** Limpia la fila seleccionada, cerrando el modal de detalle */
  clearSelection(): void {
    this.selectedRow.set(null);
  }

  /**
   * Elimina un registro del arreglo local de filas.
   * No realiza una petición DELETE a la API.
   *
   * @param row - Registro a eliminar del estado local
   */
  removeRow(row: Resource): void {
    this.rows.update(rows => rows.filter(r => r !== row));
  }

  /**
   * Realiza la petición HTTP GET a la Rick and Morty API
   * según el tipo de recurso y filtro de status proporcionados.
   *
   * Si el tipo es `character` y hay un filtro de status válido,
   * se agrega el parámetro `status` a la consulta.
   *
   * Actualiza los signals de `rows`, `loading` y `error` según el resultado.
   * Utiliza `takeUntilDestroyed` para evitar memory leaks en las suscripciones.
   *
   * @param type - Tipo de recurso a consultar
   * @param filter - Filtro de status opcional (solo aplica a characters)
   */
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
