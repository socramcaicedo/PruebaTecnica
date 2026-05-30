import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Card, Select, SelectOption, Table, TableColumn, TableAction, Button } from 'ui-lib';

import { ResourceState } from './core/services/resource-state';
import { Character, Episode, Location, Resource } from './core/models/resource.models';

/**
 * Componente principal de la aplicación Rick & Morty Explorer.
 *
 * Integra los cuatro componentes de la librería ui-lib (Button, Card, Select, Table)
 * en un flujo cohesivo que permite explorar personajes, episodios y ubicaciones
 * de la Rick and Morty API.
 *
 * Gestiona los selects de recurso y filtro, la tabla con columnas dinámicas,
 * el modal de detalle y el modal de confirmación de eliminación.
 * Todo el estado se delega al servicio {@link ResourceState}.
 */
@Component({
  selector: 'app-root',
  imports: [Table, Select, Card, Button],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {

  /** Servicio inyectado que centraliza todo el estado del flujo principal */
  readonly state = inject(ResourceState);

  /** Registro pendiente de eliminación. Si no es null, muestra el modal de confirmación */
  readonly pendingDelete = signal<Resource | null>(null);

  /** Opciones fijas del select de recurso: Characters, Episodes, Locations */
  readonly resourceOptions: SelectOption[] = [
    { label: 'Characters', value: 'character' },
    { label: 'Episodes', value: 'episode' },
    { label: 'Locations', value: 'location' },
  ];

  /** Opciones fijas del select de filtro de status: Alive, Dead, Unknown */
  readonly filterOptions: SelectOption[] = [
    { label: 'Alive', value: 'Alive' },
    { label: 'Dead', value: 'Dead' },
    { label: 'Unknown', value: 'Unknown' },
  ];

  /**
   * Columnas dinámicas de la tabla según el recurso activo.
   * Reacciona automáticamente cuando cambia `resourceType` en el servicio.
   * Cada recurso muestra los campos más relevantes.
   */
  readonly columns = computed<TableColumn[]>(() => {
    switch (this.state.resourceType()) {
      case 'character':
        return [
          { key: 'name', header: 'Nombre' },
          { key: 'status', header: 'Estado' },
          { key: 'species', header: 'Especie' },
          { key: 'gender', header: 'Género' },
        ];
      case 'episode':
        return [
          { key: 'name', header: 'Nombre' },
          { key: 'air_date', header: 'Fecha emisión' },
          { key: 'episode', header: 'Código' },
        ];
      case 'location':
        return [
          { key: 'name', header: 'Nombre' },
          { key: 'type', header: 'Tipo' },
          { key: 'dimension', header: 'Dimensión' },
        ];
    }
  });

  /** Título del modal de detalle extraído del nombre del registro seleccionado */
  readonly detailTitle = computed(() => {
    const row = this.state.selectedRow();
    return row ? (row as Character | Episode | Location).name : '';
  });

  /** Subtítulo del modal de detalle con el tipo de recurso capitalizado */
  readonly detailSubtitle = computed(() => {
    const type = this.state.resourceType();
    return type.charAt(0).toUpperCase() + type.slice(1);
  });

  /** URL de la imagen del personaje seleccionado. Solo aplica para Characters, null en los demás */
  readonly detailImage = computed<string | null>(() => {
    const row = this.state.selectedRow();
    return this.state.resourceType() === 'character' && row ? (row as Character).image : null;
  });

  /**
   * Campos del modal de detalle mapeados según el tipo de recurso activo.
   * Cada campo tiene una etiqueta y un valor formateado.
   * Characters incluyen imagen, origen, ubicación y cantidad de episodios.
   * Episodes incluyen código, fecha y cantidad de personajes.
   * Locations incluyen tipo, dimensión y cantidad de residentes.
   */
  readonly detailFields = computed<{ label: string; value: string }[]>(() => {
    const row = this.state.selectedRow();
    if (!row) return [];

    switch (this.state.resourceType()) {
      case 'character': {
        const c = row as Character;
        return [
          { label: 'Nombre', value: c.name },
          { label: 'Estado', value: c.status },
          { label: 'Especie', value: c.species },
          { label: 'Género', value: c.gender },
          { label: 'Origen', value: c.origin.name },
          { label: 'Ubicación', value: c.location.name },
          { label: 'Episodios', value: String(c.episode.length) },
          { label: 'Creado', value: new Date(c.created).toLocaleDateString() },
        ];
      }
      case 'episode': {
        const e = row as Episode;
        return [
          { label: 'Nombre', value: e.name },
          { label: 'Código', value: e.episode },
          { label: 'Fecha emisión', value: e.air_date },
          { label: 'Personajes', value: String(e.characters.length) },
          { label: 'Creado', value: new Date(e.created).toLocaleDateString() },
        ];
      }
      case 'location': {
        const l = row as Location;
        return [
          { label: 'Nombre', value: l.name },
          { label: 'Tipo', value: l.type },
          { label: 'Dimensión', value: l.dimension },
          { label: 'Residentes', value: String(l.residents.length) },
          { label: 'Creado', value: new Date(l.created).toLocaleDateString() },
        ];
      }
    }
  });

  /**
   * Maneja el cambio de recurso en el select.
   * Delega al servicio el cambio de recurso y el reinicio del filtro.
   *
   * @param option - Opción seleccionada por el usuario
   */
  onResourceChange(option: SelectOption): void {
    const type = option.value as 'character' | 'episode' | 'location';
    this.state.setResource(type);
  }

  /**
   * Maneja el cambio de filtro de status en el select.
   * Delega al servicio la actualización del filtro.
   *
   * @param option - Opción de filtro seleccionada por el usuario
   */
  onFilterChange(option: SelectOption): void {
    this.state.setFilter(option.value);
  }

  /**
   * Maneja las acciones emitidas por la tabla al interactuar con los botones de cada fila.
   * - Si la acción es 'view', abre el modal de detalle.
   * - Si la acción es 'delete', abre el modal de confirmación de eliminación.
   *
   * @param action - Objeto con el tipo de acción y la fila asociada
   */
  onTableAction(action: TableAction<Resource>): void {
    if (action.action === 'view') {
      this.state.selectRow(action.row);
    }
    if (action.action === 'delete') {
      this.pendingDelete.set(action.row);
    }
  }

  /**
   * Confirma la eliminación del registro pendiente.
   * Remueve la fila del estado local y cierra el modal de confirmación.
   */
  confirmDelete(): void {
    const row = this.pendingDelete();
    if (row) {
      this.state.removeRow(row);
      this.pendingDelete.set(null);
    }
  }

  /** Cancela la eliminación y cierra el modal de confirmación sin eliminar el registro */
  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  /** Cierra el modal de detalle limpiando la fila seleccionada */
  closeModal(): void {
    this.state.clearSelection();
  }
}
