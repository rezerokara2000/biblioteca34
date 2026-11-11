import type { Clasif } from './supabase';
import type { Ambito } from './catalogo';
import { iniciarBuscador } from './buscador';
import { terminosDesdeUrl, terminosAUrl, type Termino } from './terminos';

export type Estado = {
  terminos: Termino[]; // chips del buscador (artistas, personajes, tags, texto)
  c: Clasif | null; // SFW / NSFW
  p: number; // página
};

/** Lee el estado desde la URL (?tag=rem&per=...&art=5&c=SFW&p=2). */
function leerEstado(): Estado {
  const u = new URLSearchParams(location.search);
  const c = u.get('c');
  const p = parseInt(u.get('p') ?? '1', 10);
  return {
    terminos: terminosDesdeUrl(u),
    c: c === 'SFW' || c === 'NSFW' ? c : null,
    p: Number.isFinite(p) && p > 0 ? p : 1,
  };
}

function escribirEstado(e: Estado) {
  const u = new URLSearchParams();
  terminosAUrl(u, e.terminos);
  if (e.c) u.set('c', e.c);
  if (e.p > 1) u.set('p', String(e.p));
  const s = u.toString();
  history.replaceState(null, '', s ? `?${s}` : location.pathname);
}

/**
 * Conecta el buscador con chips y los botones #btn-sfw / #btn-nsfw.
 * Llama a `alCambiar` al inicio y cada vez que cambie el estado.
 * Todo queda guardado en la URL, así "Atrás" vuelve al mismo punto.
 */
export function iniciarFiltros(ambito: Ambito, alCambiar: (e: Estado) => void) {
  const btnSfw = document.getElementById('btn-sfw')!;
  const btnNsfw = document.getElementById('btn-nsfw')!;

  const estado = leerEstado();

  const pintar = () => {
    btnSfw.setAttribute('aria-pressed', String(estado.c === 'SFW'));
    btnNsfw.setAttribute('aria-pressed', String(estado.c === 'NSFW'));
  };

  const aplicar = (reiniciarPagina: boolean) => {
    if (reiniciarPagina) estado.p = 1;
    escribirEstado(estado);
    alCambiar({ ...estado, terminos: [...estado.terminos] });
  };

  // El buscador modifica estado.terminos directamente y avisa cuando cambia.
  iniciarBuscador({ ambito, terminos: estado.terminos, alCambiar: () => aplicar(true) });

  btnSfw.addEventListener('click', () => {
    estado.c = estado.c === 'SFW' ? null : 'SFW';
    pintar();
    aplicar(true);
  });

  btnNsfw.addEventListener('click', () => {
    estado.c = estado.c === 'NSFW' ? null : 'NSFW';
    pintar();
    aplicar(true);
  });

  pintar();
  aplicar(false);

  return {
    irAPagina(p: number) {
      estado.p = p;
      aplicar(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  };
}
