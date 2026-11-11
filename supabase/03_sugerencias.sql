-- =====================================================
-- Vista para las sugerencias del buscador.
-- Lista, por cada sección (imagenes / colecciones), los tags, personajes
-- y artistas que existen, con cuántos elementos tiene cada uno.
-- Se actualiza sola cuando cambian tus datos: no hay nada que mantener.
-- Ejecútalo una vez en Supabase > SQL Editor.
-- =====================================================

create or replace view public.sugerencias
with (security_invoker = true) as

  select 'imagenes'::text as ambito, 'tag'::text as tipo, t as nombre,
         null::bigint as id, count(*)::int as total
  from public.imagenes, unnest(tags) as t
  group by t

  union all
  select 'imagenes', 'personaje', p, null::bigint, count(*)::int
  from public.imagenes, unnest(personajes) as p
  group by p

  union all
  select 'imagenes', 'artista', a.nombre, a.id, count(i.id)::int
  from public.artistas a
  join public.imagenes i on i.artista_id = a.id
  group by a.id, a.nombre

  union all
  select 'colecciones', 'tag', t, null::bigint, count(*)::int
  from public.colecciones, unnest(tags) as t
  group by t

  union all
  select 'colecciones', 'personaje', p, null::bigint, count(*)::int
  from public.colecciones, unnest(personajes) as p
  group by p

  union all
  select 'colecciones', 'artista', a.nombre, a.id, count(c.id)::int
  from public.artistas a
  join public.colecciones c on c.artista_id = a.id
  group by a.id, a.nombre;

grant select on public.sugerencias to anon, authenticated;
