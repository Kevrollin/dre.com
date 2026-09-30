import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const emptyForm = {
  title: '',
  platform: 'YouTube',
  url: '',
  featured: true,
  sort_order: 0,
}

export default function Music() {
  const [media, setMedia] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [coverFile, setCoverFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const { data, error: loadError } = await supabase
      .from('featured_media')
      .select('*')
      .order('sort_order')
    if (loadError) setError(loadError.message)
    setMedia(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    let thumbnailUrl = null
    if (coverFile) {
      const safeName = coverFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
      const path = `music/${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, coverFile, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        setError(`Cover upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }
      thumbnailUrl = supabase.storage
        .from('product-images')
        .getPublicUrl(path).data.publicUrl
    }

    const { error: insertError } = await supabase.from('featured_media').insert({
      title: form.title.trim(),
      platform: form.platform,
      url: form.url.trim(),
      thumbnail_url: thumbnailUrl,
      featured: form.featured,
      sort_order: Number(form.sort_order) || 0,
    })

    if (insertError) setError(insertError.message)
    else {
      setForm(emptyForm)
      setCoverFile(null)
      event.target.reset()
    }
    setSaving(false)
    load()
  }

  async function toggleFeatured(item) {
    await supabase
      .from('featured_media')
      .update({ featured: !item.featured })
      .eq('id', item.id)
    load()
  }

  async function remove(item) {
    if (!confirm(`Delete "${item.title}"?`)) return
    await supabase.from('featured_media').delete().eq('id', item.id)
    load()
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-xl uppercase tracking-tight">
        Music
      </h1>

      <form onSubmit={handleSubmit} className="mb-12 max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Music name"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            className="border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <select
            value={form.platform}
            onChange={(event) => update('platform', event.target.value)}
            className="border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          >
            <option>YouTube</option>
            <option>Spotify</option>
            <option>Apple Music</option>
            <option>SoundCloud</option>
            <option>Other</option>
          </select>
        </div>
        <input
          required
          type="url"
          placeholder="Music link"
          value={form.url}
          onChange={(event) => update('url', event.target.value)}
          className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <input
            required
            type="file"
            accept="image/*"
            onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
            className="border border-de-border bg-transparent px-3 py-2 text-sm outline-none file:mr-3 file:border-0 file:bg-de-text file:px-3 file:py-1 file:text-xs file:text-de-bg"
          />
          <input
            type="number"
            min="0"
            placeholder="Order"
            value={form.sort_order}
            onChange={(event) => update('sort_order', event.target.value)}
            className="border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => update('featured', event.target.checked)}
          />
          Show on the homepage
        </label>
        {error && <p className="text-sm text-de-accent">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-de-text px-6 py-3 text-xs font-display uppercase tracking-[0.2em] text-de-bg disabled:opacity-60"
        >
          {saving ? 'Adding…' : 'Add Music'}
        </button>
      </form>

      {loading ? (
        <p className="text-de-muted">Loading…</p>
      ) : media.length === 0 ? (
        <p className="text-de-muted">No music links yet.</p>
      ) : (
        <div className="space-y-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-de-border py-3"
            >
              {item.thumbnail_url && (
                <img src={item.thumbnail_url} alt="" className="h-14 w-14 object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs uppercase tracking-wider text-de-muted">
                  {item.platform}
                </p>
              </div>
              <button
                onClick={() => toggleFeatured(item)}
                className="text-xs uppercase tracking-wider text-de-muted"
              >
                {item.featured ? 'Featured' : 'Hidden'}
              </button>
              <button onClick={() => remove(item)} className="text-xs underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
