import { Link } from 'react-router-dom'
import { Instagram, Music2, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-de-border bg-de-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-de-text font-display text-xs font-semibold">
              DRE
            </span>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.2em]">
              Dab Rollin Empire
            </span>
          </div>
          <p className="max-w-xs text-sm text-de-muted">
            Official merchandise from Rockie Dabro. An extension of the sound,
            the identity, the movement.
          </p>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="text-de-muted hover:text-de-text">All Products</Link></li>
            <li><Link to="/shop" className="text-de-muted hover:text-de-text">New Drops</Link></li>
            <li><Link to="/cart" className="text-de-muted hover:text-de-text">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Brand</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-de-muted hover:text-de-text">About</Link></li>
            <li><Link to="/music" className="text-de-muted hover:text-de-text">Music</Link></li>
            <li><Link to="/contact" className="text-de-muted hover:text-de-text">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Follow</h4>
          <div className="flex gap-4">
            <Instagram size={18} className="text-de-muted" />
            <Music2 size={18} className="text-de-muted" />
            <Youtube size={18} className="text-de-muted" />
          </div>
          <p className="mt-3 text-xs text-de-muted">
            Social links are managed from the admin panel.
          </p>
        </div>
      </div>

      <div className="border-t border-de-border px-4 py-6 text-center text-xs text-de-muted sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Dab Rollin Empire. All rights reserved.
      </div>
    </footer>
  )
}
