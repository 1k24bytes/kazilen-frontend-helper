'use client'

import { Clock, CheckCircle2 } from 'lucide-react'

export default function OrderPlanCard({
  completed = 0,
  totalLabel = '10',
  price = 899,
  timeLeft = '30 days remaining'
}) {
  return (
    <div className="bg-white rounded-md border border-slate-200 p-5 shadow-2xs grid grid-cols-2 divide-x divide-slate-100 gap-4 text-center">
      <div>
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
          <CheckCircle2 size={14} className="text-slate-700" />
          <span>Orders Completed</span>
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
          ₹{price}
        </p>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
          {timeLeft}
        </p>
      </div>
    </div>
  )
}
