'use client'

import { useEffect, useRef } from 'react'

export default function TermsOfCondition({ open, onClose }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div
        ref={modalRef}
        className="bg-white rounded-xl max-w-md w-[90%] p-6 shadow-xl relative"
      >
        <h2 className="text-lg font-bold mb-3 text-black">Terms of Service</h2>

        <div className="text-sm text-gray-700 max-h-[300px] overflow-y-auto">
          <p>
            Welcome to Kazilen. By using this platform you agree to our terms
            and conditions. Kazilen connects customers with service providers.
          </p>

          <p className="mt-3">
            Users must provide accurate information while booking services.
            Misuse of the platform or fraudulent activity may result in account
            suspension.
          </p>

          <p className="mt-3">
            Service providers operate independently. Kazilen only facilitates
            the connection between customers and professionals.
          </p>
        </div>

        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-sm"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
