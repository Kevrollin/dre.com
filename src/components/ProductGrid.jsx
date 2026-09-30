import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-3 aspect-[4/5] bg-de-border" />
            <div className="mb-1 h-3 w-3/4 bg-de-border" />
            <div className="h-3 w-1/3 bg-de-border" />
          </div>
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="py-20 text-center text-de-muted">
        No products found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
