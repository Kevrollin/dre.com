import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ProductGrid from '../components/ProductGrid'
import { SORT_OPTIONS } from '../data/navigation'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'All'
  const sort = searchParams.get('sort') || 'featured'
  const q = searchParams.get('q') || ''

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('active', true)
        .order('name')
      setCategories(categoryData || [])
      const { data } = await supabase
        .from('products')
        .select(
          `id, name, description, slug, price, compare_at_price, featured, active, created_at, badge,
           product_images(image_url, sort_order),
           categories(name)`
        )
        .eq('active', true)

      let mapped = (data || []).map((p) => ({
        ...p,
        image: p.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]
          ?.image_url,
        categoryName: p.categories?.name,
      }))

      if (activeCategory !== 'All') {
        mapped = mapped.filter((p) => p.categoryName === activeCategory)
      }
      if (q) {
        mapped = mapped.filter((p) =>
          p.name.toLowerCase().includes(q.toLowerCase())
        )
      }

      if (sort === 'newest') {
        mapped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } else if (sort === 'price_asc') {
        mapped.sort((a, b) => a.price - b.price)
      } else if (sort === 'price_desc') {
        mapped.sort((a, b) => b.price - a.price)
      } else {
        mapped.sort((a, b) =>
          b.featured === a.featured ? 0 : b.featured ? 1 : -1
        )
      }

      setProducts(mapped)
      setLoading(false)
    }
    load()
  }, [activeCategory, sort, q])

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value && value !== 'All') next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="eyebrow mb-2">Dab Rollin Empire</p>
      <h1 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
        Shop
      </h1>
      <p className="mt-3 max-w-xl text-sm text-de-muted">
        Official merchandise from Rockie Dabro. Limited pieces, dropped in
        small batches.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-de-border pb-4">
        <div className="flex flex-wrap gap-2">
          {['All', ...categories.map((c) => c.name)].map((c) => (
            <button
              key={c}
              onClick={() => updateParam('category', c)}
              className={`px-3 py-1.5 text-xs font-display uppercase tracking-wider ${
                activeCategory === c
                  ? 'bg-de-text text-de-bg'
                  : 'border border-de-border text-de-muted hover:text-de-text'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="border border-de-border bg-transparent px-3 py-1.5 text-xs uppercase tracking-wider"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  )
}
