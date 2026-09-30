import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function AdminLayout() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session === null) {
      navigate('/admin/login', { replace: true, state: { from: location } })
    }
  }, [session, navigate, location])

  if (session === undefined) {
    return <div className="p-10 text-center text-de-muted">Loading…</div>
  }
  if (!session) return null

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const links = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/music', label: 'Music' },
  ]

  return (
    <div className="flex min-h-screen bg-de-bg text-de-text">
      <aside className="hidden w-56 shrink-0 border-r border-de-border p-6 sm:block">
        <p className="mb-8 font-display text-sm uppercase tracking-[0.2em]">
          DE Admin
        </p>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block px-3 py-2 text-sm text-de-muted hover:bg-de-surface hover:text-de-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-10 text-xs uppercase tracking-wider text-de-muted underline"
        >
          Log out
        </button>
      </aside>
      <main className="flex-1 p-6 sm:p-10">
        <Outlet />
      </main>
    </div>
  )
}
