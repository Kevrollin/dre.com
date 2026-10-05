-- Dab Rollin Empire Official Store — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query)
-- on a fresh project. This script also creates the public product image bucket.
--
-- This extends the field list in the original brief slightly:
--   - products gets `badge`, `details`, `care_instructions` columns to
--     support the New/Limited badges and product-page content the brief
--     asks for on the frontend.
--   - a `contact_messages` table backs the /contact page form.
-- Everything else matches the brief's table/field list directly.

create extension if not exists pgcrypto;

-- ========== TABLES ==========

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  details text,
  care_instructions text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  category_id uuid references categories(id) on delete set null,
  badge text check (badge is null or badge in ('new', 'limited')),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generate a shareable, unique product slug when the admin leaves it out.
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

  base_slug := trim(both '-' from lower(regexp_replace(new.name, '[^a-zA-Z0-9]+', '-', 'g')));
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

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text,
  sku text,
  size text,
  color text,
  image_url text,
  price_override numeric(10,2) check (price_override is null or price_override >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  active boolean not null default true
);

-- Default categories shown in Find Your Piece. Admins can add more later.
insert into categories (name, slug, active) values
  ('T-Shirts', 't-shirts', true),
  ('Hoodies', 'hoodies', true),
  ('Headwear', 'headwear', true),
  ('Accessories', 'accessories', true),
  ('Limited Drops', 'limited-drops', true)
on conflict (slug) do nothing;

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  county text not null,
  city text not null,
  delivery_notes text,
  subtotal numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  total numeric(10,2) not null
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  label text,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists featured_media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null,
  url text not null,
  thumbnail_url text,
  description text,
  featured boolean not null default false,
  sort_order integer not null default 0
);

-- Extension beyond the original brief: backs the /contact page form.
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Public product images are readable by the storefront; only signed-in admins
-- can upload, replace, or remove files.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ========== ROW LEVEL SECURITY ==========

alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table newsletter_subscribers enable row level security;
alter table social_links enable row level security;
alter table featured_media enable row level security;
alter table contact_messages enable row level security;

drop trigger if exists products_set_slug on products;
create trigger products_set_slug
  before insert on products
  for each row execute function public.set_product_slug();

-- Public (anon) read access to storefront content only
create policy "Public can read active categories" on categories
  for select using (active = true);

create policy "Public can read active products" on products
  for select using (active = true);

create policy "Public can read product images" on product_images
  for select using (true);

create policy "Public can read product variants" on product_variants
  for select using (true);

create policy "Public can read active social links" on social_links
  for select using (active = true);

create policy "Public can read featured media" on featured_media
  for select using (true);

-- Public (anon) can submit these, but never read them back
create policy "Public can subscribe to newsletter" on newsletter_subscribers
  for insert with check (true);

create policy "Public can send a contact message" on contact_messages
  for insert with check (true);

-- Admin (any signed-in Supabase Auth user) manages everything.
-- If you ever invite more than yourself into Auth, every signed-in user is
-- treated as admin — keep that user list to people you trust.
create policy "Admins manage categories" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins manage products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins manage product images" on product_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins manage product variants" on product_variants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins manage orders" on orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins manage order items" on order_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins read newsletter list" on newsletter_subscribers
  for select using (auth.role() = 'authenticated');

create policy "Admins manage social links" on social_links
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins manage featured media" on featured_media
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins read contact messages" on contact_messages
  for select using (auth.role() = 'authenticated');

-- Deliberately no public select/update/delete policy on orders or
-- order_items. Guests place and look up orders only through the two
-- functions below, which run with the function owner's privileges and are
-- scoped to a single order at a time.

-- ========== CHECKOUT: SERVER-PRICED ORDER PLACEMENT ==========
-- Prices and stock are re-checked here from products/product_variants —
-- never trusted from the client — per the brief's security requirements.

