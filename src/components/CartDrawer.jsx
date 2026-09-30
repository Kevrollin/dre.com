import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, setQuantity, subtotal } =
    useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-de-text/40"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-de-bg shadow-xl">
        <div className="flex items-center justify-between border-b border-de-border px-5 py-4">
          <h2 className="font-display text-sm uppercase tracking-[0.2em]">
            Your Cart ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button onClick={() => setIsOpen(false)} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-sm uppercase tracking-[0.2em]">
                Your Cart Is Empty.
              </p>
              <p className="mt-2 max-w-[220px] text-sm text-de-muted">
                Nothing here yet. Find something worth rolling with.
              </p>
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="mt-6 bg-de-text px-6 py-3 text-xs font-display uppercase tracking-[0.2em] text-de-bg"
              >
                Shop Merch
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <div className="h-20 w-16 shrink-0 bg-de-surface">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.variantName && (
                        <p className="text-xs text-de-muted">
                          {item.variantName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-de-border">
                        <button
                          className="px-2 py-1"
                          onClick={() =>
                            setQuantity(item.key, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs">{item.quantity}</span>
                        <button
                          className="px-2 py-1"
                          onClick={() =>
                            setQuantity(item.key, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm">
                        KSh {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    aria-label="Remove item"
                    className="self-start text-de-muted hover:text-de-accent"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-de-border px-5 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-de-muted">Subtotal</span>
              <span className="font-medium">
                KSh {subtotal.toLocaleString()}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-de-text px-6 py-3 text-center text-xs font-display uppercase tracking-[0.2em] text-de-bg"
            >
              Checkout
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full text-center text-xs text-de-muted underline"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
