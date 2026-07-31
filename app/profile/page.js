'use client'

import BackHeader from './components/BackHeader'
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
  CreditCard
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <BackHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Partner Info Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ff8a4c] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-orange-500/20 shrink-0">
            P
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 truncate">Service Partner Profile</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck size={11} /> Verified Technician
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage your dispatch preferences, active skills & plan subscriptions</p>
          </div>
        </div>

        {/* Practical Options List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
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
            icon={<CreditCard size={18} className="text-[#ff8a4c]" />}
            label="Recharge History & Subscriptions"
            sub="Review past payments, active plan quota and invoices"
            onClick={() => router.push('/profile/recharge')}
          />

          <ProfileItem
            icon={<Star size={18} className="text-amber-500" />}
            label="Customer Ratings & Reviews"
            sub="View customer star ratings, feedback and tips earned"
            onClick={() => router.push('/profile/rating')}
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
            className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-red-200 text-red-600 hover:bg-red-50/50 text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span>Log out of partner console</span>
            </div>
            <ChevronRight size={18} className="text-red-400" />
          </button>
        </div>
      </main>
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
        <div className="p-2 rounded-xl bg-slate-100/80 group-hover:bg-[#fff4ed] transition-colors">
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
