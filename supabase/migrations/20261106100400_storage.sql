-- Rack backend, part 5: storage buckets (M2-M4, V3).
-- Public read. Writes only into a folder named after the uploader's shop id:
--   shop-assets/<shop_id>/logo.png      product-images/<shop_id>/<product_id>/1.jpg

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('shop-assets',    'shop-assets',    true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Compares as text so a folder name that is not a uuid is simply "no", never a cast error.
create function public.owns_shop_folder(p_folder text) returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.shops where id::text = p_folder and owner_id = auth.uid());
$$;
grant execute on function public.owns_shop_folder(text) to authenticated;

create policy "rack assets: public read" on storage.objects for select to anon, authenticated
  using (bucket_id in ('shop-assets', 'product-images'));

create policy "rack assets: shop owner upload" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('shop-assets', 'product-images')
    and (public.owns_shop_folder((storage.foldername(name))[1]) or public.is_admin())
  );

create policy "rack assets: shop owner update" on storage.objects for update to authenticated
  using (
    bucket_id in ('shop-assets', 'product-images')
    and (public.owns_shop_folder((storage.foldername(name))[1]) or public.is_admin())
  )
  with check (
    bucket_id in ('shop-assets', 'product-images')
    and (public.owns_shop_folder((storage.foldername(name))[1]) or public.is_admin())
  );

create policy "rack assets: shop owner delete" on storage.objects for delete to authenticated
  using (
    bucket_id in ('shop-assets', 'product-images')
    and (public.owns_shop_folder((storage.foldername(name))[1]) or public.is_admin())
  );
