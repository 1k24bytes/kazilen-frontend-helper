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
  Check,
  Zap
} from 'lucide-react'
import { API_BASE_URL, apiFetch } from '@/lib/api'

export default function MyServicesPage() {
  const router = useRouter()

  const categories = servicesData.categories || []
  const allSubCategories = servicesData.subCategories || []

  // Selected trade role (default "Electrician")
  const [selectedRole, setSelectedRole] = useState('Electrician')

  // Services state map: { [serviceId]: { enabled: bool, price_type: 'fixed' | 'hourly', price: num, price_per_hour: num, fixed_price: num, description: str } }
  const [servicesState, setServicesState] = useState({})
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // Active Editing Modal State (null if closed, service Object if open)
  const [editingService, setEditingService] = useState(null)
  const [modalFormData, setModalFormData] = useState({
    price_type: 'fixed',
    price: 249,
    description: ''
  })

  // Initialize service defaults
  const getInitialState = () => {
    const state = {}
    allSubCategories.forEach((s) => {
      const type = s.default_price_type || (s.default_fixed_price ? 'fixed' : 'hourly')
      const defaultPrice = type === 'fixed' ? (s.default_fixed_price || 249) : (s.default_price_per_hour || 199)
      state[s.id] = {
        enabled: false,
        price_type: type,
        price: defaultPrice,
        price_per_hour: s.default_price_per_hour || 199,
        fixed_price: s.default_fixed_price || 249,
        description: s.default_description || `${s.label} service performed by verified professional.`
      }
    })
    return state
  }

  useEffect(() => {

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
              const type = item.price_type === 'hourly' ? 'hourly' : 'fixed'
              const priceVal = item.price || (type === 'hourly' ? item.price_per_hour : (item.fixed_price || item.price_per_day)) || 249
              state[item.id] = {
                enabled: item.enabled !== false,
                price_type: type,
                price: priceVal,
                price_per_hour: type === 'hourly' ? priceVal : (item.price_per_hour || 199),
                fixed_price: type === 'fixed' ? priceVal : (item.fixed_price || item.price_per_day || 249),
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
              const type = val.price_type === 'hourly' ? 'hourly' : 'fixed'
              const priceVal = val.price || (type === 'hourly' ? val.price_per_hour : (val.fixed_price || val.price_per_day)) || 249
              state[id] = {
                enabled: val.enabled !== false,
                price_type: type,
                price: priceVal,
                price_per_hour: type === 'hourly' ? priceVal : (val.price_per_hour || 199),
                fixed_price: type === 'fixed' ? priceVal : (val.fixed_price || val.price_per_day || 249),
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

    async function fetchDbProfile() {
      try {
        const res = await apiFetch(`${API_BASE_URL}/users/me`, {
          headers: { }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.offered_services && Array.isArray(data.offered_services) && data.offered_services.length > 0) {
            const state = getInitialState()
            data.offered_services.forEach((item) => {
              if (typeof item === 'string') {
                if (state[item]) state[item].enabled = true
              } else if (typeof item === 'object' && item.id) {
                const type = item.price_type === 'hourly' ? 'hourly' : 'fixed'
                const priceVal = item.price || (type === 'hourly' ? item.price_per_hour : (item.fixed_price || item.price_per_day)) || 249
                state[item.id] = {
                  enabled: item.enabled !== false,
                  price_type: type,
                  price: priceVal,
                  price_per_hour: type === 'hourly' ? priceVal : (item.price_per_hour || 199),
                  fixed_price: type === 'fixed' ? priceVal : (item.fixed_price || item.price_per_day || 249),
                  description: item.description || state[item.id]?.description || ''
                }
              }
            })
            localStorage.setItem('worker_enabled_services', JSON.stringify(data.offered_services))
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
      price_type: service.default_price_type || 'fixed',
      price: service.default_fixed_price || service.default_price_per_hour || 249,
      description: service.default_description || ''
    }
    const defaultType = current.price_type || service.default_price_type || 'fixed'
    const defaultVal = current.price || (defaultType === 'hourly' ? (current.price_per_hour || service.default_price_per_hour || 199) : (current.fixed_price || service.default_fixed_price || 249))

    setEditingService(service)
    setModalFormData({
      price_type: defaultType,
      price: defaultVal,
      description: current.description || ''
    })
  }

  // Save modal inputs to state
  const saveModalDetails = () => {
    if (!editingService) return

    const isHourly = modalFormData.price_type === 'hourly'
    const priceVal = Number(modalFormData.price) || (isHourly ? 199 : 249)

    setServicesState((prev) => ({
      ...prev,
      [editingService.id]: {
        enabled: true,
        price_type: modalFormData.price_type,
        price: priceVal,
        price_per_hour: isHourly ? priceVal : (prev[editingService.id]?.price_per_hour || 199),
        fixed_price: !isHourly ? priceVal : (prev[editingService.id]?.fixed_price || 249),
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
        const type = current.price_type === 'hourly' ? 'hourly' : 'fixed'
        const priceVal = Number(current.price) || (type === 'hourly' ? 199 : 249)

        return {
          id: id,
          label: sub?.label || id,
          categoryId: sub?.categoryId || selectedRole,
          enabled: true,
          price_type: type,
          price: priceVal,
          price_per_hour: type === 'hourly' ? priceVal : (current.price_per_hour || 199),
          fixed_price: type === 'fixed' ? priceVal : (current.fixed_price || 249),
          description: current.description || ''
        }
      })

    try {
      localStorage.setItem('worker_enabled_services', JSON.stringify(configuredServices))
    } catch (e) {
      console.error('Failed to save locally:', e)
    }
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/me/services`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offered_services: configuredServices })
      })

      if (res.status === 401) {
        alert('Your session has expired. Please log in again.')
        router.push('/login')
        setSaving(false)
        return
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        alert(errData.detail || 'Failed to save services to database. Please try again.')
        setSaving(false)
        return
      }

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3500)
    } catch (err) {
      console.error('Failed to sync services to DB:', err)
      alert('Network error while saving services to database.')
    } finally {
      setSaving(false)
    }
  }

  // Filter subCategories for selected trade role
  const roleSubCategories = allSubCategories.filter(
    (s) => s.categoryId === selectedRole || (!s.categoryId && selectedRole === 'Electrician')
  )

  const activeCount = Object.keys(servicesState).filter((id) => servicesState[id]?.enabled).length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
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
            <span className="text-xs text-slate-500 font-medium">
              {activeCount} active service{activeCount === 1 ? '' : 's'} listed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((cat) => {
              const isSelected = selectedRole === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedRole(cat.id)}
                  className={`p-3 rounded-sm border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-[#fff4ed] border-[#ff8a4c] shadow-2xs ring-1 ring-[#ff8a4c]'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#ff8a4c]' : 'text-slate-800'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Saved Success Toast */}
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Offered services and custom rates saved successfully!</span>
          </div>
        )}

        {/* Sub-Services List */}
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#ff8a4c]" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Available {selectedRole} Services
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Set either Fixed Job Price or Hourly (/hr) rate
            </span>
          </div>

          {roleSubCategories.map((service) => {
            const current = servicesState[service.id] || { enabled: false }
            const isListed = current.enabled
            const isHourly = current.price_type === 'hourly'
            const displayPrice = current.price || (isHourly ? current.price_per_hour : current.fixed_price) || 249

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
                          <Check size={12} /> ₹{displayPrice} {isHourly ? '/ hr' : 'Fixed Job'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Listed</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isListed ? (
                    <button
                      type="button"
                      onClick={() => openModal(service)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-orange-200 bg-orange-50 text-[#ff8a4c] text-xs font-bold hover:bg-orange-100 transition cursor-pointer"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModal(service)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm border border-slate-300 bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full bg-[#ff8a4c] hover:bg-[#f07432] text-white font-bold py-3.5 rounded-md text-sm shadow-2xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save & Publish Offered Services'}</span>
          </button>
        </div>

      </main>

      {/* SERVICE RATE CONFIGURATION MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-md border border-slate-200 shadow-2xl overflow-hidden space-y-0">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#fff4ed] text-[#ff8a4c] border border-orange-200 flex items-center justify-center font-bold text-sm">
                  {editingService.label.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{editingService.label}</h3>
                  <p className="text-xs text-slate-500">Choose pricing mode & rate</p>
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

            <div className="p-5 space-y-4">

              {/* Pricing Type Selector (Fixed Job Price OR Price Per Hour) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Pricing Mode (Select Fixed Price OR Hourly Rate)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalFormData({ ...modalFormData, price_type: 'fixed', price: modalFormData.price || editingService.default_fixed_price || 249 })}
                    className={`py-2.5 px-3 rounded-sm border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      modalFormData.price_type === 'fixed'
                        ? 'bg-orange-50 border-[#ff8a4c] text-[#ff8a4c] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Zap size={15} />
                    <span>Fixed Job Price</span>
                  </button>

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
                </div>
              </div>

              {/* Price Input Field */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                  {modalFormData.price_type === 'fixed' ? (
                    <>
                      <Zap size={14} className="text-[#ff8a4c]" />
                      <span>Set Fixed Job Price (₹ Flat for complete job)</span>
                    </>
                  ) : (
                    <>
                      <Clock size={14} className="text-[#ff8a4c]" />
                      <span>Set Hourly Rate (₹/hr)</span>
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
                    placeholder={modalFormData.price_type === 'fixed' ? "e.g. 249" : "e.g. 199"}
                    className="w-full pl-8 pr-20 py-2 text-sm bg-white rounded-sm border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#ff8a4c]"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">
                    {modalFormData.price_type === 'fixed' ? 'Fixed / Job' : '/ hr'}
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
                  placeholder="Detail what tasks, equipment or warranty are included..."
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
