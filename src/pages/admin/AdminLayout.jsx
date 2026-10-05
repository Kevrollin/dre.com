import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminLayout() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  function handleNavigation() {
    setMobileMenuOpen(false)
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
          DRE Admin
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
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-de-border px-4 py-4 sm:hidden">
          <p className="font-display text-sm uppercase tracking-[0.2em]">DRE Admin</p>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close admin menu' : 'Open admin menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="text-de-text"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {mobileMenuOpen && (
          <nav className="border-b border-de-border bg-de-surface px-4 py-3 sm:hidden">
            <div className="space-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={handleNavigation}
                  className="block px-3 py-2 text-sm text-de-muted hover:bg-de-bg hover:text-de-text"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 px-3 py-2 text-xs uppercase tracking-wider text-de-muted underline"
            >
              Log out
            </button>
          </nav>
        )}

        <main className="flex-1 p-6 sm:p-10">
        <Outlet />
        </main>
      </div>
    </div>
  )
}
