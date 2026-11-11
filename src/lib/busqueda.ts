import type { Termino } from './terminos';

type Filtrable<T> = {
  contains(columna: string, valor: unknown): T;
  ilike(columna: string, patron: string): T;
  in(columna: string, valores: unknown[]): T;
};

/**
 * Aplica los chips del buscador a una consulta de Supabase (imágenes o colecciones):
 *  - tag / personaje: el elemento debe tenerlos todos (AND).
 *  - artista: si hay varios, basta con que sea de cualquiera de ellos (OR).
 *  - texto: el título debe contenerlo.
 */
export function aplicarTerminos<T extends Filtrable<T>>(consulta: T, terminos: Termino[]): T {
  const artistas = terminos.filter((t) => t.tipo === 'artista' && t.id != null).map((t) => t.id!);
  if (artistas.length) consulta = consulta.in('artista_id', artistas);

  for (const t of terminos) {
    if (t.tipo === 'tag') consulta = consulta.contains('tags', [t.valor]);
    else if (t.tipo === 'personaje') consulta = consulta.contains('personajes', [t.valor]);
    else if (t.tipo === 'texto') {
      const limpio = t.valor.replace(/[%_\\]/g, '');
      if (limpio) consulta = consulta.ilike('titulo', `%${limpio}%`);
    }
  }
  return consulta;
}
