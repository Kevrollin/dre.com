import { useState } from 'react'
import { X } from 'lucide-react'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="flex items-center justify-center gap-3 border-b border-de-border bg-de-text px-4 py-2 text-de-bg">
      <p className="text-[11px] font-display uppercase tracking-[0.25em]">
        Official Dab Rollin Empire Merch · Made For The Rollin
      </p>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        className="shrink-0 text-de-bg/70 hover:text-de-bg"
      >
        <X size={14} />
      </button>
    </div>
  )
}
