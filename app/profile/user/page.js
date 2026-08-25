'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BackHeader from '../components/BackHeader'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import { User, Phone, Calendar, Users, ShieldCheck, Save, Check } from 'lucide-react'
import { API_BASE_URL, apiFetch } from '@/lib/api'

export default function WorkerUserProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [userInfo, setUserInfo] = useState({
    full_name: '',
    phone_number: '',
    dob: '',
    gender: 'Male',
    role: 'worker'
  })

  useEffect(() => {
    const savedPhone = localStorage.getItem('user_phone') || localStorage.getItem('phone') || ''
    const savedName = localStorage.getItem('kazilen_professional_name') || localStorage.getItem('professionalName') || ''

    const formatPhone = (raw) => {
      if (!raw) return ''
      let clean = raw.replace(/\D/g, '')
      if (clean.length > 10 && clean.startsWith('91')) {
        clean = clean.substring(2)
      }
      return clean ? `+91 ${clean}` : ''
    }

    setUserInfo({
      full_name: savedName,
      phone_number: formatPhone(savedPhone),
      dob: '',
      gender: 'Male',
      role: 'worker'
    })

    async function fetchUserProfile() {
      try {
        const res = await apiFetch(`${API_BASE_URL}/users/me`, {
          headers: { }
        })
        if (res.ok) {
          const data = await res.json()
          const phoneVal = data.phone_number || savedPhone
          const nameVal = data.full_name || savedName

          setUserInfo({
            full_name: nameVal || '',
            phone_number: formatPhone(phoneVal),
            dob: data.dob || '',
            gender: data.gender || 'Male',
            role: data.role || 'worker'
          })

          if (nameVal) localStorage.setItem('kazilen_professional_name', nameVal)
          if (phoneVal) localStorage.setItem('user_phone', phoneVal)
        }
      } catch (e) {
        console.error('Failed to load worker profile:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)

    if (userInfo.full_name) {
      localStorage.setItem('kazilen_professional_name', userInfo.full_name.trim())
    }
    try {
      await apiFetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: userInfo.full_name,
          dob: userInfo.dob,
          gender: userInfo.gender
        })
      })
    } catch (err) {
      console.error('Save error:', err)
    }

    setSavedSuccess(true)
    setSaving(false)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">
        Loading partner profile info…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <BackHeader title="Worker Personal Profile" />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-[#ff8a4c] text-white flex items-center justify-center font-bold text-lg shadow-2xs">
              {userInfo.full_name ? userInfo.full_name.charAt(0).toUpperCase() : 'W'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{userInfo.full_name || 'Service Partner'}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck size={11} /> Verified Technician
              </span>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              <span>Partner profile updated successfully!</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userInfo.full_name}
                onChange={(e) => setUserInfo({ ...userInfo, full_name: e.target.value })}
                placeholder="e.g. Ramesh Verma"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c] focus:ring-1 focus:ring-[#ff8a4c] transition"
              />
            </div>
          </div>

          {/* Mobile Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Registered Mobile</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userInfo.phone_number}
                readOnly
                placeholder="+91 Mobile Number"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 cursor-not-allowed"
              />
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={userInfo.dob}
                  onChange={(e) => setUserInfo({ ...userInfo, dob: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c] focus:ring-1 focus:ring-[#ff8a4c] transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={userInfo.gender}
                  onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#ff8a4c] focus:ring-1 focus:ring-[#ff8a4c] transition bg-white appearance-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#ff8a4c] hover:bg-[#f07432] text-white font-bold py-3 rounded-xl text-sm shadow-2xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{saving ? 'Saving Profile...' : 'Save Partner Profile'}</span>
            </button>
          </div>

        </form>
      </main>

      <BottomNav />
    </div>
  )
}
