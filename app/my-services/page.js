'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BackHeader from '../profile/components/BackHeader'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import servicesData from '../data/services.json'
import {
  Save,
  CheckCircle2,
  Sparkles,
  Clock,
  Calendar,
  FileText,
  Briefcase,
  X,
  Plus,
  Edit3,
  Trash2,
  Check
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'

export default function MyServicesPage() {
  const router = useRouter()

  const categories = servicesData.categories || []
  const allSubCategories = servicesData.subCategories || []

  // Selected trade role (default "Electrician")
  const [selectedRole, setSelectedRole] = useState('Electrician')

  // Services state map: { [serviceId]: { enabled: bool, price_type: 'hourly' | 'daily', price: num, price_per_hour: num, price_per_day: num, description: str } }
  const [servicesState, setServicesState] = useState({})
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // Active Editing Modal State (null if closed, service Object if open)
  const [editingService, setEditingService] = useState(null)
  const [modalFormData, setModalFormData] = useState({
    price_type: 'hourly',
    price: 199,
    description: ''
  })

  // Initialize service defaults
  const getInitialState = () => {
    const state = {}
    allSubCategories.forEach((s) => {
      state[s.id] = {
        enabled: false,
        price_type: 'hourly',
        price: s.default_price_per_hour || 199,
        price_per_hour: s.default_price_per_hour || 199,
        price_per_day: s.default_price_per_day || 1200,
        description: s.default_description || `${s.label} service performed by verified professional.`
      }
    })
    return state
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')

    try {
      const savedRole = localStorage.getItem('worker_trade_role')
      if (savedRole) setSelectedRole(savedRole)

      const savedServices = localStorage.getItem('worker_enabled_services')
      if (savedServices) {
        const parsed = JSON.parse(savedServices)
        const state = getInitialState()

        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (typeof item === 'string') {
              if (state[item]) state[item].enabled = true
            } else if (typeof item === 'object' && item.id) {
              const type = item.price_type || (item.price_per_day && !item.price_per_hour ? 'daily' : 'hourly')
              const priceVal = item.price || (type === 'daily' ? item.price_per_day : item.price_per_hour) || 199
              state[item.id] = {
                enabled: item.enabled !== false,
                price_type: type,
                price: priceVal,
                price_per_hour: type === 'hourly' ? priceVal : (item.price_per_hour || 199),
                price_per_day: type === 'daily' ? priceVal : (item.price_per_day || 1200),
                description: item.description || state[item.id]?.description || ''
              }
            }
          })
          setServicesState(state)
        } else if (typeof parsed === 'object') {
          Object.keys(parsed).forEach((id) => {
            const val = parsed[id]
            if (typeof val === 'boolean') {
              if (state[id]) state[id].enabled = val
            } else if (typeof val === 'object') {
              const type = val.price_type || (val.price_per_day && !val.price_per_hour ? 'daily' : 'hourly')
              const priceVal = val.price || (type === 'daily' ? val.price_per_day : val.price_per_hour) || 199
              state[id] = {
                enabled: val.enabled !== false,
                price_type: type,
                price: priceVal,
                price_per_hour: type === 'hourly' ? priceVal : (val.price_per_hour || 199),
                price_per_day: type === 'daily' ? priceVal : (val.price_per_day || 1200),
                description: val.description || state[id]?.description || ''
              }
            }
          })
          setServicesState(state)
        } else {
          setServicesState(getInitialState())
        }
      } else {
        setServicesState(getInitialState())
      }
    } catch {
      setServicesState(getInitialState())
    }

    if (!token) return

    async function fetchDbProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.offered_services && Array.isArray(data.offered_services) && data.offered_services.length > 0) {
            const state = getInitialState()
            data.offered_services.forEach((item) => {
              if (typeof item === 'string') {
                if (state[item]) state[item].enabled = true
              } else if (typeof item === 'object' && item.id) {
                const type = item.price_type || (item.price_per_day && !item.price_per_hour ? 'daily' : 'hourly')
                const priceVal = item.price || (type === 'daily' ? item.price_per_day : item.price_per_hour) || 199
                state[item.id] = {
                  enabled: item.enabled !== false,
                  price_type: type,
                  price: priceVal,
                  price_per_hour: type === 'hourly' ? priceVal : (item.price_per_hour || 199),
                  price_per_day: type === 'daily' ? priceVal : (item.price_per_day || 1200),
                  description: item.description || state[item.id]?.description || ''
                }
              }
            })
            setServicesState(state)
          }
        }
      } catch (e) {
        console.error('Failed to fetch profile from backend:', e)
      }
    }

    fetchDbProfile()
  }, [])

  // Open rate modal
  const openModal = (service) => {
    const current = servicesState[service.id] || {
      enabled: true,
      price_type: 'hourly',
      price: service.default_price_per_hour || 199,
      description: service.default_description || ''
    }
    setEditingService(service)
    setModalFormData({
      price_type: current.price_type || 'hourly',
      price: current.price || (current.price_type === 'daily' ? current.price_per_day : current.price_per_hour) || 199,
      description: current.description || ''
    })
  }

  // Save modal inputs to state
  const saveModalDetails = () => {
    if (!editingService) return

    const isHourly = modalFormData.price_type === 'hourly'
    const priceVal = Number(modalFormData.price) || 199

    setServicesState((prev) => ({
      ...prev,
      [editingService.id]: {
        enabled: true,
        price_type: modalFormData.price_type,
        price: priceVal,
        price_per_hour: isHourly ? priceVal : (prev[editingService.id]?.price_per_hour || priceVal),
        price_per_day: !isHourly ? priceVal : (prev[editingService.id]?.price_per_day || priceVal),
        description: modalFormData.description || ''
      }
    }))
    setEditingService(null)
  }

  // Save & Sync to backend DB
  const handleSaveAll = async () => {
    setSaving(true)
    setSavedSuccess(false)

    try {
      localStorage.setItem('worker_trade_role', selectedRole)
    } catch (e) {
      console.error('Failed to save trade role:', e)
    }

    const configuredServices = Object.keys(servicesState)
      .filter((id) => servicesState[id]?.enabled)
      .map((id) => {
        const sub = allSubCategories.find((s) => s.id === id)
        const current = servicesState[id]
        const type = current.price_type || 'hourly'
        const priceVal = Number(current.price) || 199

        return {
          id: id,
          label: sub?.label || id,
          categoryId: sub?.categoryId || selectedRole,
          enabled: true,
          price_type: type,
          price: priceVal,
          price_per_hour: type === 'hourly' ? priceVal : current.price_per_hour,
          price_per_day: type === 'daily' ? priceVal : current.price_per_day,
          description: current.description || ''
        }
      })

    try {
      localStorage.setItem('worker_enabled_services', JSON.stringify(configuredServices))
    } catch (e) {
      console.error('Failed to save locally:', e)
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/users/me/services`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ offered_services: configuredServices })
        })
      } catch (err) {
        console.error('Failed to sync services to DB:', err)
      }
    }

    setSavedSuccess(true)
    setSaving(false)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  // Filter subCategories for selected trade role
  const roleSubCategories = allSubCategories.filter(
    (s) => s.categoryId === selectedRole || (!s.categoryId && selectedRole === 'Electrician')
  )

  const activeCount = Object.keys(servicesState).filter((id) => servicesState[id]?.enabled).length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <Header />
      <BackHeader title="My Offered Services & Rates" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Trade Role Selection Bar */}
        <div className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Briefcase size={16} className="text-[#ff8a4c]" />
              <span>Select Your Trade Profession</span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-0.5 rounded-sm border border-slate-200">
              {activeCount} Listed Services
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {categories.map((cat) => {
              const isSelected = selectedRole === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedRole(cat.id)}
                  className={`px-3.5 py-3 rounded-md border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-orange-50 border-[#ff8a4c] text-[#ff8a4c] font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Services and pricing saved and synced to database!</span>
            </div>
          </div>
        )}

        {/* Clean Service List */}
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#ff8a4c]" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Available {selectedRole} Services
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Set either Per Hour or Per Day pricing
            </span>
          </div>

          {roleSubCategories.map((service) => {
            const current = servicesState[service.id] || { enabled: false }
            const isListed = current.enabled
            const isHourly = current.price_type !== 'daily'
            const displayPrice = current.price || (isHourly ? current.price_per_hour : current.price_per_day) || 199

            return (
              <div
                key={service.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition ${
                  isListed ? 'bg-orange-50/30' : 'bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm shrink-0 border ${
                    isListed ? 'bg-[#fff4ed] text-[#ff8a4c] border-orange-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {service.label.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {service.label}
                      </h3>
                      {service.tag && (
                        <span className="text-[10px] font-bold text-[#ff8a4c] bg-orange-50 px-2 py-0.5 rounded-sm border border-orange-200">
                          {service.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      {isListed ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-sm border border-emerald-200 text-[11px]">
                          <Check size={12} /> ₹{displayPrice} {isHourly ? '/ hr' : '/ day'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Listed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Modal Trigger */}
                <div className="flex items-center gap-2 shrink-0">
                  {isListed ? (
                    <button
                      type="button"
                      onClick={() => openModal(service)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-orange-200 bg-orange-50 text-[#ff8a4c] text-xs font-bold hover:bg-orange-100 transition cursor-pointer"
                    >
                      <Edit3 size={14} />
                      <span>Edit Rate</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModal(service)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm border border-slate-300 bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Service</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Save CTA */}
        <div className="pt-2">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full bg-[#ff8a4c] hover:bg-[#f07432] text-white font-bold py-3.5 rounded-md text-sm shadow-2xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>{saving ? 'Saving to Database...' : 'Save & Publish Offered Services'}</span>
          </button>
        </div>

      </main>

      {/* SERVICE RATE CONFIGURATION MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-md border border-slate-200 shadow-2xl overflow-hidden space-y-0">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#fff4ed] text-[#ff8a4c] border border-orange-200 flex items-center justify-center font-bold text-sm">
                  {editingService.label.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{editingService.label}</h3>
                  <p className="text-xs text-slate-500">Choose pricing mode & description</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="w-8 h-8 rounded-sm bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-5 space-y-4">

              {/* Pricing Type Selector (Per Hour OR Per Day) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Pricing Mode (Select Hour OR Day Rate)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalFormData({ ...modalFormData, price_type: 'hourly', price: modalFormData.price || editingService.default_price_per_hour || 199 })}
                    className={`py-2.5 px-3 rounded-sm border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalFormData.price_type === 'hourly'
                        ? 'bg-orange-50 border-[#ff8a4c] text-[#ff8a4c] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock size={15} />
                    <span>Price Per Hour</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalFormData({ ...modalFormData, price_type: 'daily', price: modalFormData.price || editingService.default_price_per_day || 1200 })}
                    className={`py-2.5 px-3 rounded-sm border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalFormData.price_type === 'daily'
                        ? 'bg-orange-50 border-[#ff8a4c] text-[#ff8a4c] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar size={15} />
                    <span>Price Per Day</span>
                  </button>
                </div>
              </div>

              {/* Price Input Field */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                  {modalFormData.price_type === 'hourly' ? (
                    <>
                      <Clock size={14} className="text-[#ff8a4c]" />
                      <span>Set Hourly Rate (₹/hr)</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={14} className="text-[#ff8a4c]" />
                      <span>Set Daily Rate (₹/day)</span>
                    </>
                  )}
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={modalFormData.price}
                    onChange={(e) => setModalFormData({ ...modalFormData, price: e.target.value })}
                    placeholder={modalFormData.price_type === 'hourly' ? "e.g. 199" : "e.g. 1200"}
                    className="w-full pl-8 pr-14 py-2 text-sm bg-white rounded-sm border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#ff8a4c]"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">
                    {modalFormData.price_type === 'hourly' ? '/ hr' : '/ day'}
                  </span>
                </div>
              </div>

              {/* Scope Description */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                  <FileText size={14} className="text-[#ff8a4c]" />
                  <span>Service Scope / Description</span>
                </label>
                <textarea
                  rows={3}
                  value={modalFormData.description}
                  onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                  placeholder="Detail what equipment or guarantees are included..."
                  className="w-full p-2.5 text-xs bg-white rounded-sm border border-slate-300 text-slate-800 leading-relaxed focus:outline-none focus:border-[#ff8a4c]"
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              {servicesState[editingService.id]?.enabled ? (
                <button
                  type="button"
                  onClick={() => {
                    setServicesState((prev) => ({
                      ...prev,
                      [editingService.id]: { ...prev[editingService.id], enabled: false }
                    }))
                    setEditingService(null)
                  }}
                  className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Remove Service</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Click confirm to list</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-sm border border-slate-200 bg-white text-[#52525b] text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveModalDetails}
                  className="px-4 py-2 rounded-sm bg-[#ff8a4c] hover:bg-[#f07432] text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Confirm Service</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
