-- =====================================================
-- Esquema para Supabase (PostgreSQL)
-- Tablas: artistas, colecciones, imagenes
-- Pégalo completo en Supabase > SQL Editor > Run
-- =====================================================

-- 1. ENUM de clasificación
create type public.clasificacion_tipo as enum ('SFW', 'NSFW');

-- 2. Tabla artistas
create table public.artistas (
  id         bigint generated always as identity primary key,
  nombre     text not null,
  avatar_url text,   -- URL pública de Supabase Storage
  twitter    text,
  patreon    text,
  pixiv      text,
  created_at timestamptz not null default now()
);

-- 3. Tabla colecciones
create table public.colecciones (
  id            bigint generated always as identity primary key,
  titulo        text not null,
  artista_id    bigint not null references public.artistas (id) on delete cascade,
  portada_url   text,
  tags          text[] not null default '{}',
  personajes    text[] not null default '{}',
  clasificacion public.clasificacion_tipo not null default 'SFW',
  created_at    timestamptz not null default now()
);

-- 4. Tabla imagenes
create table public.imagenes (
  id              bigint generated always as identity primary key,
  titulo          text not null,
  artista_id      bigint not null references public.artistas (id) on delete cascade,
  coleccion_id    bigint references public.colecciones (id) on delete set null,
  orden_coleccion integer,
  personajes      text[] not null default '{}',
  tags            text[] not null default '{}',
  clasificacion   public.clasificacion_tipo not null default 'SFW',
  og_url          text not null,  -- imagen original
  tr_url          text,           -- imagen traducida (opcional)
  created_at      timestamptz not null default now(),

  -- Si hay orden, debe haber colección
  constraint orden_requiere_coleccion
    check (orden_coleccion is null or coleccion_id is not null)
);

-- 5. Índices (claves foráneas y búsquedas)
create index idx_colecciones_artista   on public.colecciones (artista_id);
create index idx_imagenes_artista      on public.imagenes (artista_id);
create index idx_imagenes_coleccion    on public.imagenes (coleccion_id, orden_coleccion);

create index idx_colecciones_tags       on public.colecciones using gin (tags);
create index idx_colecciones_personajes on public.colecciones using gin (personajes);
create index idx_imagenes_tags          on public.imagenes using gin (tags);
create index idx_imagenes_personajes    on public.imagenes using gin (personajes);

create index idx_colecciones_clasif on public.colecciones (clasificacion);
create index idx_imagenes_clasif    on public.imagenes (clasificacion);

-- 6. Row Level Security: lectura pública, escritura solo con service_role / usuarios autenticados
alter table public.artistas    enable row level security;
alter table public.colecciones enable row level security;
alter table public.imagenes    enable row level security;

create policy "Lectura pública artistas"
  on public.artistas for select to anon, authenticated using (true);

create policy "Lectura pública colecciones"
  on public.colecciones for select to anon, authenticated using (true);

create policy "Lectura pública imagenes"
  on public.imagenes for select to anon, authenticated using (true);

-- (Opcional) permitir escritura a usuarios autenticados:
-- create policy "Escritura autenticados artistas"
--   on public.artistas for all to authenticated using (true) with check (true);
-- create policy "Escritura autenticados colecciones"
--   on public.colecciones for all to authenticated using (true) with check (true);
-- create policy "Escritura autenticados imagenes"
--   on public.imagenes for all to authenticated using (true) with check (true);
