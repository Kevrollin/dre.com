import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase() })
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setEmail('')
    }
  }

  return (
    <section className="border-y border-de-border bg-de-surface">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">
          Don't Miss The Next Drop.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-de-muted">
          Get notified about new releases, limited merchandise and updates
          from Dab Rollin Empire.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex max-w-sm items-stretch gap-0 border border-de-border"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-de-muted"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="shrink-0 bg-de-text px-5 text-xs font-display uppercase tracking-[0.2em] text-de-bg disabled:opacity-60"
          >
            {status === 'loading' ? '...' : 'Join'}
          </button>
        </form>
        {status === 'success' && (
          <p className="mt-3 text-xs text-de-accent">You're on the list.</p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-xs text-de-muted">
            Something went wrong. Try again.
          </p>
        )}
      </div>
    </section>
  )
}
