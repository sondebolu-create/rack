-- Rack backend, part 6: vendors see delivery details; cancelling restores stock.

-- ---------------------------------------------------------------- vendors read orders with their items
-- Vendors arrange delivery themselves, so they need the delivery name, phone and address.
-- RLS is per row, so a vendor sees the whole order row, including the order total and the
-- shopper id. Other shops' lines stay hidden: order_items is still limited to their own shop.
create function public.vendor_has_order(p_order_id uuid) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.order_items oi
    join public.shops s on s.id = oi.shop_id
    where oi.order_id = p_order_id and s.owner_id = auth.uid()
  );
$$;
grant execute on function public.vendor_has_order(uuid) to authenticated;

create policy "orders: read vendor" on public.orders for select to authenticated
  using (public.vendor_has_order(id));

-- ---------------------------------------------------------------- cancel restores stock
-- Rules for a fulfillment's status:
--   * cancelled is final (a reopened fulfillment would need its stock taken again);
--   * a shipped or delivered fulfillment can't be cancelled (the goods are gone);
--   * moving to cancelled puts this shop's reserved quantities back on the variants, once,
--     because the trigger only runs when the status actually changes.
create function public.fulfillment_before_status() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;
  if old.status = 'cancelled' then
    raise exception 'a cancelled fulfillment cannot be reopened' using errcode = '22023';
  end if;
  if new.status = 'cancelled' then
    if old.status in ('shipped', 'delivered') then
      raise exception 'a % fulfillment cannot be cancelled', old.status using errcode = '22023';
    end if;
    update public.product_variants pv
       set stock = pv.stock + oi.quantity
      from public.order_items oi
     where oi.order_id = new.order_id
       and oi.shop_id = new.shop_id
       and oi.variant_id = pv.id;
  end if;
  return new;
end;
$$;

create trigger fulfillment_before_status
  before update of status on public.order_fulfillments
  for each row execute function public.fulfillment_before_status();

-- When the last open fulfillment is cancelled, the order is cancelled too.
create function public.fulfillment_after_status() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled'
     and not exists (
       select 1 from public.order_fulfillments
       where order_id = new.order_id and status <> 'cancelled'
     ) then
    update public.orders set status = 'cancelled' where id = new.order_id and status <> 'cancelled';
  end if;
  return new;
end;
$$;

create trigger fulfillment_after_status
  after update of status on public.order_fulfillments
  for each row execute function public.fulfillment_after_status();

-- Cancelling an order (admin / payment webhook, via the service role) cancels every open
-- fulfillment, which restores their stock through the trigger above. It refuses if a shop
-- has already shipped.
create function public.order_after_cancel() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.order_fulfillments
    where order_id = new.id and status in ('shipped', 'delivered')
  ) then
    raise exception 'order % has shipped items and cannot be cancelled', new.id using errcode = '22023';
  end if;
  update public.order_fulfillments set status = 'cancelled'
   where order_id = new.id and status in ('reserved', 'confirmed');
  return new;
end;
$$;

create trigger order_after_cancel
  after update of status on public.orders
  for each row when (new.status = 'cancelled' and old.status <> 'cancelled')
  execute function public.order_after_cancel();
