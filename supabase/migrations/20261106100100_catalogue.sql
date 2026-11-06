-- Rack backend, part 2: shops, products, images, variants (M2-M4, V2, V3).
-- Money is an integer in minor units (kobo) plus a currency, per CLAUDE.md.

-- ---------------------------------------------------------------- tables
create table public.shops (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  name         text not null check (length(trim(name)) > 0),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description  text,
  logo_url     text,
  banner_url   text,
  city         text,
  categories   text[] not null default '{}',
  gender_focus public.gender_focus not null default 'both',
  status       public.shop_status not null default 'draft',
  featured     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index shops_owner_idx on public.shops (owner_id);
create trigger shops_updated_at before update on public.shops
  for each row execute function public.set_updated_at();

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops (id) on delete cascade,
  name        text not null check (length(trim(name)) > 0),
  description text,
  category    text not null,
  gender      public.gender_focus not null default 'both',
  price_minor integer not null check (price_minor >= 0),
  currency    text not null default 'NGN' check (currency in ('NGN', 'USD')),
  status      public.product_status not null default 'draft',
  featured    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index products_shop_idx on public.products (shop_id);
create index products_listing_idx on public.products (status, category);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  alt        text not null default '',  -- every image needs an accessibilityLabel
  position   integer not null default 0 check (position >= 0),
  unique (product_id, position)
);

create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  size        public.size not null,
  colour_name text not null,
  colour_hex  text not null check (colour_hex ~ '^#[0-9a-fA-F]{6}$'),
  stock       integer not null default 0 check (stock >= 0),
  sku         text,
  unique (product_id, size, colour_name)
);
create unique index product_variants_sku_idx on public.product_variants (sku) where sku is not null;

-- ---------------------------------------------------------------- policy helpers
create function public.owns_shop(p_shop_id uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.shops where id = p_shop_id and owner_id = auth.uid());
$$;

create function public.owns_product(p_product_id uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.products p join public.shops s on s.id = p.shop_id
    where p.id = p_product_id and s.owner_id = auth.uid()
  );
$$;

-- A product is public when it is published AND its shop is live.
create function public.product_is_public(p_product_id uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.products p join public.shops s on s.id = p.shop_id
    where p.id = p_product_id and p.status = 'published' and s.status = 'live'
  );
$$;

grant execute on function
  public.is_admin(), public.is_vendor(), public.owns_shop(uuid), public.owns_product(uuid), public.product_is_public(uuid)
  to anon, authenticated;

-- ---------------------------------------------------------------- RLS: shops
alter table public.shops enable row level security;

create policy "shops: read live"   on public.shops for select to anon, authenticated
  using (status = 'live');
create policy "shops: read own"    on public.shops for select to authenticated
  using (owner_id = auth.uid());
create policy "shops: admin all"   on public.shops for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "shops: create own"  on public.shops for insert to authenticated
  with check (owner_id = auth.uid() and public.is_vendor());
create policy "shops: edit own"    on public.shops for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Clients may only write these columns. `owner_id` is not updatable, so a shop can't be handed to
-- someone else. `featured` (paid placement) is writable here but guarded by a trigger below.
revoke insert, update, delete on public.shops from anon, authenticated;
grant insert (owner_id, name, slug, description, logo_url, banner_url, city, categories, gender_focus, status, featured)
  on public.shops to authenticated;
grant update (name, slug, description, logo_url, banner_url, city, categories, gender_focus, status, featured)
  on public.shops to authenticated;
grant delete on public.shops to authenticated;  -- admin policy only; no delete policy for vendors

-- ---------------------------------------------------------------- RLS: products
alter table public.products enable row level security;

create policy "products: read public" on public.products for select to anon, authenticated
  using (public.product_is_public(id));
create policy "products: read own"    on public.products for select to authenticated
  using (public.owns_shop(shop_id));
create policy "products: admin all"   on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "products: create own"  on public.products for insert to authenticated
  with check (public.owns_shop(shop_id));
create policy "products: edit own"    on public.products for update to authenticated
  using (public.owns_shop(shop_id)) with check (public.owns_shop(shop_id));
create policy "products: delete own"  on public.products for delete to authenticated
  using (public.owns_shop(shop_id));

-- ---------------------------------------------------------------- RLS: images + variants
alter table public.product_images enable row level security;

create policy "images: read public" on public.product_images for select to anon, authenticated
  using (public.product_is_public(product_id));
create policy "images: read own"    on public.product_images for select to authenticated
  using (public.owns_product(product_id));
create policy "images: admin all"   on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "images: write own"   on public.product_images for all to authenticated
  using (public.owns_product(product_id)) with check (public.owns_product(product_id));

alter table public.product_variants enable row level security;

create policy "variants: read public" on public.product_variants for select to anon, authenticated
  using (public.product_is_public(product_id));
create policy "variants: read own"    on public.product_variants for select to authenticated
  using (public.owns_product(product_id));
create policy "variants: admin all"   on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "variants: write own"   on public.product_variants for all to authenticated
  using (public.owns_product(product_id)) with check (public.owns_product(product_id));

-- ---------------------------------------------------------------- featured: admin only
-- Column grants cannot tell vendors from admins (both are `authenticated`), so a trigger keeps
-- `featured` admin-only on shops and products. Service-role / owner connections (seed,
-- migrations) have no auth.uid() and are not restricted.
create function public.guard_featured() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.featured and auth.uid() is not null and not public.is_admin() then
      raise exception 'only admins can feature a %', tg_table_name using errcode = '42501';
    end if;
  elsif new.featured is distinct from old.featured and auth.uid() is not null and not public.is_admin() then
    raise exception 'only admins can change featured on %', tg_table_name using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger shops_guard_featured    before insert or update on public.shops
  for each row execute function public.guard_featured();
create trigger products_guard_featured before insert or update on public.products
  for each row execute function public.guard_featured();
