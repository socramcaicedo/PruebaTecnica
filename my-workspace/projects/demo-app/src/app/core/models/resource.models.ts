/** Respuesta paginada de la Rick & Morty API */
export interface ApiResponse<T> {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: T[];
}

/** Recurso Character — GET /api/character */
export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

/** Recurso Episode — GET /api/episode */
export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

/** Recurso Location — GET /api/location */
export interface Location {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[];
  url: string;
  created: string;
}

/** Tipos de recurso disponibles en la API */
export type ResourceType = 'character' | 'episode' | 'location';

/** Unión de todos los recursos */
export type Resource = Character | Episode | Location;
