export interface Anime {
  nombre: string;
  genero: string[];
  demografia: string;
  estudioAnimacion: string;
  añoDebut: number;
  añoFinalizacion: number | null;
  capitulos: number;
  autor: string;
}

export type AnimeData = Anime[]; 