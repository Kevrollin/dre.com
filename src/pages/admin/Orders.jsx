import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState([])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleExpand(order) {
    if (expanded === order.id) {
      setExpanded(null)
      return
    }
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
    setItems(data || [])
    setExpanded(order.id)
  }

  async function updateStatus(order, field, value) {
    await supabase.from('orders').update({ [field]: value }).eq('id', order.id)
    load()
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-xl uppercase tracking-tight">
        Orders
      </h1>

      {loading ? (
        <p className="text-de-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-de-muted">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border border-de-border">
              <button
                onClick={() => toggleExpand(o)}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left text-sm"
              >
                <span className="font-medium">{o.order_number}</span>
                <span className="text-de-muted">{o.customer_name}</span>
                <span>KSh {Number(o.total).toLocaleString()}</span>
                <span className="text-xs uppercase tracking-wider text-de-muted">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </button>

              {expanded === o.id && (
                <div className="border-t border-de-border p-4">
                  <div className="mb-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-de-muted">Contact</p>
                      <p>{o.customer_email}</p>
                      <p>{o.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-de-muted">Delivery</p>
                      <p>{o.delivery_address}</p>
                      <p>{o.city}, {o.county}</p>
                      {o.delivery_notes && (
                        <p className="text-de-muted">{o.delivery_notes}</p>
                      )}
                    </div>
                  </div>

                  <ul className="mb-4 space-y-2 text-sm">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span className="text-de-muted">
                          {item.product_name}
                          {item.variant_name ? ` (${item.variant_name})` : ''} ×{' '}
                          {item.quantity}
                        </span>
                        <span>KSh {Number(item.total).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
                        Order status
                      </label>
                      <select
                        value={o.order_status}
                        onChange={(e) =>
                          updateStatus(o, 'order_status', e.target.value)
                        }
                        className="border border-de-border bg-transparent px-3 py-2 text-sm outline-none"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-de-muted">
                        Payment status
                      </label>
                      <select
                        value={o.payment_status}
                        onChange={(e) =>
                          updateStatus(o, 'payment_status', e.target.value)
                        }
                        className="border border-de-border bg-transparent px-3 py-2 text-sm outline-none"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
