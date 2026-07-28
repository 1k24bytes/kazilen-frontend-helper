'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackHeader() {
  const router = useRouter()

  return (
    <div className="p-4">
      <button onClick={() => router.back()} aria-label="Go Back" className="text-black">
        <ArrowLeft size={20} />
      </button>
    </div>
  )
}
