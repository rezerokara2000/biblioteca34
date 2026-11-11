/** Un "chip" del buscador: una etiqueta, un personaje, un artista o un texto libre. */
export type TipoTermino = 'tag' | 'personaje' | 'artista' | 'texto';

export type Termino = {
  tipo: TipoTermino;
  valor: string; // nombre mostrado (para artista, el nombre)
  id?: number; // solo artistas
};

// Nombre de cada tipo en la URL: ?tag=rem&per=marin kitagawa&art=5&txt=playa
const PARAM: Record<TipoTermino, string> = {
  tag: 'tag',
  personaje: 'per',
  artista: 'art',
  texto: 'txt',
};

export const claveTermino = (t: Termino) => `${t.tipo}:${t.tipo === 'artista' ? t.id : t.valor}`;

export function terminosDesdeUrl(u: URLSearchParams): Termino[] {
  const lista: Termino[] = [];
  const agregar = (t: Termino) => {
    if (!lista.some((x) => claveTermino(x) === claveTermino(t))) lista.push(t);
  };

  for (const v of u.getAll(PARAM.tag)) if (v.trim()) agregar({ tipo: 'tag', valor: v.trim() });
  for (const v of u.getAll(PARAM.personaje)) if (v.trim()) agregar({ tipo: 'personaje', valor: v.trim() });
  for (const v of u.getAll(PARAM.texto)) if (v.trim()) agregar({ tipo: 'texto', valor: v.trim() });

  // "artista" es el nombre antiguo del parámetro; se sigue aceptando.
  for (const v of [...u.getAll(PARAM.artista), ...u.getAll('artista')]) {
    const id = parseInt(v, 10);
    // Mientras carga el catálogo el nombre es provisional ("#id").
    if (Number.isFinite(id)) agregar({ tipo: 'artista', valor: `#${id}`, id });
  }

  // "q" es el formato antiguo (términos separados por comas): se lee como texto libre.
  for (const v of u.getAll('q')) {
    for (const parte of v.split(',')) {
      const t = parte.trim().replace(/^#+/, '');
      if (t) agregar({ tipo: 'texto', valor: t });
    }
  }
  return lista;
}

export function terminosAUrl(u: URLSearchParams, terminos: Termino[]) {
  for (const t of terminos) {
    if (t.tipo === 'artista') u.append(PARAM.artista, String(t.id));
    else u.append(PARAM[t.tipo], t.valor);
  }
}
