import { useEffect, useState } from 'react'
import { PlayCircle, Instagram, Music2, Youtube, Facebook } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const ICONS = {
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
  facebook: Facebook,
}

export default function Music() {
  const [media, setMedia] = useState([])
  const [socials, setSocials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [mediaRes, socialsRes] = await Promise.all([
        supabase
          .from('featured_media')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('social_links')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true }),
      ])
      setMedia(mediaRes.data || [])
      setSocials(socialsRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">Rockie Dabro</p>
      <h1 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
        The Music
      </h1>

      <div className="mt-10">
        {loading ? (
          <p className="text-de-muted">Loading…</p>
        ) : media.length === 0 ? (
          <p className="text-de-muted">
            Featured videos and streaming links go live here once added from
            the admin panel.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((m) => (
              <a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="group block"
              >
                <div className="relative mb-3 aspect-video overflow-hidden bg-de-surface">
                  {m.thumbnail_url && (
                    <img
                      src={m.thumbnail_url}
                      alt={m.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  <PlayCircle
                    className="absolute inset-0 m-auto text-white drop-shadow"
                    size={36}
                  />
                </div>
                <p className="text-sm font-medium">{m.title}</p>
                <p className="text-xs uppercase tracking-wider text-de-muted">
                  {m.platform}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mt-16 border-t border-de-border pt-10">
        <h2 className="mb-6 font-display text-lg uppercase tracking-tight">
          Follow Rockie Dabro
        </h2>
        {socials.length === 0 ? (
          <p className="text-sm text-de-muted">
            Social links are managed from the admin panel.
          </p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {socials.map((s) => {
              const Icon = ICONS[s.platform?.toLowerCase()] || Music2
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-de-muted hover:text-de-text"
                >
                  <Icon size={18} />
                  <span className="text-sm">{s.label || s.platform}</span>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
