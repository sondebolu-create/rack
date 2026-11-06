-- Rack backend, part 1: enums, profiles, applications.
-- Requirement refs: M1 (auth), V1 (vendor application), V2 (admin approval).

-- ---------------------------------------------------------------- enums
create type public.user_role          as enum ('shopper', 'vendor', 'admin');
create type public.application_status as enum ('pending', 'approved', 'rejected');
-- Same values as SIZES in lib/types.ts.
create type public.size               as enum ('XS', 'S', 'M', 'L', 'XL', 'XXL');
create type public.gender_focus       as enum ('women', 'men', 'both');
create type public.shop_status        as enum ('draft', 'live');
create type public.product_status     as enum ('draft', 'published', 'archived');
create type public.order_status       as enum ('pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
create type public.fulfillment_status as enum ('reserved', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- ---------------------------------------------------------------- shared trigger
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null default 'shopper',
  full_name  text,
  phone      text,
  city       text,
  created_at timestamptz not null default now()
);

-- Helpers used by RLS policies. SECURITY DEFINER so a policy on one table can look at
-- another table (or profiles itself) without recursing into that table's own RLS.
create function public.is_admin() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.is_vendor() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('vendor', 'admin'));
$$;

-- Create a profile for every new auth user. The role is ALWAYS 'shopper': it is never read
-- from sign-up metadata, which the client controls.
create function public.handle_new_user() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), ''),
    nullif(trim(coalesce(new.phone, '')), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles: read own"   on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles: admin read" on public.profiles for select to authenticated
  using (public.is_admin());
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- "Nobody can change their own role." Enforced with column privileges, not just a policy:
-- clients may update only these three columns, so `role` (and `id`) can only change through
-- a SECURITY DEFINER function such as approve_vendor. No client INSERT/DELETE either: rows
-- come from the sign-up trigger and cascade from auth.users.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone, city) on public.profiles to authenticated;

-- ---------------------------------------------------------------- vendor_applications
create table public.vendor_applications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  business_name     text not null check (length(trim(business_name)) > 0),
  instagram_handle  text,
  phone             text not null,
  city              text not null,
  categories        text[] not null default '{}',
  sample_photo_urls text[] not null default '{}',
  note              text,
  status            public.application_status not null default 'pending',
  created_at        timestamptz not null default now(),
  reviewed_at       timestamptz,
  reviewed_by       uuid references public.profiles (id),
  review_note       text
);

-- One open application per person.
create unique index vendor_applications_one_pending
  on public.vendor_applications (user_id) where status = 'pending';

alter table public.vendor_applications enable row level security;

create policy "applications: read own"   on public.vendor_applications for select to authenticated
  using (user_id = auth.uid());
create policy "applications: admin read" on public.vendor_applications for select to authenticated
  using (public.is_admin());
create policy "applications: apply"      on public.vendor_applications for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and reviewed_at is null);
-- Admins may reject directly. Approval goes through approve_vendor(), which also grants the
-- role and creates the shop, so a bare `status = 'approved'` update is refused.
create policy "applications: admin reject" on public.vendor_applications for update to authenticated
  using (public.is_admin() and status = 'pending')
  with check (public.is_admin() and status = 'rejected');

revoke insert, update, delete on public.vendor_applications from anon, authenticated;
grant insert (user_id, business_name, instagram_handle, phone, city, categories, sample_photo_urls, note)
  on public.vendor_applications to authenticated;
grant update (status, reviewed_at, reviewed_by, review_note) on public.vendor_applications to authenticated;
