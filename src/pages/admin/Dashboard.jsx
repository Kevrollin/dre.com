import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      const [products, orders, pendingOrders, subscribers] =
        await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('order_status', 'pending'),
          supabase
            .from('newsletter_subscribers')
            .select('id', { count: 'exact', head: true }),
        ])
      setStats({
        products: products.count || 0,
        orders: orders.count || 0,
        pending: pendingOrders.count || 0,
        subscribers: subscribers.count || 0,
      })
    }
    load()
  }, [])

  const cards = [
    { label: 'Products', value: stats?.products },
    { label: 'Total Orders', value: stats?.orders },
    { label: 'Pending Orders', value: stats?.pending },
    { label: 'Subscribers', value: stats?.subscribers },
  ]

  return (
    <div>
      <h1 className="mb-8 font-display text-xl uppercase tracking-tight">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-de-border p-5">
            <p className="text-xs uppercase tracking-wider text-de-muted">
              {c.label}
            </p>
            <p className="mt-2 font-display text-2xl">{c.value ?? '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
