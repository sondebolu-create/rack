-- Rack backend, part 8: shop setup (V2).
-- 1) slug_available(): the wizard checks a slug as the vendor types. A plain select can't do it, because
--    RLS hides other vendors' draft shops, so two drafts could pick the same slug.
-- 2) A shop can only go live with at least one published product and the basics filled in. Enforced here,
--    not just in the app, because column grants let a vendor set `status` directly.

create function public.slug_available(p_slug text, p_shop_id uuid default null) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.shops where slug = p_slug and (p_shop_id is null or id <> p_shop_id)
  );
$$;
revoke all on function public.slug_available(text, uuid) from public, anon;
grant execute on function public.slug_available(text, uuid) to authenticated;

create function public.guard_shop_publish() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  -- Only when a shop BECOMES live. Admins and service-role/owner connections (seed, migrations) are exempt.
  if new.status = 'live'
     and (tg_op = 'INSERT' or old.status is distinct from 'live')
     and auth.uid() is not null
     and not public.is_admin() then
    if coalesce(trim(new.city), '') = '' or cardinality(new.categories) = 0 then
      raise exception 'SHOP_INCOMPLETE: add a city and at least one category' using errcode = '22023';
    end if;
    if not exists (select 1 from public.products where shop_id = new.id and status = 'published') then
      raise exception 'SHOP_NEEDS_PRODUCT: publish at least one product first' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

create trigger shops_guard_publish before insert or update on public.shops
  for each row execute function public.guard_shop_publish();

-- Sane lengths. NOT VALID: checks every new or changed row without re-scanning rows that already exist.
alter table public.shops
  add constraint shops_text_lengths check (
    length(name) <= 80
    and length(slug) <= 60
    and length(coalesce(description, '')) <= 1000
    and length(coalesce(city, '')) <= 60
    and cardinality(categories) <= 10
  ) not valid;
