'use client'

import { useState, useEffect } from 'react'
import {
  X,
  MapPin,
  LocateFixed,
  Loader2,
  Check,
  AlertCircle,
  Save,
  Building2,
  Compass
} from 'lucide-react'
import { API_BASE_URL, apiFetch } from '@/lib/api'

export default function WorkerLocationModal({ isOpen, onClose, onLocationUpdated }) {
  const [locating, setLocating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [coords, setCoords] = useState(null)

  const [formData, setFormData] = useState({
    area: '',
    landmark: '',
    city: 'Nagpur',
    pincode: '',
    full_address: ''
  })

  // Load existing location on mount / open
  useEffect(() => {
    if (!isOpen) return

    setErrorMessage('')
    setSavedSuccess(false)

    // Load from local storage first for speed
    try {
      const savedArea = localStorage.getItem('worker_location_area') || ''
      const savedFull = localStorage.getItem('worker_location_full') || ''
      const savedCoords = localStorage.getItem('worker_location_coords')
      if (savedArea || savedFull) {
        setFormData((prev) => ({
          ...prev,
          area: savedArea,
          full_address: savedFull
        }))
      }
      if (savedCoords) {
        setCoords(JSON.parse(savedCoords))
      }
    } catch (e) {}

    // Also fetch latest profile from backend
    apiFetch(`${API_BASE_URL}/users/me`, {
      headers: { }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.location) {
          const loc = data.location
          setFormData({
            area: loc.area || '',
            landmark: loc.landmark || '',
            city: loc.city || 'Nagpur',
            pincode: loc.pincode || '',
            full_address: loc.full_address || ''
          })
          if (loc.latitude && loc.longitude) {
            setCoords({ latitude: loc.latitude, longitude: loc.longitude })
          }
        }
      })
      .catch((err) => console.error('Failed to load worker location:', err))
  }, [isOpen])

  if (!isOpen) return null

  // GPS Auto-detect handler
  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your device.')
      return
    }

    setLocating(true)
    setErrorMessage('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ latitude: String(latitude), longitude: String(longitude) })

        try {
          // OpenStreetMap Nominatim reverse geocoding
          const response = await apiFetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en'
              }
            }
          )

          if (response.ok) {
            const data = await response.json()
            const addr = data.address || {}

            const streetVal = addr.road || addr.street || addr.suburb || ''
            const areaVal =
              addr.neighbourhood ||
              addr.suburb ||
              addr.residential ||
              addr.city_district ||
              addr.subdistrict ||
              ''
            const cityVal = addr.city || addr.town || addr.municipality || 'Nagpur'
            const pincodeVal = addr.postcode || ''
            const landmarkVal = addr.landmark || streetVal || ''

            const detectedArea = areaVal || (streetVal ? `${streetVal}, ${cityVal}` : cityVal)
            const fullAddr = data.display_name || `${detectedArea}, ${cityVal}`

            setFormData({
              area: detectedArea,
              landmark: landmarkVal,
              city: cityVal,
              pincode: pincodeVal,
              full_address: fullAddr
            })
          } else {
            setErrorMessage('Could not fetch address details for GPS coords. Please enter your area manually.')
          }
        } catch (err) {
          console.error('Reverse geocode error:', err)
          setErrorMessage('Could not automatically determine area name. Please type your locality below.')
        } finally {
          setLocating(false)
        }
      },
      (error) => {
        setLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Location permission was denied. Please enable location permissions or enter your locality manually.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMessage('Location information is unavailable on your device.')
        } else if (error.code === error.TIMEOUT) {
          setErrorMessage('GPS request timed out. Please try again.')
        } else {
          setErrorMessage('Unable to retrieve device GPS location.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  // Save handler
  const handleSaveLocation = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const areaTrimmed = formData.area.trim()
    if (!areaTrimmed) {
      setErrorMessage('Please enter your operating area / locality.')
      return
    }

    const cityTrimmed = formData.city.trim() || 'Nagpur'
    const fullAddressFinal =
      formData.full_address.trim() ||
      `${areaTrimmed}${formData.landmark ? `, Near ${formData.landmark.trim()}` : ''}, ${cityTrimmed}`

    setSaving(true)

    const payload = {
      area: areaTrimmed,
      landmark: formData.landmark ? formData.landmark.trim() : null,
      city: cityTrimmed,
      pincode: formData.pincode ? formData.pincode.trim() : null,
      full_address: fullAddressFinal,
      latitude: coords?.latitude || null,
      longitude: coords?.longitude || null
    }

    // Save to local storage for immediate offline/header display
    try {
      localStorage.setItem('worker_location_area', areaTrimmed)
      localStorage.setItem('worker_location_full', fullAddressFinal)
      if (coords) {
        localStorage.setItem('worker_location_coords', JSON.stringify(coords))
      }
    } catch (e) {}
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/me/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to save location on server.')
      }
    } catch (err) {
      console.error('Save location error:', err)
    }

    setSaving(false)
    setSavedSuccess(true)

    if (onLocationUpdated) {
      onLocationUpdated({
        area: areaTrimmed,
        city: cityTrimmed,
        full_address: fullAddressFinal,
        latitude: coords?.latitude,
        longitude: coords?.longitude
      })
    }

    setTimeout(() => {
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-sm bg-[#fff4ed] text-[#ff8a4c]">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Set Operational Base Location</h3>
              <p className="text-[11px] text-slate-500">Your dispatch locality & service radius base</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span>Operational location updated successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* GPS Live Detect CTA */}
        <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Compass size={14} className="text-[#ff8a4c]" />
              Live Device GPS
            </span>
            <p className="text-[11px] text-slate-500">
              Auto-fill your current live location & coordinates
            </p>
          </div>

          <button
            type="button"
            disabled={locating}
            onClick={handleDetectLocation}
            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-sm text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            {locating ? (
              <>
                <Loader2 size={13} className="animate-spin text-[#ff8a4c]" />
                <span>Locating…</span>
              </>
            ) : (
              <>
                <LocateFixed size={13} className="text-[#ff8a4c]" />
                <span>Detect GPS</span>
              </>
            )}
          </button>
        </div>

        {/* Location Form */}
        <form onSubmit={handleSaveLocation} className="space-y-3.5">
          {/* Operating Area / Locality */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Operating Area / Locality <span className="text-[#ff8a4c]">*</span>
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g. Dharampeth, Sitabuldi, Sadar, Manish Nagar"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c]"
              />
            </div>
          </div>

          {/* Landmark & Pincode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Street / Landmark
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="e.g. Near Shankar Nagar Square"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 440010"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c]"
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              City / District
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Nagpur"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c]"
            />
          </div>

          {/* Full Base Address Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Service Hub Address (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.full_address}
              onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
              placeholder="e.g. Shop 4, Ground Floor, Laxmi Nagar Chowk, Nagpur"
              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-sm border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-sm bg-[#ff8a4c] hover:bg-[#f07432] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Location</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
