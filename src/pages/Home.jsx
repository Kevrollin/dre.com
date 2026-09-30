import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductGrid from '../components/ProductGrid'
import Newsletter from '../components/Newsletter'
import { PlayCircle, Instagram, Music2, Youtube } from 'lucide-react'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [media, setMedia] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    async function loadFeatured() {
      setLoadingProducts(true)
      const { data } = await supabase
        .from('products')
        .select(
          'id, name, description, slug, price, compare_at_price, featured, active, badge, product_images(image_url, sort_order)'
        )
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6)

      const mapped = (data || []).map((p) => ({
        ...p,
        image: p.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]
          ?.image_url,
      }))
      setProducts(mapped)
      setLoadingProducts(false)
    }

    async function loadMedia() {
      const { data } = await supabase
        .from('featured_media')
        .select('*')
        .eq('featured', true)
        .order('sort_order', { ascending: true })
        .limit(3)
      setMedia(data || [])
    }

    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('active', true)
        .order('name')
      setCategories(data || [])
    }

    loadFeatured()
    loadMedia()
    loadCategories()
  }, [])

  return (
    <div>
      <section className="border-b border-de-border">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div>
            <p className="eyebrow mb-4">Dab Rollin Empire</p>
            <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Wear The
              <br />
              Empire.
            </h1>
            <p className="mt-5 max-w-sm text-de-muted">
              Official merchandise from Rockie Dabro.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-de-text px-7 py-3 text-xs font-display uppercase tracking-[0.2em] text-de-bg"
              >
                Shop The Drop
              </Link>
              <Link
                to="/music"
                className="border border-de-text px-7 py-3 text-xs font-display uppercase tracking-[0.2em]"
              >
                Explore The Music
              </Link>
            </div>
          </div>
          <div className="flex aspect-[4/5] w-full items-end bg-de-text p-6 text-de-bg sm:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-de-muted">
                Official Store
              </p>
              <p className="mt-3 max-w-xs font-display text-3xl uppercase leading-none sm:text-4xl">
                Built for the movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-xl uppercase tracking-tight sm:text-2xl">
            The Latest Drop
          </h2>
          <Link to="/shop" className="text-xs text-de-muted underline">
            View all
          </Link>
        </div>
        <ProductGrid products={products} loading={loadingProducts} />
      </section>

      <section className="border-y border-de-border bg-de-surface">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl uppercase leading-tight tracking-tight sm:text-4xl">
            This Is More Than Merch.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-de-muted">
            Dab Rollin Empire brings Rockie Dabro's creative world beyond the
            music — into what you wear, carry and represent.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 font-display text-xl uppercase tracking-tight sm:text-2xl">
          Listen To Rockie
        </h2>
        {media.length === 0 ? (
          <p className="text-sm text-de-muted">
            Featured tracks are managed from the admin panel.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            {media.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="group block"
              >
                <div className="relative mb-3 aspect-video overflow-hidden bg-de-surface">
                  {m.thumbnail_url && (
                    <img
                      src={m.thumbnail_url}
                      alt={m.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  <PlayCircle
                    className="absolute inset-0 m-auto text-white drop-shadow"
                    size={36}
                  />
                </div>
                <p className="text-sm font-medium">{m.title}</p>
                <p className="text-xs uppercase tracking-wider text-de-muted">
                  {m.platform}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-de-border bg-de-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-display text-xl uppercase tracking-tight sm:text-2xl">
            Find Your Piece
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex aspect-square flex-col items-center justify-center gap-2 border border-de-border bg-de-bg text-center transition-colors hover:border-de-accent"
              >
                <span className="font-display text-xs uppercase tracking-[0.2em]">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="aspect-square w-full bg-de-surface" />
          <div>
            <p className="eyebrow mb-4">From Rockie Dabro</p>
            <p className="max-w-md text-de-muted">
              Rockie Dabro (Peter Kirugi) is a Kenyan artist currently
              recording out of Mastermind Pro Studios. Dab Rollin Empire is
              the wearable side of that world.
            </p>
            <Link
              to="/about"
              className="mt-5 inline-block text-xs font-display uppercase tracking-[0.2em] underline"
            >
              Read the story
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-de-border bg-de-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="mb-6 font-display text-xl uppercase tracking-tight sm:text-2xl">
            Follow The Movement
          </h2>
          <div className="flex justify-center gap-6 text-de-muted">
            <Instagram size={20} />
            <Music2 size={20} />
            <Youtube size={20} />
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  )
}
