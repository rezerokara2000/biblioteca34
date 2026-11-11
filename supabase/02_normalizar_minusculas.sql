-- =====================================================
-- Normaliza tags y personajes a minúsculas, sin espacios sobrantes,
-- sin vacíos y sin repetidos (conserva el orden).
-- Así la búsqueda "Rem" encuentra "rem".
-- Ejecútalo una vez en Supabase > SQL Editor.
-- =====================================================

create or replace function public.normalizar_arrays()
returns trigger
language plpgsql
as $$
begin
  new.tags := coalesce((
    select array_agg(x order by o)
    from (
      select lower(trim(t)) as x, min(n) as o
      from unnest(new.tags) with ordinality as u(t, n)
      where trim(t) <> ''
      group by 1
    ) s
  ), '{}'::text[]);

  new.personajes := coalesce((
    select array_agg(x order by o)
    from (
      select lower(trim(t)) as x, min(n) as o
      from unnest(new.personajes) with ordinality as u(t, n)
      where trim(t) <> ''
      group by 1
    ) s
  ), '{}'::text[]);

  return new;
end;
$$;

create trigger trg_normalizar_imagenes
  before insert or update on public.imagenes
  for each row execute function public.normalizar_arrays();

create trigger trg_normalizar_colecciones
  before insert or update on public.colecciones
  for each row execute function public.normalizar_arrays();

-- Normaliza lo que ya existe
update public.imagenes    set tags = tags;
update public.colecciones set tags = tags;