create or replace function public.place_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_address text,
  p_county text,
  p_city text,
  p_delivery_notes text,
  p_items jsonb -- [{ "product_id": uuid, "variant_id": uuid | null, "quantity": int }]
)
returns table (order_id uuid, order_number text, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_order_number text := 'DRE-' || upper(to_hex(floor(extract(epoch from now()) * 1000)::bigint))
                          || substr(md5(random()::text), 1, 4);
  v_subtotal numeric := 0;
  v_item jsonb;
  v_product products%rowtype;
  v_variant product_variants%rowtype;
  v_unit_price numeric;
  v_variant_name text;
  v_line_total numeric;
  v_quantity integer;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cannot place an order with no items';
  end if;

  insert into orders (
    id, order_number, customer_name, customer_email, customer_phone,
    delivery_address, county, city, delivery_notes,
    subtotal, shipping_fee, total, payment_status, order_status
  ) values (
    v_order_id, v_order_number, p_customer_name, p_customer_email, p_customer_phone,
    p_delivery_address, p_county, p_city, p_delivery_notes,
    0, 0, 0, 'pending', 'pending'
  );

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::int;
    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product from products
      where id = (v_item->>'product_id')::uuid and active = true;
    if not found then
      raise exception 'Product is no longer available';
    end if;

    v_unit_price := v_product.price;
    v_variant_name := null;

    if (v_item->>'variant_id') is not null then
      select * into v_variant from product_variants
        where id = (v_item->>'variant_id')::uuid
          and product_id = v_product.id and active = true;
      if not found then
        raise exception 'Selected variant is no longer available';
      end if;
      if v_variant.stock_quantity < v_quantity then
        raise exception 'Not enough stock for %', v_product.name;
      end if;
      if v_variant.price_override is not null then
        v_unit_price := v_variant.price_override;
      end if;
      v_variant_name := nullif(trim(both ' / ' from
        coalesce(v_variant.size, '') || ' / ' || coalesce(v_variant.color, '')), '');

      v_line_total := v_unit_price * v_quantity;
      v_subtotal := v_subtotal + v_line_total;

      insert into order_items (
        order_id, product_id, variant_id, product_name, variant_name,
        quantity, unit_price, total
      ) values (
        v_order_id, v_product.id, v_variant.id,
        v_product.name, v_variant_name, v_quantity, v_unit_price, v_line_total
      );

      update product_variants
        set stock_quantity = stock_quantity - v_quantity
        where id = v_variant.id;
    else
      v_line_total := v_unit_price * v_quantity;
      v_subtotal := v_subtotal + v_line_total;

      insert into order_items (
        order_id, product_id, variant_id, product_name, variant_name,
        quantity, unit_price, total
      ) values (
        v_order_id, v_product.id, null,
        v_product.name, null, v_quantity, v_unit_price, v_line_total
      );
    end if;
  end loop;

  update orders set subtotal = v_subtotal, total = v_subtotal, updated_at = now()
    where id = v_order_id;

  return query select v_order_id, v_order_number, v_subtotal;
end;
$$;

grant execute on function public.place_order(
  text, text, text, text, text, text, text, jsonb
) to anon, authenticated;

-- ========== ORDER LOOKUP (for the /order/:reference confirmation page) ==========

create or replace function public.get_order_by_number(p_order_number text)
returns table (
  order_number text,
  customer_name text,
  customer_email text,
  customer_phone text,
  subtotal numeric,
  shipping_fee numeric,
  total numeric,
  payment_status text,
  order_status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select order_number, customer_name, customer_email, customer_phone,
         subtotal, shipping_fee, total, payment_status, order_status, created_at
  from orders
  where order_number = p_order_number;
$$;

create or replace function public.get_order_items_by_number(p_order_number text)
returns table (
  product_name text,
  variant_name text,
  quantity integer,
  unit_price numeric,
  total numeric
)
language sql
security definer
set search_path = public
as $$
  select oi.product_name, oi.variant_name, oi.quantity, oi.unit_price, oi.total
  from order_items oi
  join orders o on o.id = oi.order_id
  where o.order_number = p_order_number;
$$;

grant execute on function public.get_order_by_number(text) to anon, authenticated;
grant execute on function public.get_order_items_by_number(text) to anon, authenticated;

-- ========== STORAGE ==========
-- Create a public bucket named "product-images" from Storage → New bucket
-- (toggle "Public"). Upload images there, then paste each file's public
-- URL into the admin product form.
