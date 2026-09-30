import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Search, ShoppingBag } from 'lucide-react'
import { NAV_LINKS } from '../data/navigation'
import { useCart } from '../context/CartContext'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { count, setIsOpen } = useCart()
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-de-border bg-de-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-de-text font-display text-sm font-semibold">
            DE
          </span>
          <span className="hidden font-display text-sm font-semibold uppercase tracking-[0.2em] sm:inline">
            Dab Rollin Empire
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `font-display text-xs uppercase tracking-[0.2em] transition-colors hover:text-de-accent ${
                  isActive ? 'text-de-accent' : 'text-de-text'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden text-de-text hover:text-de-accent sm:block"
          >
            <Search size={19} />
          </button>
          <button
            aria-label="Open cart"
            onClick={() => setIsOpen(true)}
            className="relative text-de-text hover:text-de-accent"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-de-accent text-[10px] font-medium text-white">
                {count}
              </span>
            )}
          </button>
          <button
            aria-label="Toggle menu"
            className="text-de-text md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form
          onSubmit={handleSearch}
          className="border-t border-de-border bg-de-surface px-4 py-3 sm:px-6 lg:px-8"
        >
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full max-w-md border-b border-de-border bg-transparent py-1 text-sm outline-none placeholder:text-de-muted"
          />
        </form>
      )}

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-de-border bg-de-surface px-4 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="py-2 font-display text-sm uppercase tracking-[0.2em]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="py-2 font-display text-sm uppercase tracking-[0.2em]"
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  )
}
