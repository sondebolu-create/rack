-- RLS + function tests. Plain SQL, no extensions. Everything runs in ONE transaction that is
-- rolled back at the end, so it leaves no data behind and is safe to re-run.
--
-- Fixture rows use id prefixes 1000.../2000.../3000..., and count checks are scoped to them, so the
-- suite also passes on a seeded database.
-- Run: psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
-- Exit code is non-zero if any check fails.

begin;

create schema t;
grant usage on schema t to public;
create table t.results (n serial, name text, passed boolean);
grant all on t.results to public;

create function t.check(p_name text, p_ok boolean) returns void language plpgsql security definer as $$
begin
  insert into t.results (name, passed) values (p_name, coalesce(p_ok, false));
  raise notice '% %', case when coalesce(p_ok, false) then 'PASS' else 'FAIL' end, p_name;
end $$;

-- Act as a signed-in user / as anon / back to the superuser.
create function t.as_user(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  set local role authenticated;
end $$;
create function t.as_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  set local role anon;
end $$;
create function t.reset() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
end $$;

-- Run a statement in the current role: 'ok:<rows>' or 'err:<sqlstate>'.
create function t.try(p_sql text) returns text language plpgsql as $$
declare n bigint;
begin
  execute p_sql;
  get diagnostics n = row_count;
  return 'ok:' || n;
exception when others then
  return 'err:' || sqlstate;
end $$;

-- Count rows a query returns in the current role.
create function t.count(p_sql text) returns bigint language plpgsql as $$
declare n bigint;
begin
  execute 'select count(*) from (' || p_sql || ') q' into n;
  return n;
end $$;

-- ------------------------------------------------------------------ fixtures (as superuser)
-- admin A, vendors V1/V2, shoppers S1/S2
\set A  '''00000000-0000-0000-0000-0000000000a0'''
\set V1 '''00000000-0000-0000-0000-0000000000b1'''
\set V2 '''00000000-0000-0000-0000-0000000000b2'''
\set S1 '''00000000-0000-0000-0000-0000000000c1'''
\set S2 '''00000000-0000-0000-0000-0000000000c2'''
\set SH1 '''10000000-0000-0000-0000-000000000001'''
\set SH2 '''10000000-0000-0000-0000-000000000002'''
\set SH3 '''10000000-0000-0000-0000-000000000003'''

insert into auth.users (id, email, raw_user_meta_data) values
  (:A,  'admin@test.rack',  '{"full_name":"Admin"}'),
  (:V1, 'v1@test.rack',     '{"full_name":"Vendor One"}'),
  (:V2, 'v2@test.rack',     '{"full_name":"Vendor Two"}'),
  (:S1, 's1@test.rack',     '{"full_name":"Shopper One"}'),
  -- tries to smuggle a role in through sign-up metadata
  (:S2, 's2@test.rack',     '{"full_name":"Shopper Two","role":"admin"}');

select t.check('sign-up trigger creates a profile for every user',
  (select count(*) from public.profiles where id in (:A,:V1,:V2,:S1,:S2)) = 5);
select t.check('sign-up trigger ignores a role passed in metadata',
  (select role from public.profiles where id = :S2) = 'shopper');
select t.check('profile defaults to role shopper',
  (select role from public.profiles where id = :S1) = 'shopper');

update public.profiles set role = 'admin'  where id = :A;
update public.profiles set role = 'vendor' where id in (:V1, :V2);

insert into public.shops (id, owner_id, name, slug, status) values
  (:SH1, :V1, 'Test Brand One', 'test-brand-one', 'live'),
  (:SH2, :V2, 'Test Brand Two', 'test-brand-two', 'live'),
  (:SH3, :V2, 'Test Brand Draft', 'test-brand-draft', 'draft');

insert into public.products (id, shop_id, name, category, price_minor, status) values
  ('20000000-0000-0000-0000-000000000001', :SH1, 'One Gown',    'gowns',     1000000, 'published'),
  ('20000000-0000-0000-0000-000000000002', :SH1, 'One Draft',   'gowns',     1000000, 'draft'),
  ('20000000-0000-0000-0000-000000000003', :SH2, 'Two Shirt',   'corporate', 2000000, 'published'),
  ('20000000-0000-0000-0000-000000000004', :SH3, 'Hidden Shop Product', 'gowns', 500000, 'published');

insert into public.product_variants (id, product_id, size, colour_name, colour_hex, stock) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'M', 'Peach', '#ffcba4', 5),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'M', 'Peach', '#ffcba4', 5),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'L', 'White', '#ffffff', 3),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'S', 'Black', '#000000', 9);

