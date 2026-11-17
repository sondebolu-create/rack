-- Rack backend, part 7: sample photos for vendor applications (V1, V2).
-- Applicants have no shop yet, so the shop-folder buckets don't fit. This bucket is PRIVATE and keyed by
-- the uploader's user id:  application-photos/<user_id>/<file>.jpg
-- The applicant and admins can read; only the applicant can write. The admin page uses signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('application-photos', 'application-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "application photos: owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'application-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "application photos: owner or admin read" on storage.objects for select to authenticated
  using (
    bucket_id = 'application-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "application photos: owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'application-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- sample_photo_urls holds storage PATHS in that bucket (not public URLs). At most 3, and sane text lengths,
-- enforced here so a client can't bypass the form's limits.
comment on column public.vendor_applications.sample_photo_urls is 'Storage paths in the private application-photos bucket, e.g. <user_id>/<file>.jpg';

alter table public.vendor_applications
  add constraint vendor_applications_max_photos check (cardinality(sample_photo_urls) <= 3),
  add constraint vendor_applications_text_lengths check (
    length(business_name) <= 100
    and length(coalesce(instagram_handle, '')) <= 30
    and length(phone) <= 20
    and length(city) <= 60
    and length(coalesce(note, '')) <= 1000
    and length(coalesce(review_note, '')) <= 1000
    and cardinality(categories) <= 10
  );
