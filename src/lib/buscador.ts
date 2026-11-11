import { supabase } from './supabase';
import { cargarCatalogo, normalizar, type Ambito, type SugerenciaIndexada } from './catalogo';
import { claveTermino, type Termino } from './terminos';

const ESTILO = {
  tag: {
    etiqueta: 'Etiqueta',
    chip: 'border-acento/60 bg-acento/10 text-acento',
    texto: 'text-acento',
  },
  personaje: {
    etiqueta: 'Personaje',
    chip: 'border-violet-400/60 bg-violet-400/10 text-violet-300',
    texto: 'text-violet-300',
  },
  artista: {
    etiqueta: 'Artista',
    chip: 'border-amber-400/60 bg-amber-400/10 text-amber-300',
    texto: 'text-amber-300',
  },
  texto: {
    etiqueta: 'Texto',
    chip: 'border-white/30 bg-white/5 text-white/80',
    texto: 'text-white/60',
  },
} as const;

const ORDEN_SECCIONES = ['artista', 'personaje', 'tag'] as const;
const MAX_POR_TIPO = 4;

type Opciones = {
  ambito: Ambito;
  /** Lista del estado: este módulo la modifica directamente (push / splice). */
  terminos: Termino[];
  alCambiar: () => void;
};

type Item = { termino: Termino; etiqueta: string; total: number | null };

const aTermino = (s: SugerenciaIndexada): Termino => ({
  tipo: s.tipo,
  valor: s.nombre,
  id: s.tipo === 'artista' ? (s.id ?? undefined) : undefined,
});

function textoChip(t: Termino): string {
  if (t.tipo === 'tag') return `#${t.valor}`;
  if (t.tipo === 'artista') return t.valor.startsWith('#') ? '@…' : `@${t.valor}`;
  if (t.tipo === 'texto') return `“${t.valor}”`;
  return t.valor;
}

