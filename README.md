# Artistas, imágenes y colecciones (Astro + Tailwind + Supabase)

## Puesta en marcha

```bash
npm install
cp .env.example .env     # completa URL y anon key de Supabase
npm run dev              # http://localhost:4321
```

Base de datos (SQL Editor de Supabase, en este orden):

1. `schema.sql` (tablas, índices y RLS de lectura pública)
2. `supabase/02_normalizar_minusculas.sql` (tags y personajes siempre en minúsculas)

## Páginas

| Ruta                  | Qué hace                                                        |
| --------------------- | --------------------------------------------------------------- |
| `/`                   | Artistas con buscador en tiempo real                            |
| `/imagenes`           | Explorador: buscador, SFW/NSFW, 30 por página                   |
| `/imagenes?artista=5` | Imágenes de un artista                                          |
| `/imagen?id=12`       | Detalle: imagen completa, tags, personajes, artista, colección  |
| `/colecciones`        | Listado de colecciones (24 por página)                          |
| `/coleccion?id=3`     | Visor de lectura continua en orden                              |

## Cómo buscar

Los términos se separan con **comas**; todos deben cumplirse:

- `rem, subaru` → imágenes con "rem" y "subaru" (en tags o personajes)
- `marin kitagawa` → un solo término con espacio
- `#sfw` / `#nsfw` → filtra por clasificación (igual que los botones)
- Sin SFW/NSFW activos se muestra todo.

En colecciones el término también busca dentro del título.

## OG / TR

El selector OG/TR solo aparece si existe una `tr_url` válida. En una colección,
las páginas sin traducción siguen mostrando el original.

## Miniaturas optimizadas (opcional)

Con plan Pro de Supabase puedes activar transformaciones de imagen
añadiendo esto al `.env`:

```
PUBLIC_TRANSFORMAR_IMAGENES=true
```

Las miniaturas se piden a menor resolución; el detalle siempre usa la original.
