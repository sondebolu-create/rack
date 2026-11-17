-- Rack backend, part 9: product publishing guard (V2).
-- A product can only BECOME published with a price, at least one photo and at least one variant in stock.
-- The app saves photos and variants first and flips the status last, so this holds for normal use; it also stops
-- a client setting `status = 'published'` directly. Admins and service-role/owner connections (seed) are exempt.
-- Once published, a product may sell out or lose photos while the vendor edits: only the change TO published is checked.

create function public.guard_product_publish() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published')
     and auth.uid() is not null
     and not public.is_admin() then
    if new.price_minor <= 0 then
      raise exception 'PRODUCT_NEEDS_PRICE: set a price first' using errcode = '22023';
    end if;
    if not exists (select 1 from public.product_images where product_id = new.id) then
      raise exception 'PRODUCT_NEEDS_PHOTO: add at least one photo first' using errcode = '22023';
    end if;
    if not exists (select 1 from public.product_variants where product_id = new.id and stock > 0) then
      raise exception 'PRODUCT_NEEDS_STOCK: add a size and colour with stock first' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

create trigger products_guard_publish before insert or update on public.products
  for each row execute function public.guard_product_publish();

alter table public.products
  add constraint products_text_lengths check (
    length(name) <= 120 and length(coalesce(description, '')) <= 2000 and length(category) <= 40
  ) not valid;
