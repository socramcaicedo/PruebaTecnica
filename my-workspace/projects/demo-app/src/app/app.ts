import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Table, TableAction, TableColumn, Select, SelectOption } from 'ui-lib';
import { ResourceState } from './core/services/resource-state';
import { Resource } from './core/models/resource.models';

@Component({
  selector: 'app-root',
  imports: [Table, Select, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly state = inject(ResourceState);

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
    const type = this.state.resourceType();
    switch (type) {
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

  onResourceChange(option: SelectOption): void {
    this.state.setResource(option.value as 'character' | 'episode' | 'location');
  }

  onFilterChange(option: SelectOption): void {
    this.state.setFilter(option.value);
  }

  onTableAction(action: TableAction<Resource>): void {
    if (action.action === 'view') {
      this.state.selectRow(action.row);
    }
    // delete: el output emite correctamente, eliminación real es opcional según PDF
    if (action.action === 'delete') {
      console.log('Eliminar:', action.row);
    }
  }

  closeModal(): void {
    this.state.clearSelection();
  }
}
