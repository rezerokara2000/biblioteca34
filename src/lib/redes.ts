// Convierte lo guardado en la BD (usuario o URL) en un enlace completo.

const esUrl = (v: string) => /^https?:\/\//i.test(v);
const limpiar = (v: string) => v.trim().replace(/^@/, '');

export function urlTwitter(v: string | null): string | null {
  if (!v) return null;
  return esUrl(v) ? v : `https://x.com/${limpiar(v)}`;
}

export function urlPatreon(v: string | null): string | null {
  if (!v) return null;
  return esUrl(v) ? v : `https://www.patreon.com/${limpiar(v)}`;
}

export function urlPixiv(v: string | null): string | null {
  if (!v) return null;
  if (esUrl(v)) return v;
  return /^\d+$/.test(v.trim())
    ? `https://www.pixiv.net/users/${v.trim()}`
    : `https://www.pixiv.net/${limpiar(v)}`;
}
