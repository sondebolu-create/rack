-- TEST-ONLY. Recreates the small slice of a Supabase project that our migrations lean on,
-- so they can run against plain Postgres (no Docker). Never run this against the hosted
-- project: it already has all of this.
--
--   psql -d rack_test -f supabase/tests/00_supabase_shim.sql
--   for f in supabase/migrations/*.sql; do psql -d rack_test -v ON_ERROR_STOP=1 -f $f; done
--   psql -d rack_test -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (
  id uuid primary key,
  email text,
  phone text,
  raw_user_meta_data jsonb not null default '{}'
);

-- Same lookup as Supabase's auth.uid(): the `sub` claim of the request JWT.
create function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

create schema storage;
create table storage.buckets (
  id text primary key, name text not null, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text, owner uuid
);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language plpgsql as $$
declare _parts text[];
begin
  select string_to_array(name, '/') into _parts;
  return _parts[1:array_length(_parts, 1) - 1];
end $$;

-- Supabase grants the API roles broad access and lets RLS / column grants do the narrowing.
grant usage on schema public, auth, storage to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant execute on function storage.foldername(text) to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
grant all on storage.objects, storage.buckets to anon, authenticated, service_role;
