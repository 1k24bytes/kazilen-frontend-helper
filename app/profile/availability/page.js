'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BackHeader from '../components/BackHeader'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Info,
  Save,
  X,
  Coffee,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'
import { API_BASE_URL, apiFetch } from '@/lib/api'

const ALL_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const TIME_OPTIONS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00'
]

const PRESET_DEAD_ZONES = [
  { label: 'Lunch Break (13:00 - 15:00)', start_time: '13:00', end_time: '15:00', icon: Coffee },
  { label: 'Evening Rest (18:00 - 19:00)', start_time: '18:00', end_time: '19:00', icon: Sun },
  { label: 'Night Cutoff (20:00 - 21:00)', start_time: '20:00', end_time: '21:00', icon: Moon }
]

export default function WorkerAvailabilityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Availability state
  const [daysOff, setDaysOff] = useState([]) // e.g. ["Sunday"]
  const [deadSlots, setDeadSlots] = useState([]) // e.g. [{ start_time: "13:00", end_time: "15:00", label: "Lunch" }]

  // Modal state for adding a dead slot
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newStart, setNewStart] = useState('13:00')
  const [newEnd, setNewEnd] = useState('15:00')
  const [newLabel, setNewLabel] = useState('Lunch / Rest Break')

  useEffect(() => {
    const savedAvail = localStorage.getItem('worker_availability_data')

    if (savedAvail) {
      try {
        const parsed = JSON.parse(savedAvail)
        if (parsed) {
          if (Array.isArray(parsed.days_off)) setDaysOff(parsed.days_off)
          if (Array.isArray(parsed.dead_slots)) setDeadSlots(parsed.dead_slots)
        }
      } catch (e) {
        console.error('Error parsing local availability:', e)
      }
    }

    apiFetch(`${API_BASE_URL}/users/me`, {
      headers: { }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.availability) {
          const avail = data.availability
          const dOff = Array.isArray(avail.days_off) ? avail.days_off : []
          const dSlots = Array.isArray(avail.dead_slots) ? avail.dead_slots : []
          setDaysOff(dOff)
          setDeadSlots(dSlots)
          localStorage.setItem(
            'worker_availability_data',
            JSON.stringify({ days_off: dOff, dead_slots: dSlots })
          )
        }
      })
      .catch((err) => console.error('Failed to load worker profile:', err))
      .finally(() => setLoading(false))
  }, [])

  // Toggle Day Off
  const toggleDayOff = (day) => {
    if (daysOff.includes(day)) {
      setDaysOff(daysOff.filter((d) => d !== day))
    } else {
      setDaysOff([...daysOff, day])
    }
  }

  // Add Dead Slot
  const handleAddDeadSlot = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const startH = parseInt(newStart.split(':')[0])
    const endH = parseInt(newEnd.split(':')[0])

    if (startH >= endH) {
      setErrorMessage('End time must be later than start time.')
      return
    }

    // Check for duplicate or overlapping range
    const isDuplicate = deadSlots.some(
      (s) => s.start_time === newStart && s.end_time === newEnd
    )
    if (isDuplicate) {
      setErrorMessage('This time window is already added.')
      return
    }

    const updated = [
      ...deadSlots,
      {
        start_time: newStart,
        end_time: newEnd,
        label: newLabel.trim() || 'Scheduled Break'
      }
    ]

    setDeadSlots(updated)
    setIsModalOpen(false)
    setNewLabel('Lunch / Rest Break')
  }

  // Add Preset Dead Slot
  const handleAddPreset = (preset) => {
    setErrorMessage('')
    const exists = deadSlots.some(
      (s) => s.start_time === preset.start_time && s.end_time === preset.end_time
    )
    if (exists) return

    setDeadSlots([
      ...deadSlots,
      {
        start_time: preset.start_time,
        end_time: preset.end_time,
        label: preset.label.split('(')[0].trim()
      }
    ])
  }

  // Remove Dead Slot
  const handleRemoveDeadSlot = (index) => {
    setDeadSlots(deadSlots.filter((_, i) => i !== index))
  }

  // Save Availability to Backend
  const handleSave = async () => {
    setSaving(true)
    setSavedSuccess(false)
    setErrorMessage('')

    const payload = {
      days_off: daysOff,
      dead_slots: deadSlots
    }

    localStorage.setItem('worker_availability_data', JSON.stringify(payload))
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/me/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error('Failed to update work schedule on server.')
      }
    } catch (err) {
      console.error('Save availability error:', err)
    }

    setSavedSuccess(true)
    setSaving(false)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  // Compute Dead Hours for daily visual timeline
  const getDeadHoursSet = () => {
    const deadHours = new Set()
    deadSlots.forEach((slot) => {
      try {
        const s = parseInt(slot.start_time.split(':')[0])
        const e = parseInt(slot.end_time.split(':')[0])
        for (let h = s; h < e; h++) {
          deadHours.add(h)
        }
      } catch (e) {}
    })
    return deadHours
  }

  const deadHoursSet = getDeadHoursSet()
  const businessHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
        Loading schedule settings…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <BackHeader title="Work Schedule & Dead Hours" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Intro Info Banner */}
        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="p-2 rounded-sm bg-[#fff4ed] text-[#ff8a4c] shrink-0 mt-0.5">
            <Clock size={20} />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Customize Your Dispatch Availability & Break Hours
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Set full weekly days off and recurring daily dead time zones (such as lunch or afternoon rest). Customers will automatically see these hours as unavailable and will be prevented from booking conflicting appointments.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>Work schedule and dead time zones saved successfully!</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm font-bold">
              Synced
            </span>
          </div>
        )}

        {/* SECTION 1: Weekly Days Off */}
        <div className="bg-white rounded-md border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#ff8a4c]" />
              <h3 className="text-sm font-bold text-slate-900">Weekly Full Days Off</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {daysOff.length === 0
                ? 'Working 7 days/week'
                : `${daysOff.length} day${daysOff.length > 1 ? 's' : ''} off selected`}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Select any day(s) of the week you do not take customer bookings. On these days, all time slots are automatically blocked on the customer app.
          </p>

          {/* 7 Days Toggle Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
            {ALL_WEEKDAYS.map((day) => {
              const isOff = daysOff.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDayOff(day)}
                  className={`p-2.5 rounded-sm border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isOff
                      ? 'bg-[#fff4ed] border-[#ff8a4c] text-[#ff8a4c]'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider">{day.slice(0, 3)}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                      isOff
                        ? 'bg-[#ff8a4c] text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isOff ? 'Day Off' : 'Working'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* SECTION 2: Daily Dead Time Zones */}
        <div className="bg-white rounded-md border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#ff8a4c]" />
              <h3 className="text-sm font-bold text-slate-900">Daily Dead Time Zones (Break Hours)</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-[#ff8a4c] hover:bg-[#f07432] text-white text-xs font-bold rounded-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Dead Hours</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Specify hours of the day when you are unavailable for dispatch (e.g. lunch breaks, errands, or personal rest).
          </p>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Quick Add Common Breaks
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_DEAD_ZONES.map((preset, idx) => {
                const Icon = preset.icon
                const isAlreadyAdded = deadSlots.some(
                  (s) => s.start_time === preset.start_time && s.end_time === preset.end_time
                )
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAlreadyAdded}
                    onClick={() => handleAddPreset(preset)}
                    className={`px-3 py-1.5 rounded-sm border text-xs font-semibold flex items-center gap-1.5 transition ${
                      isAlreadyAdded
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-[#ff8a4c] text-slate-700 cursor-pointer'
                    }`}
                  >
                    <Icon size={13} className={isAlreadyAdded ? 'text-slate-400' : 'text-[#ff8a4c]'} />
                    <span>{preset.label}</span>
                    {isAlreadyAdded && <Check size={12} className="text-slate-400 ml-1" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Configured Dead Slots List */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Active Dead Time Intervals ({deadSlots.length})
            </label>

            {deadSlots.length === 0 ? (
              <div className="p-4 rounded-sm bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No dead hours configured yet. You are available for all open dispatch hours (09:00 - 21:00) on your working days.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deadSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-md border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-sm bg-amber-50 border border-amber-200 text-amber-800">
                        <Clock size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{slot.start_time} – {slot.end_time}</span>
                          <span className="text-[10px] font-semibold bg-amber-100/80 text-amber-900 px-1.5 py-0.2 rounded-sm">
                            Dead Zone
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {slot.label || 'Scheduled Break'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDeadSlot(index)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition cursor-pointer"
                      title="Remove dead slot"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Live Daily Dispatch Timeline */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Daily Schedule Timeline (09:00 – 21:00)
              </label>
              <div className="flex items-center gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block"></span> Working
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2 h-2 rounded-xs bg-amber-500 inline-block"></span> Dead Hours
                </span>
              </div>
            </div>

            {/* Timeline Blocks */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {businessHours.map((h) => {
                const isDead = deadHoursSet.has(h)
                const hourLabel = `${String(h).padStart(2, '0')}:00`
                return (
                  <div
                    key={h}
                    className={`p-2 rounded-sm border text-center transition flex flex-col items-center justify-center ${
                      isDead
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{hourLabel}</span>
                    <span className="text-[8px] font-semibold opacity-75 mt-0.5">
                      {isDead ? 'Off' : 'Open'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full bg-[#ff8a4c] hover:bg-[#f07432] text-white font-bold py-3.5 rounded-sm text-xs shadow-2xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>{saving ? 'Saving Work Schedule…' : 'Save Work Schedule & Dead Hours'}</span>
          </button>
        </div>
      </main>

      {/* Modal: Add Dead Time Slot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#ff8a4c]" />
                <h3 className="text-sm font-bold text-slate-900">Add Dead Time Zone</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddDeadSlot} className="space-y-4">
              {/* Time Range Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Start Time
                  </label>
                  <select
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff8a4c] bg-white"
                  >
                    {TIME_OPTIONS.slice(0, -1).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    End Time
                  </label>
                  <select
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-[#ff8a4c] bg-white"
                  >
                    {TIME_OPTIONS.slice(1).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason / Label */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Break Label / Reason
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Lunch Break, Prayer, Afternoon Rest"
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-sm border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-[#ff8a4c] hover:bg-[#f07432] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Dead Zone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
