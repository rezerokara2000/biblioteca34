/** Dibuja « 1 … 4 5 6 … 20 » dentro del contenedor. */
export function pintarPaginacion(
  contenedor: HTMLElement,
  actual: number,
  total: number,
  ir: (pagina: number) => void,
) {
  contenedor.replaceChildren();
  if (total <= 1) return;

  const base =
    'min-w-10 rounded-lg border px-3 py-2 text-sm transition disabled:cursor-default disabled:opacity-40';
  const inactivo = 'border-white/10 bg-panel text-white/80 hover:border-acento hover:text-acento';
  const activo = 'border-acento text-acento shadow-[0_0_10px_rgba(34,211,238,0.35)]';

  const boton = (texto: string, pagina: number, opts: { activo?: boolean; off?: boolean; label?: string } = {}) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = texto;
    b.className = `${base} ${opts.activo ? activo : inactivo}`;
    if (opts.label) b.setAttribute('aria-label', opts.label);
    if (opts.activo) b.setAttribute('aria-current', 'page');
    if (opts.off) b.disabled = true;
    else b.addEventListener('click', () => ir(pagina));
    return b;
  };

  const visibles = new Set<number>([1, total, actual - 1, actual, actual + 1]);
  const lista = [...visibles].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  contenedor.appendChild(boton('‹', actual - 1, { off: actual === 1, label: 'Página anterior' }));

  let previa = 0;
  for (const p of lista) {
    if (p - previa > 1) {
      const puntos = document.createElement('span');
      puntos.textContent = '…';
      puntos.className = 'px-1 text-white/40';
      contenedor.appendChild(puntos);
    }
    contenedor.appendChild(boton(String(p), p, { activo: p === actual }));
    previa = p;
  }

  contenedor.appendChild(boton('›', actual + 1, { off: actual === total, label: 'Página siguiente' }));
}