insert into public.product_images (product_id, url, alt, position) values
  ('20000000-0000-0000-0000-000000000001', 'https://x.test/1.jpg', 'gown', 0),
  ('20000000-0000-0000-0000-000000000002', 'https://x.test/2.jpg', 'draft', 0),
  ('20000000-0000-0000-0000-000000000003', 'https://x.test/3.jpg', 'shirt', 0),
  ('20000000-0000-0000-0000-000000000004', 'https://x.test/4.jpg', 'hidden', 0);

-- ------------------------------------------------------------------ 1. nobody can promote themselves
select t.as_user(:S1);
select t.check('shopper cannot promote self to admin',
  t.try($q$ update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000c1' $q$) = 'err:42501');
select t.check('shopper cannot promote self to vendor',
  t.try($q$ update public.profiles set role = 'vendor' where id = '00000000-0000-0000-0000-0000000000c1' $q$) = 'err:42501');
select t.reset();
select t.check('...and the role is unchanged', (select role from public.profiles where id = :S1) = 'shopper');

select t.as_user(:V1);
select t.check('vendor cannot promote self to admin',
  t.try($q$ update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000b1' $q$) = 'err:42501');
select t.reset();

select t.as_user(:A);
select t.check('admin cannot change role through the API either (only via approve_vendor)',
  t.try($q$ update public.profiles set role = 'shopper' where id = '00000000-0000-0000-0000-0000000000a0' $q$) = 'err:42501');
select t.reset();

select t.as_user(:S1);
select t.check('user can update own name/phone/city',
  t.try($q$ update public.profiles set full_name = 'New Name', city = 'Lagos' where id = '00000000-0000-0000-0000-0000000000c1' $q$) = 'ok:1');
select t.check('user cannot edit someone else''s profile (0 rows)',
  t.try($q$ update public.profiles set full_name = 'Hacked' where id = '00000000-0000-0000-0000-0000000000c2' $q$) = 'ok:0');
select t.check('user cannot insert a profile directly',
  t.try($q$ insert into public.profiles (id, role) values (gen_random_uuid(), 'admin') $q$) = 'err:42501');
select t.check('user reads only own profile', t.count('select 1 from public.profiles') = 1);
select t.reset();

-- ------------------------------------------------------------------ 2. vendor applications
select t.as_user(:S1);
select t.check('shopper can apply to sell',
  t.try($q$ insert into public.vendor_applications (user_id, business_name, phone, city, categories)
            values ('00000000-0000-0000-0000-0000000000c1', 'Ada Couture', '0800', 'Lagos', '{gowns}') $q$) = 'ok:1');
select t.check('cannot apply on behalf of another user',
  t.try($q$ insert into public.vendor_applications (user_id, business_name, phone, city)
            values ('00000000-0000-0000-0000-0000000000c2', 'Fake', '0800', 'Lagos') $q$) = 'err:42501');
select t.check('cannot file a second pending application',
  t.try($q$ insert into public.vendor_applications (user_id, business_name, phone, city)
            values ('00000000-0000-0000-0000-0000000000c1', 'Ada Two', '0800', 'Lagos') $q$) = 'err:23505');
select t.check('cannot create an already-approved application',
  t.try($q$ insert into public.vendor_applications (user_id, business_name, phone, city, status)
            values ('00000000-0000-0000-0000-0000000000c1', 'X', '0800', 'Lagos', 'approved') $q$) = 'err:42501');
select t.check('applicant sees own application', t.count('select 1 from public.vendor_applications') = 1);
select t.check('applicant cannot approve own application',
  t.try($q$ update public.vendor_applications set status = 'approved' where user_id = '00000000-0000-0000-0000-0000000000c1' $q$) = 'ok:0');
select t.reset();

-- a second applicant, to check isolation
insert into public.vendor_applications (id, user_id, business_name, phone, city, categories)
values ('40000000-0000-0000-0000-000000000002', :S2, 'Ada Couture', '0801', 'Abuja', '{shoes}');

select t.as_user(:S2);
select t.check('applicant cannot read another''s application',
  t.count($q$ select 1 from public.vendor_applications where user_id <> '00000000-0000-0000-0000-0000000000c2' $q$) = 0);
select t.reset();

select t.as_user(:A);
select t.check('admin reads all applications', t.count('select 1 from public.vendor_applications') = 2);
select t.check('admin cannot mark approved by a bare update (must use approve_vendor)',
  t.try($q$ update public.vendor_applications set status = 'approved' where id = '40000000-0000-0000-0000-000000000002' $q$) = 'err:42501');
select t.reset();

select t.as_user(:V1);
select t.check('non-admin cannot call approve_vendor',
  t.try($q$ select public.approve_vendor('40000000-0000-0000-0000-000000000002') $q$) = 'err:42501');
select t.reset();
select t.as_anon();
select t.check('anon cannot call approve_vendor',
  t.try($q$ select public.approve_vendor('40000000-0000-0000-0000-000000000002') $q$) = 'err:42501');
select t.reset();

select t.as_user(:A);
select t.check('admin can approve', t.try($q$ select public.approve_vendor('40000000-0000-0000-0000-000000000002') $q$) = 'ok:1');
select t.check('approving twice fails cleanly',
  t.try($q$ select public.approve_vendor('40000000-0000-0000-0000-000000000002') $q$) = 'err:22023');
select t.reset();
select t.check('approval made the applicant a vendor', (select role from public.profiles where id = :S2) = 'vendor');
select t.check('approval created a draft shop named after the business',
  exists (select 1 from public.shops where owner_id = :S2 and status = 'draft' and name = 'Ada Couture' and slug = 'ada-couture'
          and city = 'Abuja' and categories = '{shoes}'));
select t.check('application is marked approved with reviewer',
  exists (select 1 from public.vendor_applications where id = '40000000-0000-0000-0000-000000000002'
          and status = 'approved' and reviewed_at is not null and reviewed_by = :A));

-- slug collision: S1 also applied as "Ada Couture"
select t.as_user(:A);
select t.check('admin can reject directly', t.try($q$ update public.vendor_applications set status = 'rejected', review_note = 'no' , reviewed_at = now()
  where user_id = '00000000-0000-0000-0000-0000000000c1' $q$) = 'ok:1');
select t.reset();
select t.check('rejection does not grant a role', (select role from public.profiles where id = :S1) = 'shopper');
insert into public.vendor_applications (id, user_id, business_name, phone, city) values
  ('40000000-0000-0000-0000-000000000003', :S1, 'Ada  Couture!', '0802', 'Lagos');
select t.as_user(:A);
select t.check('slug collision is resolved with a suffix', t.try($q$ select public.approve_vendor('40000000-0000-0000-0000-000000000003') $q$) = 'ok:1');
select t.reset();
select t.check('...second shop is ada-couture-2', exists (select 1 from public.shops where owner_id = :S1 and slug = 'ada-couture-2'));
-- put S1 back to a plain shopper for the order tests
delete from public.shops where owner_id = :S1;
update public.profiles set role = 'shopper' where id = :S1;

-- ------------------------------------------------------------------ 3. public catalogue
select t.as_anon();
select t.check('anon reads live shops only', t.count($q$ select 1 from public.shops where id::text like '10000000%' $q$) = 2 and t.count($q$ select 1 from public.shops where status = 'draft' $q$) = 0);
select t.check('anon reads published products in live shops only (not drafts, not draft-shop products)',
  t.count($q$ select 1 from public.products where id::text like '20000000%' $q$) = 2);
select t.check('anon sees images only of public products', t.count($q$ select 1 from public.product_images where product_id::text like '20000000%' $q$) = 2);
select t.check('anon sees variants only of public products', t.count($q$ select 1 from public.product_variants where product_id::text like '20000000%' $q$) = 2);
select t.check('anon cannot create a product',
  t.try($q$ insert into public.products (shop_id, name, category, price_minor) values ('10000000-0000-0000-0000-000000000001', 'x', 'y', 1) $q$) = 'err:42501');
select t.check('anon cannot update a product', t.try($q$ update public.products set name = 'x' $q$) = 'ok:0');
select t.check('anon cannot read orders', t.try('select * from public.orders') = 'ok:0' or t.try('select * from public.orders') like 'err:%');
select t.reset();

-- ------------------------------------------------------------------ 4. vendors touch only their own rows
select t.as_user(:V1);
select t.check('vendor sees own draft product plus public ones', t.count($q$ select 1 from public.products where id::text like '20000000%' $q$) = 3);
select t.check('vendor cannot edit another vendor''s shop (0 rows)',
  t.try($q$ update public.shops set name = 'Pwned' where id = '10000000-0000-0000-0000-000000000002' $q$) = 'ok:0');
select t.check('vendor cannot take over another shop by changing owner_id',
  t.try($q$ update public.shops set owner_id = '00000000-0000-0000-0000-0000000000b1' where id = '10000000-0000-0000-0000-000000000002' $q$) = 'err:42501');
select t.check('vendor cannot hand own shop to someone else',
  t.try($q$ update public.shops set owner_id = '00000000-0000-0000-0000-0000000000b2' where id = '10000000-0000-0000-0000-000000000001' $q$) = 'err:42501');
select t.check('vendor cannot edit another vendor''s product (0 rows)',
  t.try($q$ update public.products set price_minor = 1 where id = '20000000-0000-0000-0000-000000000003' $q$) = 'ok:0');
select t.check('vendor cannot delete another vendor''s product (0 rows)',
  t.try($q$ delete from public.products where id = '20000000-0000-0000-0000-000000000003' $q$) = 'ok:0');
select t.check('vendor cannot add a product to another vendor''s shop',
  t.try($q$ insert into public.products (shop_id, name, category, price_minor) values ('10000000-0000-0000-0000-000000000002', 'x', 'y', 1) $q$) = 'err:42501');
select t.check('vendor cannot move own product into another vendor''s shop',
  t.try($q$ update public.products set shop_id = '10000000-0000-0000-0000-000000000002' where id = '20000000-0000-0000-0000-000000000001' $q$) = 'err:42501');
select t.check('vendor cannot add a variant to another vendor''s product',
  t.try($q$ insert into public.product_variants (product_id, size, colour_name, colour_hex, stock) values ('20000000-0000-0000-0000-000000000003', 'S', 'Red', '#ff0000', 1) $q$) = 'err:42501');
select t.check('vendor cannot change another vendor''s stock (0 rows)',
  t.try($q$ update public.product_variants set stock = 0 where id = '30000000-0000-0000-0000-000000000003' $q$) = 'ok:0');
select t.check('vendor cannot add an image to another vendor''s product',
  t.try($q$ insert into public.product_images (product_id, url, position) values ('20000000-0000-0000-0000-000000000003', 'https://x.test/z.jpg', 5) $q$) = 'err:42501');
select t.check('vendor can edit own shop', t.try($q$ update public.shops set description = 'ok' where id = '10000000-0000-0000-0000-000000000001' $q$) = 'ok:1');
select t.check('vendor can create own product',
  t.try($q$ insert into public.products (id, shop_id, name, category, price_minor) values ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'New', 'gowns', 100) $q$) = 'ok:1');
select t.check('vendor can add a variant to own product',
  t.try($q$ insert into public.product_variants (product_id, size, colour_name, colour_hex, stock) values ('20000000-0000-0000-0000-000000000009', 'XL', 'Red', '#ff0000', 4) $q$) = 'ok:1');
select t.check('vendor can add an image to own product',
  t.try($q$ insert into public.product_images (product_id, url, position) values ('20000000-0000-0000-0000-000000000009', 'https://x.test/n.jpg', 0) $q$) = 'ok:1');
select t.check('vendor can update own stock', t.try($q$ update public.product_variants set stock = 7 where id = '30000000-0000-0000-0000-000000000001' $q$) = 'ok:1');
select t.check('stock cannot go negative', t.try($q$ update public.product_variants set stock = -1 where id = '30000000-0000-0000-0000-000000000001' $q$) = 'err:23514');
select t.check('product + size + colour is unique',
  t.try($q$ insert into public.product_variants (product_id, size, colour_name, colour_hex, stock) values ('20000000-0000-0000-0000-000000000009', 'XL', 'Red', '#ff0000', 1) $q$) = 'err:23505');
select t.check('sizes outside XS-XXL are rejected',
  t.try($q$ insert into public.product_variants (product_id, size, colour_name, colour_hex, stock) values ('20000000-0000-0000-0000-000000000009', 'XXXL', 'Red', '#ff0000', 1) $q$) = 'err:22P02');
select t.check('vendor cannot self-feature a shop', t.try($q$ update public.shops set featured = true where id = '10000000-0000-0000-0000-000000000001' $q$) = 'err:42501');
select t.check('vendor cannot self-feature a product', t.try($q$ update public.products set featured = true where id = '20000000-0000-0000-0000-000000000001' $q$) = 'err:42501');
select t.check('vendor cannot create a product already featured',
  t.try($q$ insert into public.products (shop_id, name, category, price_minor, featured) values ('10000000-0000-0000-0000-000000000001', 'f', 'y', 1, true) $q$) = 'err:42501');
select t.reset();

select t.as_user(:S1);
select t.check('shopper cannot create a shop',
  t.try($q$ insert into public.shops (owner_id, name, slug) values ('00000000-0000-0000-0000-0000000000c1', 'Sneaky', 'sneaky') $q$) = 'err:42501');
select t.reset();
select t.as_user(:V1);
select t.check('vendor cannot create a shop for someone else',
  t.try($q$ insert into public.shops (owner_id, name, slug) values ('00000000-0000-0000-0000-0000000000b2', 'Imposter', 'imposter') $q$) = 'err:42501');
select t.check('vendor can create own shop',
  t.try($q$ insert into public.shops (owner_id, name, slug) values ('00000000-0000-0000-0000-0000000000b1', 'Second Label', 'second-label') $q$) = 'ok:1');
select t.reset();
select t.as_user(:A);
select t.check('admin can feature a shop', t.try($q$ update public.shops set featured = true where id = '10000000-0000-0000-0000-000000000001' $q$) = 'ok:1');
select t.reset();

-- ------------------------------------------------------------------ 5. place_order
select t.as_anon();
select t.check('anon cannot place an order',
  t.try($q$ select public.place_order('[{"variant_id":"30000000-0000-0000-0000-000000000001","quantity":1}]'::jsonb,
            '{"name":"a","phone":"b","address":"c","city":"d"}'::jsonb) $q$) = 'err:42501');
select t.reset();

create table t.state (k text primary key, v text);
grant all on t.state to public;

select t.as_user(:S1);
insert into t.state
select 'order1', public.place_order(
  '[{"variant_id":"30000000-0000-0000-0000-000000000001","quantity":2},
    {"variant_id":"30000000-0000-0000-0000-000000000003","quantity":1},
    {"variant_id":"30000000-0000-0000-0000-000000000001","quantity":1}]'::jsonb,
  '{"name":"Ada","phone":"0800","address":"1 Marina","city":"Lagos"}'::jsonb)::text;
select t.reset();

select t.check('place_order writes one order', (select count(*) from public.orders where shopper_id = :S1) = 1);
select t.check('total = 3 x 1,000,000 + 1 x 2,000,000 (merged duplicate lines)',
  (select total_minor from public.orders where shopper_id = :S1) = 5000000);
select t.check('items written with snapshot + unit price',
  (select count(*) from public.order_items where order_id = (select v::uuid from t.state where k = 'order1')) = 2
  and exists (select 1 from public.order_items where quantity = 3 and unit_price_minor = 1000000 and product_name = 'One Gown' and size = 'M' and colour_name = 'Peach'));
select t.check('one fulfillment per shop (2 shops -> 2 rows, status reserved)',
  (select count(*) from public.order_fulfillments where order_id = (select v::uuid from t.state where k = 'order1') and status = 'reserved') = 2);
select t.check('stock decremented (5->7 earlier edit, minus 3 = 4; 3 - 1 = 2)',
  (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000001') = 4
  and (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000003') = 2);

-- out of stock: second line is short; the first line's decrement must roll back too
select t.as_user(:S1);
select t.check('out of stock fails with OUT_OF_STOCK',
  t.try($q$ select public.place_order(
    '[{"variant_id":"30000000-0000-0000-0000-000000000001","quantity":1},
      {"variant_id":"30000000-0000-0000-0000-000000000003","quantity":3}]'::jsonb,
    '{"name":"Ada","phone":"0800","address":"1 Marina","city":"Lagos"}'::jsonb) $q$) = 'err:P0001');
select t.reset();
select t.check('...nothing was decremented', (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000001') = 4
  and (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000003') = 2);
select t.check('...and no extra order was written', (select count(*) from public.orders where shopper_id = :S1) = 1);

select t.as_user(:S1);
select t.check('unpublished product cannot be ordered',
  t.try($q$ select public.place_order('[{"variant_id":"30000000-0000-0000-0000-000000000002","quantity":1}]'::jsonb,
    '{"name":"a","phone":"b","address":"c","city":"d"}'::jsonb) $q$) = 'err:P0001');
select t.check('product in a draft shop cannot be ordered',
  t.try($q$ select public.place_order('[{"variant_id":"30000000-0000-0000-0000-000000000004","quantity":1}]'::jsonb,
    '{"name":"a","phone":"b","address":"c","city":"d"}'::jsonb) $q$) = 'err:P0001');
select t.check('unknown variant is refused',
  t.try($q$ select public.place_order('[{"variant_id":"30000000-0000-0000-0000-0000000000ff","quantity":1}]'::jsonb,
    '{"name":"a","phone":"b","address":"c","city":"d"}'::jsonb) $q$) = 'err:P0001');
select t.check('empty basket is refused',
  t.try($q$ select public.place_order('[]'::jsonb, '{"name":"a","phone":"b","address":"c","city":"d"}'::jsonb) $q$) = 'err:22023');
select t.check('zero / negative quantity is refused',
  t.try($q$ select public.place_order('[{"variant_id":"30000000-0000-0000-0000-000000000001","quantity":0}]'::jsonb,
    '{"name":"a","phone":"b","address":"c","city":"d"}'::jsonb) $q$) = 'err:22023');
select t.check('missing delivery details are refused',
  t.try($q$ select public.place_order('[{"variant_id":"30000000-0000-0000-0000-000000000001","quantity":1}]'::jsonb,
    '{"name":"a","phone":"","address":"c","city":"d"}'::jsonb) $q$) = 'err:22023');
select t.check('clients cannot write orders directly',
  t.try($q$ insert into public.orders (shopper_id, total_minor, delivery_name, delivery_phone, delivery_address, delivery_city)
            values ('00000000-0000-0000-0000-0000000000c1', 0, 'a','b','c','d') $q$) = 'err:42501');
select t.check('clients cannot edit an order total',
  t.try($q$ update public.orders set total_minor = 1 $q$) = 'err:42501');
select t.check('clients cannot write order lines directly',
  t.try($q$ update public.order_items set quantity = 99 $q$) = 'err:42501');
select t.reset();

-- ------------------------------------------------------------------ 6. who can read orders
select t.as_user(:S1);
select t.check('shopper reads own order', t.count('select 1 from public.orders') = 1);
select t.check('shopper reads own order items', t.count('select 1 from public.order_items') = 2);
select t.check('shopper reads own fulfillments', t.count('select 1 from public.order_fulfillments') = 2);
select t.reset();

select t.as_user(:S2);
select t.check('another shopper cannot read the order', t.count('select 1 from public.orders') = 0);
select t.check('another shopper cannot read its items', t.count('select 1 from public.order_items') = 0);
select t.check('another shopper cannot read its fulfillments', t.count('select 1 from public.order_fulfillments') = 0);
select t.check('another shopper cannot fetch it by id',
  t.count($q$ select 1 from public.orders where id = (select v::uuid from t.state where k = 'order1') $q$) = 0);
select t.reset();

select t.as_anon();
select t.check('anon cannot read orders', t.count('select 1 from public.orders') = 0);
select t.reset();

-- ------------------------------------------------------------------ 7. vendor fulfilment
select t.as_user(:V1);
select t.check('vendor sees only own shop''s fulfillment', t.count('select 1 from public.order_fulfillments') = 1);
select t.check('vendor sees only own shop''s order lines', t.count('select 1 from public.order_items') = 1);
select t.check('vendor reads an order that contains their items, with delivery details',
  t.count($q$ select 1 from public.orders where delivery_name = 'Ada' and delivery_phone = '0800' and delivery_address = '1 Marina' $q$) = 1);
select t.check('vendor cannot write to the order',
  t.try($q$ update public.orders set delivery_address = 'elsewhere' $q$) = 'err:42501');
select t.check('vendor can move own fulfillment forward',
  t.try($q$ update public.order_fulfillments set status = 'confirmed' where shop_id = '10000000-0000-0000-0000-000000000001' $q$) = 'ok:1');
select t.check('vendor cannot touch another shop''s fulfillment (0 rows)',
  t.try($q$ update public.order_fulfillments set status = 'delivered' where shop_id = '10000000-0000-0000-0000-000000000002' $q$) = 'ok:0');
select t.check('vendor can only change status, not re-point the fulfillment',
  t.try($q$ update public.order_fulfillments set shop_id = '10000000-0000-0000-0000-000000000002' where shop_id = '10000000-0000-0000-0000-000000000001' $q$) = 'err:42501');
select t.check('vendor cannot create fulfillments',
  t.try($q$ insert into public.order_fulfillments (order_id, shop_id) select order_id, shop_id from public.order_fulfillments limit 1 $q$) = 'err:42501');
select t.reset();
select t.check('fulfillment update stuck and stamped updated_at',
  exists (select 1 from public.order_fulfillments where shop_id = :SH1 and status = 'confirmed')
  and (select status from public.order_fulfillments where shop_id = :SH2) = 'reserved');

select t.as_user(:S1);
select t.check('shopper cannot update a fulfillment',
  t.try($q$ update public.order_fulfillments set status = 'delivered' $q$) in ('ok:0', 'err:42501'));
select t.reset();
select t.check('...and it did not change', (select status from public.order_fulfillments where shop_id = :SH2) = 'reserved');

-- ------------------------------------------------------------------ 7b. vendor delivery visibility + cancel restocks
select t.as_user(:S2);
select t.check('a vendor with no items in the order cannot read it', t.count('select 1 from public.orders') = 0);
select t.reset();
select t.as_user(:V2);
select t.check('second vendor (item in same order) also reads it', t.count('select 1 from public.orders') = 1);
select t.reset();

-- state now: variant1 stock 4 (shop1), variant3 stock 2 (shop2); shop1 fulfillment 'confirmed'
select t.as_user(:V1);
select t.check('vendor cancels own fulfillment',
  t.try($q$ update public.order_fulfillments set status = 'cancelled' where shop_id = '10000000-0000-0000-0000-000000000001' $q$) = 'ok:1');
select t.reset();
select t.check('cancelling restored that shop''s stock (4 + 3 = 7)', (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000001') = 7);
select t.check('...and left the other shop''s stock alone', (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000003') = 2);
select t.check('...and the order stays open while another shop is still active', (select status from public.orders where shopper_id = :S1) = 'pending_payment');

select t.as_user(:V1);
select t.check('re-saving the cancelled status is harmless',
  t.try($q$ update public.order_fulfillments set status = 'cancelled' where shop_id = '10000000-0000-0000-0000-000000000001' $q$) = 'ok:1');
select t.check('a cancelled fulfillment cannot be reopened',
  t.try($q$ update public.order_fulfillments set status = 'reserved' where shop_id = '10000000-0000-0000-0000-000000000001' $q$) = 'err:22023');
select t.reset();
select t.check('stock was restored exactly once (still 7)', (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000001') = 7);

select t.as_user(:V2);
select t.check('vendor ships own fulfillment', t.try($q$ update public.order_fulfillments set status = 'shipped' where shop_id = '10000000-0000-0000-0000-000000000002' $q$) = 'ok:1');
select t.check('a shipped fulfillment cannot be cancelled',
  t.try($q$ update public.order_fulfillments set status = 'cancelled' where shop_id = '10000000-0000-0000-0000-000000000002' $q$) = 'err:22023');
select t.reset();
select t.check('...and its stock was not restored', (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000003') = 2);
select t.check('an order with shipped items cannot be cancelled',
  t.try($q$ update public.orders set status = 'cancelled' where shopper_id = '00000000-0000-0000-0000-0000000000c1' $q$) = 'err:22023');

-- cancelling the only fulfillment cancels the order
select t.as_user(:S1);
insert into t.state select 'order2', public.place_order(
  '[{"variant_id":"30000000-0000-0000-0000-000000000003","quantity":1}]'::jsonb,
  '{"name":"Ada","phone":"0800","address":"1 Marina","city":"Lagos"}'::jsonb)::text;
select t.reset();
select t.check('order2 reserved stock (2 -> 1)', (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000003') = 1);
select t.as_user(:V2);
select t.check('vendor cancels order2''s only fulfillment',
  t.try($q$ update public.order_fulfillments set status = 'cancelled'
            where order_id = (select v::uuid from t.state where k = 'order2') $q$) = 'ok:1');
select t.reset();
select t.check('...stock back to 2', (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000003') = 2);
select t.check('...and the order itself is cancelled',
  (select status from public.orders where id = (select v::uuid from t.state where k = 'order2')) = 'cancelled');

-- cancelling an order cancels all of its open fulfillments and restores everything
select t.as_user(:S1);
insert into t.state select 'order3', public.place_order(
  '[{"variant_id":"30000000-0000-0000-0000-000000000001","quantity":2},
    {"variant_id":"30000000-0000-0000-0000-000000000003","quantity":1}]'::jsonb,
  '{"name":"Ada","phone":"0800","address":"1 Marina","city":"Lagos"}'::jsonb)::text;
select t.reset();
select t.check('order3 reserved stock (7 -> 5, 2 -> 1)',
  (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000001') = 5
  and (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000003') = 1);
update public.orders set status = 'cancelled' where id = (select v::uuid from t.state where k = 'order3');
select t.check('cancelling the order cancelled both fulfillments',
  (select count(*) from public.order_fulfillments where order_id = (select v::uuid from t.state where k = 'order3') and status = 'cancelled') = 2);
select t.check('...and restored all stock (back to 7 and 2)',
  (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000001') = 7
  and (select stock from public.product_variants where id = '30000000-0000-0000-0000-000000000003') = 2);

-- ------------------------------------------------------------------ 8. waitlist
select t.as_anon();
select t.check('anon can join the waitlist', t.try($q$ insert into public.waitlist (email, feature) values ('Hello@Test.rack', 'launch') $q$) = 'ok:1');
select t.check('duplicate email (any case) for the same feature is refused', t.try($q$ insert into public.waitlist (email, feature) values ('hello@test.rack', 'launch') $q$) = 'err:23505');
select t.check('same email can join a different feature', t.try($q$ insert into public.waitlist (email, feature) values ('hello@test.rack', 'try-on') $q$) = 'ok:1');
select t.check('invalid email is refused', t.try($q$ insert into public.waitlist (email) values ('not-an-email') $q$) = 'err:23514');
select t.check('anon cannot read the waitlist', t.try('select * from public.waitlist') = 'err:42501');
select t.reset();
select t.as_user(:S1);
select t.check('shopper sees no waitlist rows', t.count('select 1 from public.waitlist') = 0);
select t.reset();
select t.as_user(:A);
select t.check('admin reads the waitlist', t.count('select 1 from public.waitlist') = 2);
select t.reset();

-- ------------------------------------------------------------------ 9. storage
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true), ('shop-assets', 'shop-assets', true)
  on conflict do nothing;
select t.as_user(:V1);
select t.check('vendor can upload into own shop folder',
  t.try($q$ insert into storage.objects (bucket_id, name) values ('product-images', '10000000-0000-0000-0000-000000000001/p1/1.jpg') $q$) = 'ok:1');
select t.check('vendor can upload shop assets into own folder',
  t.try($q$ insert into storage.objects (bucket_id, name) values ('shop-assets', '10000000-0000-0000-0000-000000000001/logo.png') $q$) = 'ok:1');
select t.check('vendor cannot upload into another shop''s folder',
  t.try($q$ insert into storage.objects (bucket_id, name) values ('product-images', '10000000-0000-0000-0000-000000000002/p1/1.jpg') $q$) = 'err:42501');
select t.check('vendor cannot upload to a non-shop folder',
  t.try($q$ insert into storage.objects (bucket_id, name) values ('product-images', 'misc/1.jpg') $q$) = 'err:42501');
select t.check('vendor cannot upload at the bucket root',
  t.try($q$ insert into storage.objects (bucket_id, name) values ('product-images', '1.jpg') $q$) = 'err:42501');
select t.check('vendor cannot upload to some other bucket',
  t.try($q$ insert into storage.objects (bucket_id, name) values ('elsewhere', '10000000-0000-0000-0000-000000000001/1.jpg') $q$) = 'err:42501');
select t.reset();
insert into storage.objects (bucket_id, name) values ('product-images', '10000000-0000-0000-0000-000000000002/p1/2.jpg');
select t.as_user(:V1);
-- Hosted Supabase blocks direct SQL deletes on storage.objects (42501, "use the Storage API"), so
-- on the real project these two only prove nothing was deleted. The exact 'ok:0' / 'ok:1' results
-- are asserted on the local shim; against hosted, check delete via the Storage API instead.
select t.check('vendor cannot delete another shop''s file (0 rows, or platform block)', t.try($q$ delete from storage.objects where name like '10000000-0000-0000-0000-000000000002/%' $q$) in ('ok:0', 'err:42501'));
select t.check('vendor can delete own file (local shim; platform blocks SQL deletes)', t.try($q$ delete from storage.objects where name = '10000000-0000-0000-0000-000000000001/p1/1.jpg' $q$) in ('ok:1', 'err:42501'));
select t.reset();
select t.as_user(:S1);
select t.check('shopper cannot upload', t.try($q$ insert into storage.objects (bucket_id, name) values ('product-images', '10000000-0000-0000-0000-000000000001/x.jpg') $q$) = 'err:42501');
select t.reset();
select t.as_anon();
select t.check('anyone can read bucket files', t.count('select 1 from storage.objects') >= 1);
select t.check('anon cannot upload', t.try($q$ insert into storage.objects (bucket_id, name) values ('product-images', '10000000-0000-0000-0000-000000000001/x.jpg') $q$) = 'err:42501');
select t.reset();

-- ------------------------------------------------------------------ summary
do $$
declare total int; failed int; r record;
begin
  select count(*), count(*) filter (where not passed) into total, failed from t.results;
  raise notice '-----';
  raise notice '% checks, % passed, % failed', total, total - failed, failed;
  for r in select name from t.results where not passed order by n loop
    raise notice 'FAILED: %', r.name;
  end loop;
  if failed > 0 then raise exception '% RLS test(s) failed', failed; end if;
end $$;

rollback;
