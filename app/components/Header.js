'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, MapPin } from 'lucide-react'
import WorkerLocationModal from './WorkerLocationModal'
import { API_BASE_URL, apiFetch } from '@/lib/api'

export default function Header() {
  const router = useRouter()
  const [online, setOnline] = useState(true)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [partnerName, setPartnerName] = useState('Partner')
  const [locationArea, setLocationArea] = useState('Nagpur, MH')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('isOnline')
    if (saved !== null) setOnline(saved === 'true')

    const savedLoc = localStorage.getItem('worker_location_area')
    if (savedLoc) setLocationArea(savedLoc)
  }, [])

  useEffect(() => {
    try {
      const name =
        localStorage.getItem('kazilen_professional_name') ||
        localStorage.getItem('professionalName') ||
        ''
      if (name) setPartnerName(name.trim())
    } catch {}

    apiFetch(`${API_BASE_URL}/users/me`, {
      headers: { }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.full_name) setPartnerName(data.full_name)
          if (data.is_online !== undefined) {
            setOnline(Boolean(data.is_online))
            localStorage.setItem('isOnline', data.is_online ? 'true' : 'false')
          }
          if (data.location && data.location.area) {
            const displayLoc = `${data.location.area}, ${data.location.city || 'Nagpur'}`
            setLocationArea(displayLoc)
            localStorage.setItem('worker_location_area', displayLoc)
          }
        }
      })
      .catch(() => {})
  }, [])

  const toggle = async () => {
    if (toggleLoading) return
    const nextState = !online
    setOnline(nextState)
    localStorage.setItem('isOnline', nextState ? 'true' : 'false')

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('worker_online_status_changed', { detail: { is_online: nextState } }))
    }

    try {
      setToggleLoading(true)
      const res = await apiFetch(`${API_BASE_URL}/users/me/online`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_online: nextState })
      })
      if (!res.ok) {
        setOnline(!nextState)
        localStorage.setItem('isOnline', !nextState ? 'true' : 'false')
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('worker_online_status_changed', { detail: { is_online: !nextState } }))
        }
        alert('Failed to update online status on the server. Please try again.')
      }
    } catch (e) {
      setOnline(!nextState)
      localStorage.setItem('isOnline', !nextState ? 'true' : 'false')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('worker_online_status_changed', { detail: { is_online: !nextState } }))
      }
      alert('Network error while updating online status.')
    } finally {
      setToggleLoading(false)
    }
  }

  return (
    <>
      <header className="w-full bg-white rounded-md border border-slate-200 px-4 py-3 shadow-2xs flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-base font-extrabold text-slate-900 hover:text-[#ff8a4c] transition cursor-pointer"
          >
            Kazilen Partner
          </button>

          <span className="h-4 w-px bg-slate-200" />

          {/* Interactive Live Location Badge */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-sm hover:bg-slate-100/80 text-xs text-slate-600 font-medium transition cursor-pointer group"
            title="Click to update live operational location"
          >
            <MapPin size={13} className="text-[#ff8a4c] group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[190px]">{locationArea}</span>
          </button>
        </div>

        {/* Online Switch & Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-bold transition cursor-pointer ${
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
            className="w-8 h-8 rounded-sm bg-slate-900 text-white flex items-center justify-center transition cursor-pointer hover:bg-slate-800 shrink-0"
            aria-label="Profile"
            title={partnerName}
          >
            <User size={15} />
          </button>
        </div>
      </header>

      {/* Location Setup Modal */}
      <WorkerLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationUpdated={(loc) => {
          const displayLoc = loc.area ? `${loc.area}, ${loc.city || 'Nagpur'}` : 'Nagpur, MH'
          setLocationArea(displayLoc)
        }}
      />
    </>
  )
}
