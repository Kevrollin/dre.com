import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const { data, error: loadError } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (loadError) setError(loadError.message)
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(event) {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    const { error: insertError } = await supabase.from('categories').insert({
      name: name.trim(),
      slug: slugify(name),
      active: true,
    })
    if (insertError) setError(insertError.message)
    else setName('')
    setSaving(false)
    load()
  }

  async function toggleActive(category) {
    await supabase
      .from('categories')
      .update({ active: !category.active })
      .eq('id', category.id)
    load()
  }

  async function handleDelete(category) {
    if (!confirm(`Delete category "${category.name}"?`)) return
    await supabase.from('categories').delete().eq('id', category.id)
    load()
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-xl uppercase tracking-tight">
        Categories
      </h1>

      <form onSubmit={handleAdd} className="mb-10 flex max-w-lg flex-wrap gap-3">
        <input
          required
          placeholder="Category name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="flex-1 border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-de-text px-5 py-2.5 text-xs font-display uppercase tracking-[0.2em] text-de-bg disabled:opacity-60"
        >
          Add category
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-de-accent">{error}</p>}
      {loading ? (
        <p className="text-de-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-de-muted">No categories yet.</p>
      ) : (
        <ul className="max-w-lg divide-y divide-de-border border-y border-de-border text-sm">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between py-3">
              <span>{category.name}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleActive(category)}
                  className={`text-xs uppercase tracking-wider ${
                    category.active ? 'text-de-accent' : 'text-de-muted'
                  }`}
                >
                  {category.active ? 'Active' : 'Hidden'}
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="text-xs text-de-muted underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
