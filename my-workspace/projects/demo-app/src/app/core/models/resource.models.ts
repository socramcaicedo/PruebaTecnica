/**
 * Modelos de datos para los recursos de la Rick and Morty API.
 *
 * Define las interfaces para cada recurso (Character, Episode, Location),
 * la respuesta paginada genérica de la API y los tipos auxiliares
 * utilizados en toda la aplicación.
 */

/**
 * Respuesta paginada estándar de la Rick and Morty API.
 * Contiene metadatos de paginación en `info` y los resultados en `results`.
 *
 * @typeparam T - Tipo de los recursos contenidos en el arreglo de resultados
 */
export interface ApiResponse<T> {
  /** Metadatos de paginación de la respuesta */
  info: {
    /** Cantidad total de registros en la API */
    count: number;
    /** Cantidad total de páginas disponibles */
    pages: number;
    /** URL de la siguiente página, o null si es la última */
    next: string | null;
    /** URL de la página anterior, o null si es la primera */
    prev: string | null;
  };
  /** Arreglo de resultados del recurso solicitado */
  results: T[];
}

/**
 * Representa un personaje de la serie Rick and Morty.
 * Obtenido del endpoint `GET /api/character`.
 */
export interface Character {
  /** Identificador único del personaje */
  id: number;
  /** Nombre del personaje */
  name: string;
  /** Estado de vida: Alive, Dead o Unknown */
  status: string;
  /** Especie del personaje (Human, Alien, etc.) */
  species: string;
  /** Subtipo o categoría adicional del personaje */
  type: string;
  /** Género del personaje (Male, Female, Genderless, Unknown) */
  gender: string;
  /** Lugar de origen del personaje */
  origin: { name: string; url: string };
  /** Última ubicación conocida del personaje */
  location: { name: string; url: string };
  /** URL de la imagen del personaje */
  image: string;
  /** Lista de URLs de los episodios donde aparece el personaje */
  episode: string[];
  /** URL del endpoint del personaje en la API */
  url: string;
  /** Fecha de creación del registro en la API */
  created: string;
}

/**
 * Representa un episodio de la serie Rick and Morty.
 * Obtenido del endpoint `GET /api/episode`.
 */
export interface Episode {
  /** Identificador único del episodio */
  id: number;
  /** Nombre del episodio */
  name: string;
  /** Fecha de emisión del episodio */
  air_date: string;
  /** Código del episodio (ej. S01E01) */
  episode: string;
  /** Lista de URLs de los personajes que aparecen en el episodio */
  characters: string[];
  /** URL del endpoint del episodio en la API */
  url: string;
  /** Fecha de creación del registro en la API */
  created: string;
}

/**
 * Representa una ubicación del multiverso de Rick and Morty.
 * Obtenido del endpoint `GET /api/location`.
 */
export interface Location {
  /** Identificador único de la ubicación */
  id: number;
  /** Nombre de la ubicación */
  name: string;
  /** Tipo de ubicación (Planet, Space station, etc.) */
  type: string;
  /** Dimensión donde se encuentra la ubicación */
  dimension: string;
  /** Lista de URLs de los residentes de la ubicación */
  residents: string[];
  /** URL del endpoint de la ubicación en la API */
  url: string;
  /** Fecha de creación del registro en la API */
  created: string;
}

/**
 * Tipos de recurso disponibles en la Rick and Morty API.
 * Determina qué endpoint se consulta.
 */
export type ResourceType = 'character' | 'episode' | 'location';

/**
 * Unión de todos los tipos de recurso de la API.
 * Se usa para manejar cualquier recurso de forma genérica
 * en el servicio de estado y los componentes.
 */
export type Resource = Character | Episode | Location;
