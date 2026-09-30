import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(product) {
    await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id)
    load()
  }

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    await supabase.from('products').delete().eq('id', product.id)
    load()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-xl uppercase tracking-tight">
          Products
        </h1>
        <Link
          to="/admin/products/new"
          className="bg-de-text px-5 py-2.5 text-xs font-display uppercase tracking-[0.2em] text-de-bg"
        >
          New Product
        </Link>
      </div>

      {loading ? (
        <p className="text-de-muted">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-de-muted">No products yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-de-border text-left text-xs uppercase tracking-wider text-de-muted">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Featured</th>
                <th className="py-3 pr-4">Active</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-de-border">
                  <td className="py-3 pr-4">{p.name}</td>
                  <td className="py-3 pr-4 text-de-muted">
                    {p.categories?.name || '—'}
                  </td>
                  <td className="py-3 pr-4">
                    KSh {Number(p.price).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">{p.featured ? 'Yes' : 'No'}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`text-xs uppercase tracking-wider ${
                        p.active ? 'text-de-accent' : 'text-de-muted'
                      }`}
                    >
                      {p.active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="space-x-3 py-3 pr-4 text-right">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="text-xs underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      className="text-xs text-de-muted underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
