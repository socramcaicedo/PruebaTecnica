/**
 * Punto de exportación único de la librería ui-lib.
 *
 * Todos los componentes y tipos se exportan desde este archivo.
 * La aplicación demo debe importar exclusivamente desde aquí
 * y nunca acceder directamente a archivos internos de la librería.
 */

// Componentes
export { Button } from './lib/button/button';
export { Card } from './lib/card/card';
export { Select } from './lib/select/select';
export { Table } from './lib/table/table';

// Tipos e interfaces
export type { SelectOption } from './lib/select/select';
export type { TableColumn, TableAction } from './lib/table/table';
