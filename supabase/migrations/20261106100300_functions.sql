-- Rack backend, part 4: approve_vendor() and place_order().
-- Both are SECURITY DEFINER (they write tables clients cannot), so each one checks who is
-- calling before it does anything. search_path is pinned to '' and every name is qualified.

-- ---------------------------------------------------------------- approve_vendor
create function public.approve_vendor(application_id uuid) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  app     public.vendor_applications%rowtype;
  base    text;
  new_slug text;
  n       integer := 1;
  shop_id uuid;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'only admins can approve vendors' using errcode = '42501';
  end if;

  select * into app from public.vendor_applications where id = application_id for update;
  if not found then
    raise exception 'application not found' using errcode = 'P0002';
  end if;
  if app.status <> 'pending' then
    raise exception 'application is already %', app.status using errcode = '22023';
  end if;

  -- Never downgrade an admin.
  update public.profiles set role = 'vendor' where id = app.user_id and role = 'shopper';

  base := trim(both '-' from regexp_replace(lower(app.business_name), '[^a-z0-9]+', '-', 'g'));
  if base = '' then base := 'shop'; end if;
  new_slug := base;
  while exists (select 1 from public.shops where slug = new_slug) loop
    n := n + 1;
    new_slug := base || '-' || n;
  end loop;

  insert into public.shops (owner_id, name, slug, city, categories, status)
  values (app.user_id, app.business_name, new_slug, app.city, app.categories, 'draft')
  returning id into shop_id;

  update public.vendor_applications
     set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
   where id = application_id;

  return shop_id;
end;
$$;

revoke all on function public.approve_vendor(uuid) from public, anon;
grant execute on function public.approve_vendor(uuid) to authenticated;

-- ---------------------------------------------------------------- place_order
-- items:    [{"variant_id": "<uuid>", "quantity": 2}, ...]
-- delivery: {"name": "...", "phone": "...", "address": "...", "city": "..."}
-- One transaction: lock the variants, check stock, decrement it, write the order, its lines
-- and one fulfillment per shop. If anything is short the whole call raises and nothing is kept.
-- Errors carry a stable code in the message prefix so the app can branch on them:
--   OUT_OF_STOCK, UNAVAILABLE, INVALID_ITEMS, INVALID_DELIVERY, MIXED_CURRENCY
create function public.place_order(items jsonb, delivery jsonb) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  uid       uuid := auth.uid();
  v_name    text := nullif(trim(delivery ->> 'name'), '');
  v_phone   text := nullif(trim(delivery ->> 'phone'), '');
  v_address text := nullif(trim(delivery ->> 'address'), '');
  v_city    text := nullif(trim(delivery ->> 'city'), '');
  line      record;
  v         record;
  v_order   uuid;
  total     bigint := 0;
  cur       text;
begin
  if uid is null then
    raise exception 'sign in to place an order' using errcode = '42501';
  end if;
  if v_name is null or v_phone is null or v_address is null or v_city is null then
    raise exception 'INVALID_DELIVERY: name, phone, address and city are required' using errcode = '22023';
  end if;
  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'INVALID_ITEMS: the order has no items' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(items) e
    where jsonb_typeof(e) <> 'object'
       or (e ->> 'variant_id') is null
       or (e ->> 'variant_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or (e ->> 'quantity') is null
       or (e ->> 'quantity') !~ '^[0-9]{1,3}$'
       or (e ->> 'quantity')::int < 1
  ) then
    raise exception 'INVALID_ITEMS: each item needs a variant_id and a quantity of 1 to 999' using errcode = '22023';
  end if;

  v_order := gen_random_uuid();
  -- Total is filled in after the lines are written.
  insert into public.orders (id, shopper_id, total_minor, delivery_name, delivery_phone, delivery_address, delivery_city)
  values (v_order, uid, 0, v_name, v_phone, v_address, v_city);

  -- Merge duplicate variants, then lock in id order so two concurrent orders can't deadlock.
  for line in
    select (e ->> 'variant_id')::uuid as variant_id, sum((e ->> 'quantity')::int)::int as quantity
    from jsonb_array_elements(items) e
    group by 1
    order by 1
  loop
    select pv.id, pv.stock, pv.size, pv.colour_name,
           p.name as product_name, p.price_minor, p.currency, p.status as product_status,
           s.id as shop_id, s.status as shop_status
      into v
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
      join public.shops s on s.id = p.shop_id
     where pv.id = line.variant_id
       for update of pv;

    if not found or v.product_status <> 'published' or v.shop_status <> 'live' then
      raise exception 'UNAVAILABLE: variant % is not for sale', line.variant_id using errcode = 'P0001';
    end if;
    if v.stock < line.quantity then
      raise exception 'OUT_OF_STOCK: only % of % (% / %) left, % requested',
        v.stock, v.product_name, v.size, v.colour_name, line.quantity
        using errcode = 'P0001', detail = line.variant_id::text;
    end if;
    if cur is null then
      cur := v.currency;
    elsif cur <> v.currency then
      raise exception 'MIXED_CURRENCY: one order must use one currency' using errcode = '22023';
    end if;

    update public.product_variants set stock = stock - line.quantity where id = v.id;

    insert into public.order_items
      (order_id, variant_id, shop_id, quantity, unit_price_minor, product_name, size, colour_name)
    values
      (v_order, v.id, v.shop_id, line.quantity, v.price_minor, v.product_name, v.size, v.colour_name);

    insert into public.order_fulfillments (order_id, shop_id)
    values (v_order, v.shop_id)
    on conflict (order_id, shop_id) do nothing;

    total := total + v.price_minor::bigint * line.quantity;
  end loop;

  if total > 2147483647 then
    raise exception 'INVALID_ITEMS: order total is too large' using errcode = '22023';
  end if;
  update public.orders set total_minor = total, currency = cur where id = v_order;

  return v_order;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public, anon;
grant execute on function public.place_order(jsonb, jsonb) to authenticated;
