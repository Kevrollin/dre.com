import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-2xl uppercase tracking-tight">
        Page Not Found.
      </h1>
      <Link to="/" className="mt-6 inline-block text-xs underline">
        Back to home
      </Link>
    </div>
  )
}
