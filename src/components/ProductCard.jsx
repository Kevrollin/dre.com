import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative mb-3 aspect-[4/5] overflow-hidden bg-de-surface">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-de-muted">
            <span className="font-display text-xs uppercase tracking-widest">
              DE
            </span>
          </div>
        )}

      </div>

      <h3 className="line-clamp-1 text-sm font-medium" title={product.name}>
        {product.name}
      </h3>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-de-muted">
          {product.description}
        </p>
      )}
      <p className="mt-1 text-sm text-de-muted">
        KSh {Number(product.price).toLocaleString()}
      </p>
    </Link>
  )
}
