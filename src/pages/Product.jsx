import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'
import ProductGrid from '../components/ProductGrid'

export default function Product() {
  const { slug } = useParams()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [related, setRelated] = useState([])
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select(
          `*, product_images(id, image_url, alt_text, sort_order),
           product_variants(id, name, color, image_url, price_override, stock_quantity, active),
           categories(id, name, slug)`
        )
        .eq('slug', slug)
        .eq('active', true)
        .single()

      if (data) {
        const images = (data.product_images || []).sort(
          (a, b) => a.sort_order - b.sort_order
        )
        setProduct({ ...data, images })
        const firstActiveVariant = (data.product_variants || []).find(
          (v) => v.active && v.stock_quantity > 0
        )
        setSelectedVariant(firstActiveVariant || null)

        if (data.category_id) {
          const { data: rel } = await supabase
            .from('products')
            .select(
              'id, name, slug, price, compare_at_price, badge, product_images(image_url, sort_order)'
            )
            .eq('category_id', data.category_id)
            .eq('active', true)
            .neq('id', data.id)
            .limit(4)
          setRelated(
            (rel || []).map((p) => ({
              ...p,
              image: p.product_images?.sort(
                (a, b) => a.sort_order - b.sort_order
              )[0]?.image_url,
            }))
          )
        }
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return <div className="px-4 py-24 text-center text-de-muted">Loading…</div>
  }

  if (!product) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="mb-4 text-de-muted">Product not found.</p>
        <Link to="/shop" className="text-xs underline">
          Back to shop
        </Link>
      </div>
    )
  }

  const soldOut =
    product.product_variants?.length > 0
      ? !product.product_variants.some((v) => v.active && v.stock_quantity > 0)
      : false

  const price = selectedVariant?.price_override ?? product.price
  const onSale =
    product.compare_at_price && product.compare_at_price > product.price

  const colors = [
    ...new Set(product.product_variants?.map((v) => v.color).filter(Boolean)),
  ]

  function handleAddToCart() {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0]?.image_url,
      },
      selectedVariant,
      quantity
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/5] w-full bg-de-surface">
            {(selectedVariant?.image_url || product.images[activeImage]) && (
              <img
                src={selectedVariant?.image_url || product.images[activeImage].image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-14 shrink-0 bg-de-surface ${
                    i === activeImage ? 'ring-1 ring-de-text' : ''
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <h1 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span className={onSale ? 'text-de-accent' : ''}>
              KSh {Number(price).toLocaleString()}
            </span>
            {onSale && (
              <span className="text-de-muted line-through">
                KSh {Number(product.compare_at_price).toLocaleString()}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-sm text-de-muted">{product.description}</p>
          )}

          {colors.length > 0 && (
            <div className="mt-5">
              <p className="eyebrow mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const variant = product.product_variants.find((v) => v.color === color)
                  const isActive = selectedVariant?.color === color
                  return (
                    <button
                      key={color}
                      onClick={() => variant && setSelectedVariant(variant)}
                      disabled={!variant || variant.stock_quantity <= 0}
                      className={`flex items-center gap-2 border px-3 py-2 text-xs uppercase disabled:opacity-30 ${
                        isActive
                          ? 'border-de-text bg-de-text text-de-bg'
                          : 'border-de-border'
                      }`}
                    >
                      {variant.image_url && <img src={variant.image_url} alt="" className="h-6 w-6 object-cover" />}
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-de-border">
              <button
                className="px-3 py-2"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="px-3 text-sm">{quantity}</span>
              <button
                className="px-3 py-2"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={soldOut}
              className="flex-1 bg-de-text px-6 py-3 text-xs font-display uppercase tracking-[0.2em] text-de-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              {soldOut ? 'Sold Out' : added ? 'Added ✓' : 'Add To Cart'}
            </button>
          </div>

          <div className="mt-8 space-y-4 border-t border-de-border pt-6 text-sm text-de-muted">
            <p>Ships within Kenya. Delivery timelines confirmed at checkout.</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 font-display text-xl uppercase tracking-tight">
            You May Also Like
          </h2>
          <ProductGrid products={related} loading={false} />
        </div>
      )}
    </div>
  )
}
