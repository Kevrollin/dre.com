-- Product management migration for an existing Dab Rollin Empire store.
-- Run this once in Supabase SQL Editor after the base schema is installed.

-- Color variants can show their own preview image on the product page.
alter table public.product_variants
  add column if not exists image_url text;

-- Default categories shown in Find Your Piece. Admins can add more later.
insert into public.categories (name, slug, active) values
  ('T-Shirts', 't-shirts', true),
  ('Hoodies', 'hoodies', true),
  ('Headwear', 'headwear', true),
  ('Accessories', 'accessories', true),
  ('Limited Drops', 'limited-drops', true)
on conflict (slug) do nothing;

-- The admin Music page stores cover images in the existing public bucket.
-- featured_media already has authenticated-admin policies in the base schema.

-- Generate a unique sharing slug when a new product is created without one.
create or replace function public.set_product_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 1;
begin
  if new.slug is not null and trim(new.slug) <> '' then
    return new;
  end if;

  base_slug := trim(
    both '-' from lower(regexp_replace(new.name, '[^a-zA-Z0-9]+', '-', 'g'))
  );

  if base_slug = '' then
    base_slug := 'product';
  end if;

  candidate_slug := base_slug;
  while exists (select 1 from public.products where slug = candidate_slug) loop
    candidate_slug := base_slug || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  new.slug := candidate_slug;
  return new;
end;
$$;

drop trigger if exists products_set_slug on public.products;
create trigger products_set_slug
  before insert on public.products
  for each row execute function public.set_product_slug();

-- Create the public bucket used for storefront product images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Storefront visitors can view product images.
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images" on storage.objects
  for select
  using (bucket_id = 'product-images');

-- Signed-in admins can upload, replace, and delete product images.
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
  for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects
  for update
  using (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  )
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
  for delete
  using (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );
