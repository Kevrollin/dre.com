import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const emptyVariant = () => ({
  id: null,
  name: '',
  color: '',
  image_url: '',
  image_file: null,
  stock_quantity: 0,
  active: true,
})

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    featured: false,
    active: true,
    badge: '',
  })
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name')
      setCategories(data || [])
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (!isEdit) return
    async function loadProduct() {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .eq('id', id)
        .single()
      if (data) {
        setForm({
          name: data.name || '',
          description: data.description || '',
          price: data.price ?? '',
          category_id: data.category_id || '',
          featured: data.featured || false,
          active: data.active ?? true,
          badge: data.badge || '',
        })
        setImages(
          (data.product_images || []).sort(
            (a, b) => a.sort_order - b.sort_order
          )
        )
        setVariants(data.product_variants || [])
      }
      setLoading(false)
    }
    loadProduct()
  }, [id, isEdit])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function addImageFiles(event) {
    const files = Array.from(event.target.files || [])
    setImages((imgs) => [
      ...imgs,
      ...files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        alt_text: form.name,
      })),
    ])
    event.target.value = ''
  }

  function removeImage(index) {
    setImages((imgs) => imgs.filter((_, i) => i !== index))
  }

  function addVariant() {
    setVariants((v) => [...v, emptyVariant()])
  }

  function updateVariant(index, field, value) {
    setVariants((v) =>
      v.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  function removeVariant(index) {
    setVariants((v) => v.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      category_id: form.category_id || null,
      featured: form.featured,
      active: form.active,
      badge: form.badge || null,
    }

    let productId = id

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single()
      if (insertError || !data) {
        setError(insertError?.message || 'Could not create product.')
        setSaving(false)
        return
      }
      productId = data.id
    }

    const uploadedImages = []
    for (const image of images) {
      if (!image.file) {
        uploadedImages.push(image)
        continue
      }

      const safeName = image.file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
      const path = `${productId}/${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, image.file, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }
      const { data: publicUrl } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)
      uploadedImages.push({ image_url: publicUrl.publicUrl, alt_text: form.name })
    }

    // Replace the full set each save so removed images leave the catalog too.
    await supabase.from('product_images').delete().eq('product_id', productId)
    if (uploadedImages.length > 0) {
      await supabase.from('product_images').insert(
        uploadedImages.map((img, i) => ({
          product_id: productId,
          image_url: img.image_url,
          alt_text: img.alt_text || form.name,
          sort_order: i,
        }))
      )
    }

    // Variants: update existing rows by id (keeps their id so past orders
    // that reference a variant_id stay intact), insert new ones, and only
    // delete rows the user actually removed from the list.
    const keepIds = variants.filter((v) => v.id).map((v) => v.id)
    const { data: currentVariants } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', productId)
    const toDelete = (currentVariants || [])
      .map((v) => v.id)
      .filter((cid) => !keepIds.includes(cid))
    if (toDelete.length > 0) {
      await supabase.from('product_variants').delete().in('id', toDelete)
    }
    for (const v of variants) {
      let variantImageUrl = v.image_url || null
      if (v.image_file) {
        const safeName = v.image_file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
        const path = `${productId}/variants/${crypto.randomUUID()}-${safeName}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, v.image_file, { cacheControl: '3600', upsert: false })
        if (uploadError) {
          setError(`Variant image upload failed: ${uploadError.message}`)
          setSaving(false)
          return
        }
        variantImageUrl = supabase.storage
          .from('product-images')
          .getPublicUrl(path).data.publicUrl
      }
      const variantPayload = {
        product_id: productId,
        name: v.name || v.color || null,
        color: v.color || null,
        image_url: variantImageUrl,
        stock_quantity: Number(v.stock_quantity) || 0,
        active: v.active,
      }
      if (v.id) {
        await supabase
          .from('product_variants')
          .update(variantPayload)
          .eq('id', v.id)
      } else {
        await supabase.from('product_variants').insert(variantPayload)
      }
    }

    setSaving(false)
    navigate('/admin/products')
  }

  if (loading) return <p className="text-de-muted">Loading…</p>

  return (
    <div>
      <h1 className="mb-8 font-display text-xl uppercase tracking-tight">
        {isEdit ? 'Edit Product' : 'New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
              Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
              Price (KSh)
            </label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
              Category
            </label>
            <select
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update('featured', e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update('active', e.target.checked)}
            />
            Active / visible in store
          </label>
        </div>

        <div>
          <p className="eyebrow mb-2">Images</p>
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative h-20 w-16 bg-de-surface">
                <img
                  src={img.previewUrl || img.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-de-text text-[10px] text-de-bg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={addImageFiles}
              className="flex-1 border border-de-border bg-transparent px-3 py-2 text-sm outline-none file:mr-3 file:border-0 file:bg-de-text file:px-3 file:py-1 file:text-xs file:text-de-bg"
            />
          </div>
          <p className="mt-2 text-xs text-de-muted">
            Select one or more product images. They will upload to Supabase
            Storage when you save the product.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="eyebrow">Variants</p>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs uppercase tracking-wider underline"
            >
              + Add variant
            </button>
          </div>
          {variants.length === 0 ? (
            <p className="text-xs text-de-muted">
              No variants — this product will sell as a single item.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-2 border border-de-border p-3 sm:grid-cols-4"
                >
                  <input
                    required
                    placeholder="Color / variant name"
                    value={v.color}
                    onChange={(e) => updateVariant(i, 'color', e.target.value)}
                    className="border border-de-border bg-transparent px-2 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateVariant(i, 'image_file', e.target.files?.[0] || null)}
                    className="border border-de-border bg-transparent px-2 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock_quantity}
                    onChange={(e) =>
                      updateVariant(i, 'stock_quantity', e.target.value)
                    }
                    className="border border-de-border bg-transparent px-2 py-1.5 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="text-xs text-de-muted underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-de-accent">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-de-text px-6 py-3 text-xs font-display uppercase tracking-[0.2em] text-de-bg disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </form>
    </div>
  )
}
