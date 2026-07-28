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
    // Clear tokens safely on client side without a backend /logout endpoint
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-white">
      <BackHeader />

      <div className="p-4 space-y-3">
        <ProfileItem
          icon={<User size={20} className="text-gray-600" />}
          label="Your profile"
          onClick={() => router.push('/profile/user')}
        />

        <ProfileItem
          icon={<Settings size={20} className="text-blue-600" />}
          label="My Services"
          onClick={() => router.push('/my-services')}
        />

        <ProfileItem
          icon={<Star size={20} className="text-yellow-500" />}
          label="Your rating"
          onClick={() => router.push('/profile/rating')}
        />


        <ProfileItem
          icon={<HelpCircle size={20} className="text-green-600" />}
          label="Online ordering help"
          onClick={() => router.push('/profile/help')}
        />

        <ProfileItem
          icon={<Info size={20} className="text-gray-700" />}
          label="About"
          onClick={() => router.push('/profile/about')}
        />

        <ProfileItem
          icon={<LogOut size={20} className="text-red-600" />}
          label="Log out"
          onClick={handleLogout}
        />
      </div>
    </div>
  )
}

function ProfileItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50"
    >
      <div className="flex items-center gap-3 text-sm text-gray-800">
        {icon}
        {label}
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  )
}
