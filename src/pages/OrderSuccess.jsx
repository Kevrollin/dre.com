import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function OrderSuccess() {
  const { reference } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!!reference)

  useEffect(() => {
    if (!reference) return
    async function load() {
      const [{ data: orderRows }, { data: itemRows }] = await Promise.all([
        supabase.rpc('get_order_by_number', { p_order_number: reference }),
        supabase.rpc('get_order_items_by_number', { p_order_number: reference }),
      ])
      setOrder(orderRows?.[0] || null)
      setItems(itemRows || [])
      setLoading(false)
    }
    load()
  }, [reference])

  if (loading) {
    return <div className="px-4 py-24 text-center text-de-muted">Loading…</div>
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          Thank You.
        </h1>
        <p className="mt-3 text-de-muted">
          Your order has been received. We'll be in touch shortly to confirm
          payment and delivery.
        </p>
        <Link to="/shop" className="mt-8 inline-block text-xs underline">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        Order Received.
      </h1>
      <p className="mt-3 text-de-muted">
        Order reference{' '}
        <span className="font-medium text-de-text">{order.order_number}</span>.
        We'll reach out on {order.customer_phone || order.customer_email} to
        confirm payment and delivery.
      </p>

      <div className="mt-8 border border-de-border p-5">
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-de-muted">
                {item.product_name}
                {item.variant_name ? ` (${item.variant_name})` : ''} ×{' '}
                {item.quantity}
              </span>
              <span>KSh {Number(item.total).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-de-border pt-4 text-sm font-medium">
          <span>Total</span>
          <span>KSh {Number(order.total).toLocaleString()}</span>
        </div>
        <div className="mt-4 flex justify-between text-xs text-de-muted">
          <span>Payment status</span>
          <span className="capitalize">{order.payment_status}</span>
        </div>
      </div>

      <Link to="/shop" className="mt-8 inline-block text-xs underline">
        Continue shopping
      </Link>
    </div>
  )
}
