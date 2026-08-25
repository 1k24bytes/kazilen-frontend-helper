'use client'

import { useState, useEffect } from 'react'
import BackHeader from './components/BackHeader'
import BottomNav from '../components/BottomNav'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  User,
  Star,
  HelpCircle,
  Info,
  LogOut,
  Settings,
  ShieldCheck,
  Zap,
  CreditCard,
  Clock,
  MapPin,
  Gift,
  Copy,
  Check
} from 'lucide-react'
import WorkerLocationModal from '../components/WorkerLocationModal'
import { API_BASE_URL, apiFetch } from '@/lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const [workerProfile, setWorkerProfile] = useState({ full_name: '', phone_number: '' })
  const [referral, setReferral] = useState({ code: '', points: 0 })
  const [copied, setCopied] = useState(false)
  const [workerLocation, setWorkerLocation] = useState('')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  useEffect(() => {
    const savedName = localStorage.getItem('kazilen_professional_name') || localStorage.getItem('worker_name') || ''
    const savedPhone = localStorage.getItem('user_phone') || localStorage.getItem('phone') || ''
    const savedLoc = localStorage.getItem('worker_location_area') || ''

    if (savedName || savedPhone) {
      setWorkerProfile({ full_name: savedName, phone_number: savedPhone })
    }
    if (savedLoc) {
      setWorkerLocation(savedLoc)
    }

    apiFetch(`${API_BASE_URL}/users/me`, {
      headers: { }
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setWorkerProfile({
            full_name: data.full_name || savedName || '',
            phone_number: data.phone_number || savedPhone || ''
          })
          if (data.full_name) localStorage.setItem('kazilen_professional_name', data.full_name)
          if (data.phone_number) localStorage.setItem('user_phone', data.phone_number)
          setReferral({ code: data.referral_code || '', points: data.referral_points || 0 })
          if (data.location && data.location.area) {
            const locStr = `${data.location.area}, ${data.location.city || 'Nagpur'}`
            setWorkerLocation(locStr)
            localStorage.setItem('worker_location_area', locStr)
          }
        }
      })
      .catch((e) => console.error('Failed to load profile:', e))
  }, [])

  const referralLink = referral.code && typeof window !== 'undefined'
    ? `${window.location.origin}/login?ref=${encodeURIComponent(referral.code)}`
    : ''

  const copyReferralLink = async () => {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' })
    } catch {
      // ignore network errors, still clear local state
    }
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
    window.location.href = '/login'
  }

  const displayName = workerProfile.full_name?.trim() || 'Service Partner'
  const initial = (workerProfile.full_name?.trim() || 'P').charAt(0).toUpperCase()
  const formatPhone = (raw) => {
    if (!raw) return ''
    let clean = raw.replace(/\D/g, '')
    if (clean.length > 10 && clean.startsWith('91')) {
      clean = clean.substring(2)
    }
    return clean ? `+91 ${clean}` : ''
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <BackHeader title={displayName} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Partner Info Header Card */}
        <div className="bg-white rounded-md border border-slate-200 p-6 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-sm bg-[#ff8a4c] text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 truncate">{displayName}</h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-sm border border-emerald-200">
                  <ShieldCheck size={11} /> Verified Technician
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {workerProfile.phone_number ? `${formatPhone(workerProfile.phone_number)} · ` : ''}Manage your dispatch preferences, active skills & plan subscriptions
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/profile/user')}
            className="px-3 py-1.5 rounded-sm border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shrink-0 cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* Worker Referral & Network Rewards Card */}
        <section className="bg-white rounded-md border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-sm bg-[#fff4ed] text-[#ff8a4c] shrink-0">
                <Gift size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Partner Referral Program</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Invite fellow specialists to join Kazilen. Earn 1 referral point whenever a new partner registers with your code.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-slate-900">{referral.points}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Points</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-sm px-3.5 py-2.5">
              <span className="text-xs font-medium text-slate-500">Your Referral Code:</span>
              <span className="font-mono text-sm font-bold tracking-[0.2em] text-slate-900">
                {referral.code || 'Generating…'}
              </span>
            </div>

            <button
              type="button"
              onClick={copyReferralLink}
              disabled={!referralLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[#ff8a4c] hover:bg-[#f07432] text-white text-xs font-bold transition disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer shadow-2xs"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'Copied' : 'Copy Invite Link'}</span>
            </button>
          </div>
        </section>

        {/* Practical Options List */}
        <div className="bg-white rounded-md border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          <ProfileItem
            icon={<User size={18} className="text-[#ff8a4c]" />}
            label="Worker Personal Information"
            sub="View verified mobile number, name & Govt ID status"
            onClick={() => router.push('/profile/user')}
          />

          <ProfileItem
            icon={<Settings size={18} className="text-slate-600" />}
            label="My Offered Service Skills"
            sub="Select categories (Electrician, Fan Repair, Wiring) for jobs"
            onClick={() => router.push('/my-services')}
          />

          <ProfileItem
            icon={<MapPin size={18} className="text-[#ff8a4c]" />}
            label="Operational Base Location"
            sub={workerLocation ? `Operating Base: ${workerLocation}` : 'Update your live GPS dispatch location & operating area'}
            onClick={() => setIsLocationModalOpen(true)}
          />

          <ProfileItem
            icon={<Clock size={18} className="text-[#ff8a4c]" />}
            label="Work Schedule & Dead Hours"
            sub="Configure daily break / dead hours and weekly full days off"
            onClick={() => router.push('/profile/availability')}
          />

          <ProfileItem
            icon={<Star size={18} className="text-amber-500" />}
            label="Customer Ratings & Reviews"
            sub="View customer star ratings, feedback and tips earned"
            onClick={() => router.push('/profile/rating')}
          />

          <ProfileItem
            icon={<CreditCard size={18} className="text-[#ff8a4c]" />}
            label="Recharge History & Subscriptions"
            sub="Review past payments, active plan quota and invoices"
            onClick={() => router.push('/profile/recharge')}
          />

          <ProfileItem
            icon={<HelpCircle size={18} className="text-slate-600" />}
            label="Partner Support & Desk"
            sub="Contact Nagpur operational support for help or queries"
            onClick={() => router.push('/profile/help')}
          />

          <ProfileItem
            icon={<Info size={18} className="text-slate-600" />}
            label="About Kazilen Partner Console"
            sub="App terms of agreement and partner policies"
            onClick={() => router.push('/profile/about')}
          />
        </div>

        {/* Logout CTA */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-md border border-red-200 text-red-600 hover:bg-red-50/50 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span>Log out of partner console</span>
            </div>
            <ChevronRight size={18} className="text-red-400" />
          </button>
        </div>
      </main>

      <WorkerLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationUpdated={(loc) => {
          const locStr = loc.area ? `${loc.area}, ${loc.city || 'Nagpur'}` : 'Nagpur, MH'
          setWorkerLocation(locStr)
        }}
      />

      <BottomNav />
    </div>
  )
}

function ProfileItem({ icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition cursor-pointer group"
    >
      <div className="flex items-center gap-3.5">
        <div className="p-2 rounded-sm bg-slate-100/80 group-hover:bg-[#fff4ed] transition-colors">
          {icon}
        </div>
        <div className="text-left">
          <span className="block font-bold text-slate-900 text-sm group-hover:text-[#ff8a4c] transition-colors">
            {label}
          </span>
          {sub && <span className="text-xs font-normal text-slate-500">{sub}</span>}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-400 group-hover:text-[#ff8a4c] transition-colors" />
    </button>
  )
}
