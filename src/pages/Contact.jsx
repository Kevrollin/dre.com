import { useState } from 'react'
import { Instagram, Music2, Youtube, Mail } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    const { error } = await supabase.from('contact_messages').insert(form)
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">Get In Touch</p>
      <h1 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
        Contact
      </h1>
      <p className="mt-4 max-w-lg text-de-muted">
        Questions about an order, a collaboration, or the brand? Reach out
        below.
      </p>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <textarea
            required
            rows={5}
            placeholder="Message"
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="w-full border border-de-border bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-de-text px-6 py-3 text-xs font-display uppercase tracking-[0.2em] text-de-bg disabled:opacity-60"
          >
            {status === 'loading' ? 'Sending…' : 'Send Message'}
          </button>
          {status === 'success' && (
            <p className="text-xs text-de-accent">Message sent. We'll be in touch.</p>
          )}
          {status === 'error' && (
            <p className="text-xs text-de-muted">Something went wrong. Try again.</p>
          )}
        </form>

        <div>
          <h2 className="eyebrow mb-3">Direct</h2>
          <a
            href="mailto:hello@dabrollinempire.com"
            className="flex items-center gap-2 text-sm text-de-muted hover:text-de-text"
          >
            <Mail size={16} /> hello@dabrollinempire.com
          </a>
          <p className="mt-2 text-xs text-de-muted">
            Placeholder — update to the real support email once confirmed.
          </p>

          <h2 className="eyebrow mb-3 mt-8">Follow</h2>
          <div className="flex gap-4 text-de-muted">
            <Instagram size={18} />
            <Music2 size={18} />
            <Youtube size={18} />
          </div>
        </div>
      </div>
    </div>
  )
}
