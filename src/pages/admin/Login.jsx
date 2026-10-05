import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-de-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-de-border p-8"
      >
        <p className="mb-6 text-center font-display text-sm uppercase tracking-[0.2em]">
          DRE Admin
        </p>
        <div className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          />
        </div>
        {error && <p className="mt-3 text-xs text-de-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-de-text px-6 py-3 text-xs font-display uppercase tracking-[0.2em] text-de-bg disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
