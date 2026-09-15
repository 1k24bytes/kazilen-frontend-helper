'use client'

import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function OrderPlanCard({
  completed = 0,
  totalLabel = '10',
  price = 899,
  timeLeft = '30 days remaining',
  planName = '',
  exhausted = false,
  onSubscribe,
}) {
  return (
    <div className={`bg-white rounded-md border p-5 shadow-2xs space-y-3 ${exhausted ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="grid grid-cols-2 divide-x divide-slate-100 gap-4 text-center">
        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <CheckCircle2 size={14} className="text-slate-700" />
            <span>Bookings Used</span>
          </div>
          <p className="text-xl font-bold text-slate-900 tracking-tight">
            {completed} <span className="text-xs font-normal text-slate-400">/ {totalLabel}</span>
          </p>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
            <Clock size={14} className="text-slate-700" />
            <span>Active Plan</span>
          </div>
          <p className="text-xl font-bold text-slate-900 tracking-tight">
            {typeof price === 'number' ? `₹${price}` : price}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {planName ? `${planName} · ` : ''}{timeLeft}
          </p>
        </div>
      </div>

      {exhausted && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-sm bg-red-50 border border-red-200">
          <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
            <AlertCircle size={14} />
            <span>Booking limit reached. Subscribe to accept more jobs.</span>
          </p>
          <button
            onClick={onSubscribe}
            className="px-3.5 py-1.5 rounded-sm bg-[#ff8a4c] hover:bg-[#f07432] text-white text-xs font-bold transition shrink-0 cursor-pointer"
          >
            Subscribe
          </button>
        </div>
      )}
    </div>
  )
}
