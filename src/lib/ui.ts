import type { Clasif } from './supabase';

const BADGE_BASE = 'shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold';

/** Pinta la etiqueta SFW (verde) o NSFW (rojo). */
export function pintarBadge(el: HTMLElement, c: Clasif) {
  el.textContent = c;
  el.className = `${BADGE_BASE} ${
    c === 'SFW' ? 'border-emerald-400/70 text-emerald-400' : 'border-red-400/70 text-red-400'
  }`;
}

/** "#tag1, #tag2, #tag3" */
export function textoTags(tags: string[], max = 3): string {
  return tags
    .slice(0, max)
    .map((t) => `#${t}`)
    .join(', ');
}

/** true si es una URL http(s) válida (sirve para saber si hay tr_url real). */
export function esUrl(v: string | null | undefined): v is string {
  if (!v) return false;
  try {
    const u = new URL(v.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Miniatura optimizada. Solo actúa si PUBLIC_TRANSFORMAR_IMAGENES=true en el .env
 * (las transformaciones de imagen de Supabase requieren plan Pro).
 */
export function miniatura(url: string, ancho = 640): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${ancho}&q=75&output=webp`;
}

/** Chip enlazado (para tags y personajes). */
export function crearChip(texto: string, href: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = texto;
  a.className =
    'rounded-full border border-white/15 bg-panel px-3 py-1 text-sm text-white/80 transition hover:border-acento hover:text-acento';
  return a;
}
