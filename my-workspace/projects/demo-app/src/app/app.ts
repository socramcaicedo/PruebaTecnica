import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Card, Select, SelectOption, Table, TableColumn, TableAction, Button } from 'ui-lib';

import { ResourceState } from './core/services/resource-state';
import { Character, Episode, Location, Resource } from './core/models/resource.models';

@Component({
  selector: 'app-root',
  imports: [Table, Select, Card, Button],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly state = inject(ResourceState);

  readonly pendingDelete = signal<Resource | null>(null);

  readonly resourceOptions: SelectOption[] = [
    { label: 'Characters', value: 'character' },
    { label: 'Episodes', value: 'episode' },
    { label: 'Locations', value: 'location' },
  ];

  readonly filterOptions: SelectOption[] = [
    { label: 'Alive', value: 'Alive' },
    { label: 'Dead', value: 'Dead' },
    { label: 'Unknown', value: 'Unknown' },
  ];

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

  readonly detailTitle = computed(() => {
    const row = this.state.selectedRow();
    return row ? (row as Character | Episode | Location).name : '';
  });

  readonly detailSubtitle = computed(() => {
    const type = this.state.resourceType();
    return type.charAt(0).toUpperCase() + type.slice(1);
  });

  readonly detailImage = computed<string | null>(() => {
    const row = this.state.selectedRow();
    return this.state.resourceType() === 'character' && row ? (row as Character).image : null;
  });

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

  onResourceChange(option: SelectOption): void {
    const type = option.value as 'character' | 'episode' | 'location';
    this.state.setResource(type);
  }

  onFilterChange(option: SelectOption): void {
    this.state.setFilter(option.value);
  }

  onTableAction(action: TableAction<Resource>): void {
    if (action.action === 'view') {
      this.state.selectRow(action.row);
    }
    if (action.action === 'delete') {
      this.pendingDelete.set(action.row);
    }
  }

  confirmDelete(): void {
    const row = this.pendingDelete();
    if (row) {
      this.state.removeRow(row);
      this.pendingDelete.set(null);
    }
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  closeModal(): void {
    this.state.clearSelection();
  }
}
