-- Rack backend, part 3: orders, items, per-shop fulfillments, waitlist (M6-M9, V3).
-- Orders are written only by place_order(); clients get read access, never direct writes.

create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  -- The "#12345" shown in the app (Figma 318:4474).
  order_number     integer generated always as identity (start with 10001) unique,
  shopper_id       uuid not null references public.profiles (id),
  status           public.order_status not null default 'pending_payment',
  total_minor      integer not null check (total_minor >= 0),
  currency         text not null default 'NGN' check (currency in ('NGN', 'USD')),
  delivery_name    text not null,
  delivery_phone   text not null,
  delivery_address text not null,
  delivery_city    text not null,
  created_at       timestamptz not null default now()
);
create index orders_shopper_idx on public.orders (shopper_id, created_at desc);

create table public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  -- Nullable so a variant can be deleted later without destroying order history.
  variant_id       uuid references public.product_variants (id) on delete set null,
  shop_id          uuid not null references public.shops (id),
  quantity         integer not null check (quantity > 0),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  -- Snapshot of what was bought, so history still reads right after the listing changes.
  product_name     text not null,
  size             public.size not null,
  colour_name      text not null
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_shop_idx  on public.order_items (shop_id);

-- One row per shop per order, so a multi-vendor order is tracked shop by shop.
create table public.order_fulfillments (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  shop_id    uuid not null references public.shops (id),
  status     public.fulfillment_status not null default 'reserved',
  updated_at timestamptz not null default now(),
  unique (order_id, shop_id)
);
create index order_fulfillments_shop_idx on public.order_fulfillments (shop_id);
create trigger order_fulfillments_updated_at before update on public.order_fulfillments
  for each row execute function public.set_updated_at();

create table public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  feature    text not null default 'launch' check (length(feature) between 1 and 80),
  created_at timestamptz not null default now()
);
create unique index waitlist_email_feature_idx on public.waitlist (lower(email), feature);

-- ---------------------------------------------------------------- helper
create function public.owns_order(p_order_id uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.orders where id = p_order_id and shopper_id = auth.uid());
$$;
grant execute on function public.owns_order(uuid) to authenticated;

-- ---------------------------------------------------------------- RLS
alter table public.orders enable row level security;
create policy "orders: read own"   on public.orders for select to authenticated
  using (shopper_id = auth.uid());
create policy "orders: admin read" on public.orders for select to authenticated
  using (public.is_admin());
-- Order status after payment is set by the payment webhook / admin (service role), not by clients.
revoke insert, update, delete on public.orders from anon, authenticated;

alter table public.order_items enable row level security;
create policy "order items: read own"    on public.order_items for select to authenticated
  using (public.owns_order(order_id));
-- A vendor sees the lines for their own shop (what to prepare) but not the order itself,
-- so no delivery details. See the open question about delivery details in the summary.
create policy "order items: read vendor" on public.order_items for select to authenticated
  using (public.owns_shop(shop_id));
create policy "order items: admin read"  on public.order_items for select to authenticated
  using (public.is_admin());
revoke insert, update, delete on public.order_items from anon, authenticated;

alter table public.order_fulfillments enable row level security;
create policy "fulfillments: read own order" on public.order_fulfillments for select to authenticated
  using (public.owns_order(order_id));
create policy "fulfillments: vendor read"    on public.order_fulfillments for select to authenticated
  using (public.owns_shop(shop_id));
create policy "fulfillments: vendor update"  on public.order_fulfillments for update to authenticated
  using (public.owns_shop(shop_id)) with check (public.owns_shop(shop_id));
create policy "fulfillments: admin all"      on public.order_fulfillments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- Vendors can move the status only; ids and ownership are fixed.
revoke insert, update, delete on public.order_fulfillments from anon, authenticated;
grant update (status) on public.order_fulfillments to authenticated;

alter table public.waitlist enable row level security;
create policy "waitlist: anyone can join" on public.waitlist for insert to anon, authenticated
  with check (true);
create policy "waitlist: admin read"      on public.waitlist for select to authenticated
  using (public.is_admin());
-- Insert only. Do not chain .select() on the insert from the client: nobody but admins can read.
revoke select, insert, update, delete on public.waitlist from anon, authenticated;
grant insert (email, feature) on public.waitlist to anon, authenticated;
grant select on public.waitlist to authenticated;  -- rows still gated by the admin policy
