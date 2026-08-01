'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BackHeader from '../profile/components/BackHeader'
import Header from '../components/Header'
import servicesData from '../data/services.json'
import { Lock, Save, CheckCircle2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react'

export default function MyServicesPage() {
  const router = useRouter()
  const [enabledMap, setEnabledMap] = useState({})
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const subCategories = servicesData.subCategories || []

  useEffect(() => {
    const token = localStorage.getItem('access_token')

    // Initial fallback load from localStorage
    try {
      const saved = localStorage.getItem('worker_enabled_services')
      if (saved) {
        setEnabledMap(JSON.parse(saved))
      } else {
        const initial = {}
        subCategories.forEach((s) => {
          initial[s.id] = true
        })
        setEnabledMap(initial)
      }
    } catch {
      const initial = {}
      subCategories.forEach((s) => {
        initial[s.id] = true
      })
      setEnabledMap(initial)
    }

    if (!token) return

    // Sync from Backend Database
    async function fetchDbServices() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.offered_services) && data.offered_services.length > 0) {
            const mapFromDb = {}
            subCategories.forEach((s) => {
              mapFromDb[s.id] = data.offered_services.includes(s.id)
            })
            setEnabledMap(mapFromDb)
            localStorage.setItem('worker_enabled_services', JSON.stringify(mapFromDb))
          }
        }
      } catch (e) {
        console.error('Failed to sync services from DB:', e)
      }
    }

    fetchDbServices()
  }, [router])

  const toggleService = (id) => {
    setEnabledMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSavedSuccess(false)
    
    const enabledIds = Object.keys(enabledMap).filter((id) => enabledMap[id])

    // 1. Save locally
    try {
      localStorage.setItem('worker_enabled_services', JSON.stringify(enabledMap))
    } catch (e) {
      console.error('Failed to save locally:', e)
    }

    // 2. Sync to Backend DB
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/services`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ offered_services: enabledIds })
        })
      } catch (err) {
        console.error('Failed to sync services to DB:', err)
      }
    }

    setSavedSuccess(true)
    setSaving(false)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const enabledCount = Object.values(enabledMap).filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <Header />
      <BackHeader title="My Offered Services" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Banner Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Sparkles size={16} className="text-[#ff8a4c]" />
              <span>Service Dispatch Preferences</span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {enabledCount} / {subCategories.length} Active
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Toggle which Electrician services you are equipped to perform in Nagpur. Preferences are saved to your database profile to route relevant customer dispatches. Fixed service rates are set by the platform and non-editable.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Offered service preferences saved and synced to database!</span>
          </div>
        )}

        {/* Services List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {subCategories.map((service) => {
            const isEnabled = enabledMap[service.id] !== false

            return (
              <div
                key={service.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition ${
                  isEnabled ? 'bg-white' : 'bg-slate-50/70 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                    isEnabled ? 'bg-[#fff4ed] text-[#ff8a4c] border-orange-200' : 'bg-slate-200 text-slate-500 border-slate-300'
                  }`}>
                    {service.label.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {service.label}
                      </h3>
                      {service.tag && (
                        <span className="text-[10px] font-bold text-[#ff8a4c] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                          {service.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-bold text-slate-900">₹{service.price}</span>
                      <span className="text-slate-400">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Lock size={11} /> Platform Fixed Rate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 ${
                    isEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {isEnabled ? (
                    <>
                      <ToggleRight size={18} className="text-emerald-600" />
                      <span>ENABLED</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={18} className="text-slate-400" />
                      <span>DISABLED</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Save CTA */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#ff8a4c] hover:bg-[#f07432] text-white font-bold py-3.5 rounded-xl text-sm shadow-2xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>{saving ? 'Saving & Syncing to DB...' : 'Save Offered Services'}</span>
          </button>
        </div>

      </main>
    </div>
  )
}
