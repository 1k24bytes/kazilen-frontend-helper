'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Header({ size = 40, imageSrc }) {
  const router = useRouter()
  const [online, setOnline] = useState(true)
  const [initial, setInitial] = useState('•')

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
      setInitial('•')
    }
  }, [])

  const toggle = () => setOnline((prev) => !prev)
  const openProfile = () => router.push('/profile')

  // Toggle switch sizing
  const pillWidth = 96
  const pillHeight = 28
  const knobSize = 22
  const knobLeft = 3
  const knobTranslate = pillWidth - knobSize - knobLeft * 2

  return (
    <div className="flex items-center gap-4 w-full relative">
      {/* Toggle */}
      <button
        onClick={toggle}
        aria-pressed={online}
        className="relative flex items-center rounded-full focus:outline-none select-none transition-colors duration-300"
        style={{
          width: pillWidth,
          height: pillHeight,
          background: online ? '#10B981' : '#E5E7EB',
        }}
      >
        {/* knob */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 3,
            left: knobLeft,
            width: knobSize,
            height: knobSize,
            borderRadius: 9999,
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            transform: online
              ? `translateX(${knobTranslate}px)`
              : 'translateX(0px)',
            transition: 'transform 240ms cubic-bezier(.2,.9,.2,1)',
          }}
        />

        {/* text */}
        <div
          style={{
            paddingLeft: knobLeft + knobSize + 8,
            paddingRight: 10,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: online ? '#ffffff' : '#4B5563',
              userSelect: 'none',
            }}
          >
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
      </button>

      {/* Avatar moved to right */}
      <button
        onClick={openProfile}
        className="ml-auto relative rounded-full flex items-center justify-center font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        style={{ width: size, height: size, fontSize: size / 2.5 }}
        title="Open profile"
        aria-label="Open profile"
      >
        {imageSrc ? (
          <Image 
            src={imageSrc} 
            alt="Profile" 
            fill 
            className="object-cover"
            sizes={`${size}px`}
          />
        ) : (
          initial
        )}

        {/* status dot */}
        <span
          className={`absolute right-1 bottom-1 rounded-full border-2 border-white transition-colors duration-300 ${
            online ? 'bg-green-500' : 'bg-gray-400'
          }`}
          style={{ width: 10, height: 10 }}
        />
      </button>
    </div>
  )
}
