import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, removeItem, setQuantity, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          Your Cart Is Empty.
        </h1>
        <p className="mt-3 text-de-muted">
          Nothing here yet. Find something worth rolling with.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block bg-de-text px-8 py-3 text-xs font-display uppercase tracking-[0.2em] text-de-bg"
        >
          Shop Merch
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl uppercase tracking-tight sm:text-3xl">
        Your Cart
      </h1>

      <ul className="divide-y divide-de-border border-y border-de-border">
        {items.map((item) => (
          <li key={item.key} className="flex gap-4 py-5">
            <div className="h-24 w-20 shrink-0 bg-de-surface">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                {item.variantName && (
                  <p className="text-sm text-de-muted">{item.variantName}</p>
                )}
                <p className="mt-1 text-sm sm:hidden">
                  KSh {item.price.toLocaleString()}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-6 sm:mt-0">
                <div className="flex items-center border border-de-border">
                  <button
                    className="px-3 py-2"
                    onClick={() => setQuantity(item.key, item.quantity - 1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button
                    className="px-3 py-2"
                    onClick={() => setQuantity(item.key, item.quantity + 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="hidden w-20 text-right text-sm sm:block">
                  KSh {(item.price * item.quantity).toLocaleString()}
                </span>
                <button
                  onClick={() => removeItem(item.key)}
                  className="text-de-muted hover:text-de-accent"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full max-w-xs items-center justify-between text-sm sm:w-64">
          <span className="text-de-muted">Subtotal</span>
          <span className="font-medium">KSh {subtotal.toLocaleString()}</span>
        </div>
        <p className="w-full max-w-xs text-right text-xs text-de-muted sm:w-64">
          Shipping calculated at checkout.
        </p>
        <div className="flex w-full max-w-xs gap-3 sm:w-64">
          <Link
            to="/shop"
            className="flex-1 border border-de-border px-4 py-3 text-center text-xs font-display uppercase tracking-[0.2em]"
          >
            Continue
          </Link>
          <Link
            to="/checkout"
            className="flex-1 bg-de-text px-4 py-3 text-center text-xs font-display uppercase tracking-[0.2em] text-de-bg"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
