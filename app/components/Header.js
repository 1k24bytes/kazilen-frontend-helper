'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, MapPin } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const [online, setOnline] = useState(true)
  const [partnerName, setPartnerName] = useState('Partner')

  useEffect(() => {
    const saved = localStorage.getItem('isOnline')
    if (saved !== null) setOnline(saved === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('isOnline', online ? 'true' : 'false')
  }, [online])

  useEffect(() => {
    try {
      const name =
        localStorage.getItem('kazilen_professional_name') ||
        localStorage.getItem('professionalName') ||
        ''
      if (name) setPartnerName(name.trim())
    } catch {}
  }, [])

  const toggle = () => setOnline((prev) => !prev)

  return (
    <header className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-2xs flex items-center justify-between gap-4">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-base font-extrabold text-slate-900 hover:text-[#ff8a4c] transition"
        >
          Kazilen Partner
        </button>

        <span className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <MapPin size={13} className="text-slate-400" />
          <span>Nagpur, MH</span>
        </div>
      </div>

      {/* Online Switch & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
            online
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span>{online ? 'ONLINE' : 'OFFLINE'}</span>
        </button>

        <button
          onClick={() => router.push('/profile')}
          className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center transition cursor-pointer hover:bg-slate-800 shrink-0"
          aria-label="Profile"
          title={partnerName}
        >
          <User size={15} />
        </button>
      </div>
    </header>
  )
}
