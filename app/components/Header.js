'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Header({ size = 36, imageSrc }) {
  const router = useRouter()
  const [online, setOnline] = useState(true)
  const [initial, setInitial] = useState('P')

  // Load online state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('isOnline')
    if (saved !== null) setOnline(saved === 'true')
  }, [])

  // Persist online state
  useEffect(() => {
    localStorage.setItem('isOnline', online ? 'true' : 'false')
  }, [online])

  // Load professional name and extract first letter
  useEffect(() => {
    try {
      const name =
        localStorage.getItem('kazilen_professional_name') ||
        localStorage.getItem('professionalName') ||
        ''
      if (name) {
        setInitial(name.trim().charAt(0).toUpperCase())
      }
    } catch {
      setInitial('P')
    }
  }, [])

  const toggle = () => setOnline((prev) => !prev)
  const openProfile = () => router.push('/profile')

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 border-b border-zinc-200/80 bg-white">
      {/* Online / Offline Status Toggle Switch */}
      <button
        onClick={toggle}
        aria-pressed={online}
        className={`relative inline-flex h-8 w-28 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          online ? 'bg-emerald-600' : 'bg-zinc-200'
        }`}
      >
        <span className="sr-only">Toggle Online Status</span>
        <span
          className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            online ? 'translate-x-[72px]' : 'translate-x-0'
          }`}
        />
        <span
          className={`absolute inset-0 flex items-center justify-center text-[11px] font-semibold tracking-wider uppercase ${
            online ? 'pr-6 text-white' : 'pl-6 text-zinc-700'
          }`}
        >
          {online ? 'Online' : 'Offline'}
        </span>
      </button>

      {/* Title & Brand */}
      <div className="text-center flex-1">
        <span className="text-sm font-bold text-zinc-900 tracking-tight">Kazilen</span>
        <span className="text-[10px] text-zinc-400 block font-medium uppercase tracking-wider">Partner Console</span>
      </div>

      {/* Profile Avatar Button */}
      <button
        onClick={openProfile}
        className="relative w-9 h-9 rounded-full bg-zinc-900 text-white font-semibold text-xs flex items-center justify-center shadow-2xs hover:bg-zinc-800 transition cursor-pointer shrink-0"
        title="Open profile"
        aria-label="Open profile"
      >
        {imageSrc ? (
          <Image 
            src={imageSrc} 
            alt="Profile" 
            fill 
            className="object-cover rounded-full"
            sizes={`${size}px`}
          />
        ) : (
          initial
        )}

        {/* status dot */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            online ? 'bg-emerald-500' : 'bg-zinc-400'
          }`}
        />
      </button>
    </header>
  )
}
