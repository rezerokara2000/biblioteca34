import { supabase } from './supabase';

export type Ambito = 'imagenes' | 'colecciones';

export type Sugerencia = {
  tipo: 'tag' | 'personaje' | 'artista';
  nombre: string;
  id: number | null;
  total: number;
};

export type SugerenciaIndexada = Sugerencia & { norm: string };

/** Minúsculas y sin tildes, para comparar lo que escribe el usuario. */
export const normalizar = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const VIGENCIA_MS = 10 * 60 * 1000; // el catálogo se reutiliza 10 minutos
const TAMANO_LOTE = 1000; // límite por consulta de Supabase

/**
 * Descarga la lista de tags, personajes y artistas desde la vista `sugerencias`
 * y la guarda en sessionStorage para no repetir la consulta en cada página.
 */
export async function cargarCatalogo(ambito: Ambito): Promise<SugerenciaIndexada[]> {
  const clave = `catalogo:${ambito}`;

  try {
    const guardado = sessionStorage.getItem(clave);
    if (guardado) {
      const { t, datos } = JSON.parse(guardado) as { t: number; datos: SugerenciaIndexada[] };
      if (Date.now() - t < VIGENCIA_MS) return datos;
    }
  } catch {
    /* sin sessionStorage: se descarga igual */
  }

  const filas: Sugerencia[] = [];
  for (let desde = 0; ; desde += TAMANO_LOTE) {
    const { data, error } = await supabase
      .from('sugerencias')
      .select('tipo, nombre, id, total')
      .eq('ambito', ambito)
      .order('tipo')
      .order('nombre')
      .order('id')
      .range(desde, desde + TAMANO_LOTE - 1);

    if (error) {
      console.error('No se pudo cargar el catálogo de sugerencias', error);
      break;
    }
    filas.push(...((data ?? []) as Sugerencia[]));
    if (!data || data.length < TAMANO_LOTE) break;
  }

  const datos = filas.map((f) => ({ ...f, norm: normalizar(f.nombre) }));

  if (datos.length) {
    try {
      sessionStorage.setItem(clave, JSON.stringify({ t: Date.now(), datos }));
    } catch {
      /* ignorar */
    }
  }
  return datos;
}
