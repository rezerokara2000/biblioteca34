import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
);

export type Clasif = 'SFW' | 'NSFW';

export type Artista = {
  id: number;
  nombre: string;
  avatar_url: string | null;
  twitter: string | null;
  patreon: string | null;
  pixiv: string | null;
  imagenes: { count: number }[];
};

type ArtistaMin = { id: number; nombre: string } | null;

export type ImagenLista = {
  id: number;
  titulo: string;
  og_url: string;
  clasificacion: Clasif;
  tags: string[];
  personajes: string[];
  artista: ArtistaMin;
};

export type ImagenDetalle = ImagenLista & {
  tr_url: string | null;
  orden_coleccion: number | null;
  coleccion: { id: number; titulo: string } | null;
};

export type ColeccionLista = {
  id: number;
  titulo: string;
  portada_url: string | null;
  clasificacion: Clasif;
  tags: string[];
  personajes: string[];
  artista: ArtistaMin;
  imagenes: { count: number }[];
};

export type PaginaColeccion = {
  id: number;
  titulo: string;
  og_url: string;
  tr_url: string | null;
};