export function iniciarBuscador({ ambito, terminos, alCambiar }: Opciones) {
  const caja = document.getElementById('buscador-caja')!;
  const chips = document.getElementById('buscador-chips')!;
  const input = document.getElementById('buscador') as HTMLInputElement;
  const lista = document.getElementById('buscador-sugerencias')!;
  const placeholderInicial = input.placeholder;

  let catalogo: SugerenciaIndexada[] = [];
  let items: Item[] = [];
  let activo = 0;

  // ---------- Chips ----------
  function pintarChips() {
    chips.replaceChildren(
      ...terminos.map((t, i) => {
        const chip = document.createElement('span');
        chip.className = `inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-sm ${ESTILO[t.tipo].chip}`;

        const texto = document.createElement('span');
        texto.textContent = textoChip(t);

        const quitar = document.createElement('button');
        quitar.type = 'button';
        quitar.textContent = '✕';
        quitar.setAttribute('aria-label', `Quitar ${t.valor}`);
        quitar.className = 'flex h-5 w-5 items-center justify-center rounded-full text-xs hover:bg-white/15';
        quitar.addEventListener('click', (ev) => {
          ev.stopPropagation();
          quitarTermino(i);
        });

        chip.append(texto, quitar);
        return chip;
      }),
    );
    input.placeholder = terminos.length ? 'Agregar más…' : placeholderInicial;
  }

  function agregar(t: Termino) {
    if (!terminos.some((x) => claveTermino(x) === claveTermino(t))) terminos.push(t);
    input.value = '';
    cerrar();
    pintarChips();
    alCambiar();
    input.focus();
  }

  function quitarTermino(i: number) {
    terminos.splice(i, 1);
    pintarChips();
    alCambiar();
    input.focus();
  }

  // ---------- Sugerencias ----------
  function calcular() {
    const q = normalizar(input.value);
    items = [];

    if (q) {
      const usados = new Set(terminos.map(claveTermino));
      const coincidencias = catalogo.filter(
        (s) => s.norm.includes(q) && !usados.has(claveTermino(aTermino(s))),
      );
      const puntaje = (s: SugerenciaIndexada) => (s.norm.startsWith(q) ? 0 : 1);
      coincidencias.sort(
        (a, b) => puntaje(a) - puntaje(b) || b.total - a.total || a.norm.localeCompare(b.norm),
      );

      for (const tipo of ORDEN_SECCIONES) {
        coincidencias
          .filter((s) => s.tipo === tipo)
          .slice(0, MAX_POR_TIPO)
          .forEach((s) =>
            items.push({ termino: aTermino(s), etiqueta: ESTILO[s.tipo].etiqueta, total: s.total }),
          );
      }

      // Siempre se puede buscar el texto tal cual (útil para títulos).
      items.push({ termino: { tipo: 'texto', valor: input.value.trim() }, etiqueta: 'Buscar texto', total: null });
    }

    activo = 0;
    pintarLista();
  }

  function marcar() {
    [...lista.children].forEach((li, i) => {
      li.classList.toggle('bg-white/10', i === activo);
      li.setAttribute('aria-selected', String(i === activo));
    });
  }

  function pintarLista() {
    lista.replaceChildren(
      ...items.map((it, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.className = 'flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm';

        const izquierda = document.createElement('span');
        izquierda.className = 'flex min-w-0 items-center gap-3';

        const etiqueta = document.createElement('span');
        etiqueta.className = `w-20 shrink-0 text-xs font-semibold uppercase ${ESTILO[it.termino.tipo].texto}`;
        etiqueta.textContent = it.etiqueta;

        const nombre = document.createElement('span');
        nombre.className = 'truncate';
        nombre.textContent = it.termino.tipo === 'texto' ? `“${it.termino.valor}”` : it.termino.valor;

        izquierda.append(etiqueta, nombre);
        li.appendChild(izquierda);

        if (it.total !== null) {
          const total = document.createElement('span');
          total.className = 'shrink-0 text-xs text-white/40';
          total.textContent = String(it.total);
          li.appendChild(total);
        }

        // mousedown (no click) para que el input no pierda el foco antes de elegir
        li.addEventListener('mousedown', (ev) => {
          ev.preventDefault();
          agregar(it.termino);
        });
        li.addEventListener('mouseenter', () => {
          activo = i;
          marcar();
        });
        return li;
      }),
    );

    const abrir = items.length > 0 && document.activeElement === input;
    lista.classList.toggle('hidden', !abrir);
    input.setAttribute('aria-expanded', String(abrir));
    marcar();
  }

  function cerrar() {
    items = [];
    lista.classList.add('hidden');
    input.setAttribute('aria-expanded', 'false');
  }

  // ---------- Eventos ----------
  input.addEventListener('input', calcular);
  input.addEventListener('focus', calcular);
  input.addEventListener('blur', cerrar);
  caja.addEventListener('click', () => input.focus());

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      if (!items.length) return;
      ev.preventDefault();
      const paso = ev.key === 'ArrowDown' ? 1 : -1;
      activo = (activo + paso + items.length) % items.length;
      marcar();
      lista.children[activo]?.scrollIntoView({ block: 'nearest' });
    } else if (ev.key === 'Enter') {
      if (!items.length) return;
      ev.preventDefault();
      agregar(items[activo].termino);
    } else if (ev.key === 'Escape') {
      cerrar();
    } else if (ev.key === 'Backspace' && input.value === '' && terminos.length) {
      quitarTermino(terminos.length - 1);
    }
  });

  // ---------- Catálogo ----------
  pintarChips();

  cargarCatalogo(ambito).then(async (datos) => {
    catalogo = datos;

    // Los artistas que vienen de la URL solo traen el id: se completa el nombre.
    const pendientes = terminos.filter((t) => t.tipo === 'artista' && t.valor.startsWith('#'));
    for (const t of pendientes) {
      const s = datos.find((x) => x.tipo === 'artista' && x.id === t.id);
      if (s) t.valor = s.nombre;
    }

    const sinNombre = pendientes.filter((t) => t.valor.startsWith('#'));
    if (sinNombre.length) {
      const { data } = await supabase
        .from('artistas')
        .select('id, nombre')
        .in('id', sinNombre.map((t) => t.id));
      (data ?? []).forEach((a: { id: number; nombre: string }) => {
        const t = sinNombre.find((x) => x.id === a.id);
        if (t) t.valor = a.nombre;
      });
    }

    if (pendientes.length) pintarChips();
    if (document.activeElement === input) calcular();
  });
}
