'use client'

import { Clock, CheckCircle2 } from 'lucide-react'

export default function OrderPlanCard({
  completed = 0,
  totalLabel = '0',
  price = 0,
  timeLeft = '0 hours left'
}) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200/80 p-5 shadow-2xs grid grid-cols-2 divide-x divide-zinc-200 gap-4">
      {/* Left Section */}
      <div className="flex flex-col items-center text-center px-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 mb-1">
          <CheckCircle2 size={14} className="text-zinc-700" />
          <span>Orders Done</span>
        </div>

        <p className="text-2xl font-bold text-zinc-900 tracking-tight">
          {String(completed || 0).padStart(2, '0')}
        </p>

        <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
          out of {totalLabel} total
        </p>
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-center text-center px-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
          <Clock size={14} className="text-amber-600" />
          <span>Active Plan</span>
        </div>

        <p className="text-2xl font-bold text-zinc-900 tracking-tight">
          ₹{price || 0}
        </p>

        <p className="text-[11px] text-amber-600 font-medium mt-0.5">
          {timeLeft}
        </p>
      </div>
    </div>
  )
}
