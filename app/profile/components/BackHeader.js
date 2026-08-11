'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackHeader({ title = 'Account Settings' }) {
  const router = useRouter()

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shadow-2xs">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-sm bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
          aria-label="Go Back"
        >
          <ArrowLeft size={16} />
        </button>
        {title && <h1 className="text-sm font-bold text-slate-900">{title}</h1>}
      </div>
    </div>
  )
}
