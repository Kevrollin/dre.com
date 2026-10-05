# Dab Rollin Empire — Official Store

Official merchandise store for Dab Rollin Empire (DRE), the artist brand of
Rockie Dabro (Peter Kirugi). React + Vite + Tailwind CSS on the frontend,
Supabase (Postgres, Auth, Storage) on the backend, deployable to Vercel's
free plan.

## What's in here

- Public storefront: home, shop (filter/sort/search), product detail with
  size/color variants, persistent cart (localStorage), checkout, order
  confirmation, about, music, contact.
- Admin panel at `/admin`: dashboard, products (with images + color variants),
  orders, categories, and music links.
- `supabase/schema.sql` — full database schema, row-level security
  policies, and the checkout logic, ready to paste into the Supabase SQL
  editor.

## 1. Install dependencies

```bash 
npm install
```

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's ready, open **SQL Editor → New query**, paste in the entire
   contents of `supabase/schema.sql`, and run it. This creates every table,
   turns on row-level security, and installs the two database functions
   the storefront checkout depends on.
3. Run `supabase/product-management-migration.sql` after the base schema.
  It creates the `product-images` public bucket, storage policies, default
  categories, automatic product slugs, and color variant image support.
4. Go to **Authentication → Users → Add user** and create yourself an
   admin login (email + password). Anyone who signs in through Supabase
   Auth is treated as an admin — there's no separate roles table — so only
   create logins for people you trust with the store.

## 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the two values from
**Project Settings → API** in Supabase:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

The anon key is safe to expose in frontend code — that's what it's for.
Row-level security in `schema.sql` is what actually keeps writes locked to
admins and checkout locked to the `place_order` function.

## 4. Run it locally

```bash
npm run dev
```

Visit `http://localhost:5173`. The store will render with empty states
until you add categories and products from `/admin` (sign in with the
user you created in step 2.4).

## 5. Deploy to Vercel (free plan)

1. Push this project to a GitHub repo.
2. Import it in Vercel (free plan is fine).
3. Keep the framework preset as **Vite**. The build command is `npm run build`
  and the output directory is `dist`.
4. Add these environment variables under **Project Settings → Environment
  Variables** for Production, Preview, and Development:

  ```text
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
  ```

5. Deploy. `vercel.json` is included so direct links such as `/admin/login`,
  `/admin/music`, and `/product/example` work after deployment.
6. In Supabase **Authentication → URL Configuration**, add your Vercel
  production URL to **Site URL** and **Redirect URLs**.
7. Open `https://your-domain.vercel.app/admin/login` to use the admin panel.

## Things that are intentionally left as placeholders

The brief was explicit about not inventing artist bios, social accounts,
song titles, or payment confirmations — so a few things are wired up to be
filled in by you rather than guessed:

- **Payments.** Checkout writes an order with `payment_status: pending`
  and never claims a payment succeeded. `place_order` (in `schema.sql`) is
  the one place to plug in M-Pesa/card confirmation later — have your
  payment webhook call an update on `orders.payment_status` once a
  payment actually clears.
- **Shipping fee.** Currently `0` for every order (shown to the customer
  as "calculated at checkout" rather than a made-up number). Set a real
  rate — flat or per-county — in `place_order` once you have one.
- **Social links & YouTube videos.** The Music page and footer pull from
  the `social_links` and `featured_media` tables and show an honest empty
  state until you add real, verified accounts/videos from the admin
  panel — nothing is pre-filled with a guess.
- **Contact email.** `hello@dabrollinempire.com` on the Contact page is a
  placeholder — swap it for the real support address in
  `src/pages/Contact.jsx`.
- **Logo.** No brand assets were supplied, so the header/footer use a
  simple "DE" monogram in Space Grotesk. Once you have the real DE logo,
  swap the `<span>DE</span>` blocks in `src/components/Header.jsx` and
  `Footer.jsx` for an `<img>`.
- **Colors.** `tailwind.config.js` uses a warm ivory background with a
  muted rust/terracotta accent (`de.accent`), per the brief's fallback
  rule for "no supplied brand color → muted earthy accent, not neon."
  Change the hex values there if you get an official brand color.

## Known limitation

Editing a product's images replaces the full image list on every save
(simple, but it means image records get new IDs each time you edit).
Variants are handled more carefully — existing variant rows keep their
IDs when you edit them, so past orders that reference a variant stay
intact.

## Security notes

- Checkout goes through a single Postgres function (`place_order`) that
  re-checks price and stock from the database itself — the browser only
  ever sends product/variant IDs and quantities, never prices, so a
  tampered cart can't produce a cheaper order.
- Guests can place an order and look up their own order by its reference
  number, but there's no general "browse all orders" access for anon
  users — that's admin-only.
- Anyone who can sign in via Supabase Auth has full admin rights (no
  separate roles). Keep that user list small.
