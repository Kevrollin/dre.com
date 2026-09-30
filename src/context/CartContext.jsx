import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'de_cart_v1'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function lineKey(productId, variantId) {
    return `${productId}::${variantId || 'default'}`
  }

  function addItem(product, variant, quantity = 1) {
    const key = lineKey(product.id, variant?.id)
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          variantId: variant?.id || null,
          slug: product.slug,
          name: product.name,
          variantName: variant
            ? [variant.size, variant.color].filter(Boolean).join(' / ')
            : null,
          price: variant?.price_override ?? product.price,
          image: product.image || null,
          quantity,
        },
      ]
    })
    setIsOpen(true)
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  function setQuantity(key, quantity) {
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  )

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  const value = {
    items,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    subtotal,
    count,
    isOpen,
    setIsOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
