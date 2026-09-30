import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Uasin Gishu',
  'Machakos', 'Kajiado', 'Nyeri', 'Meru', 'Other',
]

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    county: '',
    city: '',
    delivery_notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) return
    setSubmitting(true)
    setError('')

    // Prices and stock are re-checked server-side inside place_order — the
    // client never gets to dictate what an order actually costs.
    const { data, error: rpcError } = await supabase.rpc('place_order', {
      p_customer_name: form.customer_name,
      p_customer_email: form.customer_email,
      p_customer_phone: form.customer_phone,
      p_delivery_address: form.delivery_address,
      p_county: form.county,
      p_city: form.city,
      p_delivery_notes: form.delivery_notes || null,
      p_items: items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
    })

    if (rpcError || !data || !data[0]) {
      setError(
        rpcError?.message ||
          'We could not place your order right now. Please try again or contact us directly.'
      )
      setSubmitting(false)
      return
    }

    clearCart()
    navigate(`/order/${data[0].order_number}`)
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <p className="text-de-muted">Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl uppercase tracking-tight sm:text-3xl">
        Checkout
      </h1>

      <div className="grid gap-12 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
              Full name
            </label>
            <input
              required
              value={form.customer_name}
              onChange={(e) => update('customer_name', e.target.value)}
              className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
                Email
              </label>
              <input
                required
                type="email"
                value={form.customer_email}
                onChange={(e) => update('customer_email', e.target.value)}
                className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
                Phone
              </label>
              <input
                required
                type="tel"
                value={form.customer_phone}
                onChange={(e) => update('customer_phone', e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
              Delivery address
            </label>
            <input
              required
              value={form.delivery_address}
              onChange={(e) => update('delivery_address', e.target.value)}
              className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
                County
              </label>
              <select
                required
                value={form.county}
                onChange={(e) => update('county', e.target.value)}
                className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
              >
                <option value="" disabled>
                  Select county
                </option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
                City / Town
              </label>
              <input
                required
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
              Delivery notes (optional)
            </label>
            <textarea
              value={form.delivery_notes}
              onChange={(e) => update('delivery_notes', e.target.value)}
              rows={3}
              className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>

          {error && <p className="text-sm text-de-accent">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-de-text px-6 py-3.5 text-xs font-display uppercase tracking-[0.2em] text-de-bg disabled:opacity-60"
          >
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
          <p className="text-xs text-de-muted">
            Payment is arranged after order confirmation. No payment is taken
            on this page yet.
          </p>
        </form>

        <div className="lg:col-span-2">
          <div className="border border-de-border p-5">
            <h2 className="eyebrow mb-4">Order Summary</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.key} className="flex justify-between text-sm">
                  <span className="text-de-muted">
                    {item.name}
                    {item.variantName ? ` (${item.variantName})` : ''} ×{' '}
                    {item.quantity}
                  </span>
                  <span>
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-de-border pt-4 text-sm font-medium">
              <span>Total</span>
              <span>KSh {subtotal.toLocaleString()}</span>
            </div>
            <p className="mt-2 text-xs text-de-muted">
              Final total is confirmed by the server and may differ slightly
              if a price changed since this was added to your cart.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
