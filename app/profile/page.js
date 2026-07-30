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
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900">
      <BackHeader />

      <main className="max-w-xl mx-auto px-4 py-6 space-y-3">
        <div className="bg-white rounded-lg border border-zinc-200/80 shadow-2xs divide-y divide-zinc-100 overflow-hidden">
          <ProfileItem
            icon={<User size={18} className="text-zinc-600" />}
            label="Worker Profile"
            onClick={() => router.push('/profile/user')}
          />

          <ProfileItem
            icon={<Settings size={18} className="text-zinc-600" />}
            label="My Offered Services"
            onClick={() => router.push('/my-services')}
          />

          <ProfileItem
            icon={<Star size={18} className="text-amber-500" />}
            label="Customer Ratings & Feedback"
            onClick={() => router.push('/profile/rating')}
          />

          <ProfileItem
            icon={<HelpCircle size={18} className="text-zinc-600" />}
            label="Partner Support & Help"
            onClick={() => router.push('/profile/help')}
          />

          <ProfileItem
            icon={<Info size={18} className="text-zinc-600" />}
            label="About Kazilen Partner"
            onClick={() => router.push('/profile/about')}
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-red-200/60 text-red-600 hover:bg-red-50/50 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <LogOut size={16} />
              <span>Log out of partner console</span>
            </div>
            <ChevronRight size={16} className="text-red-400" />
          </button>
        </div>
      </main>
    </div>
  )
}

function ProfileItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight size={16} className="text-zinc-400" />
    </button>
  )
}
