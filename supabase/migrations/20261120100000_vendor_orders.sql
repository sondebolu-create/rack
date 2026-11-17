-- Rack backend, part 10: vendor order handling (V3, M9).
-- 1) Status moves forward only: reserved -> confirmed -> shipped -> delivered. Cancel is allowed from reserved or
--    confirmed and needs a reason. Until now column grants let a vendor set any status, including moving a
--    delivered order back. Enforced here for clients; admins and service-role connections are exempt.
-- 2) `cancel_reason` (shown to the shopper) and `history` (when each step was reached, for the timelines).

alter table public.order_fulfillments
  add column cancel_reason text check (cancel_reason is null or length(trim(cancel_reason)) between 1 and 500),
  add column history jsonb not null default '{}'::jsonb;

update public.order_fulfillments set history = jsonb_build_object(status::text, updated_at) where history = '{}'::jsonb;

grant update (status, cancel_reason) on public.order_fulfillments to authenticated;

-- Stamp the time of every status change into `history`.
create function public.fulfillment_stamp_history() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.history := jsonb_build_object(new.status::text, now());
  elsif new.status is distinct from old.status then
    new.history := old.history || jsonb_build_object(new.status::text, now());
  end if;
  return new;
end;
$$;

create trigger order_fulfillments_stamp_history before insert or update of status on public.order_fulfillments
  for each row execute function public.fulfillment_stamp_history();

-- Same cancel/restock rules as before, plus the forward-only rule and the required reason.
create or replace function public.fulfillment_before_status() returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  by_client boolean := auth.uid() is not null and not public.is_admin();
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
    if by_client and coalesce(trim(new.cancel_reason), '') = '' then
      raise exception 'CANCEL_REASON_REQUIRED: say why this is being cancelled' using errcode = '22023';
    end if;
    update public.product_variants pv
       set stock = pv.stock + oi.quantity
      from public.order_items oi
     where oi.order_id = new.order_id
       and oi.shop_id = new.shop_id
       and oi.variant_id = pv.id;
  elsif by_client and not (
       (old.status = 'reserved'  and new.status = 'confirmed')
    or (old.status = 'confirmed' and new.status = 'shipped')
    or (old.status = 'shipped'   and new.status = 'delivered')
  ) then
    raise exception 'INVALID_TRANSITION: % cannot move to %', old.status, new.status using errcode = '22023';
  end if;
  return new;
end;
$$;
