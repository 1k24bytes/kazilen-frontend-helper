'use client'

import { Zap } from 'lucide-react'

export default function PlansCard({
  price = 899,
  validityDays = 30,
  orderType = 'Repair Jobs',
  onRecharge
}) {
  return (
    <div className="bg-white rounded-md border border-slate-200 p-5 shadow-2xs flex items-center justify-between gap-4">
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Subscription Plan
        </h3>
        <p className="text-sm font-extrabold text-slate-900 mt-1">
          ₹{price} <span className="text-xs font-normal text-slate-500">/ {validityDays} Days</span>
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Type: {orderType}
        </p>
      </div>

      <button
        onClick={onRecharge}
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
      >
        <Zap size={14} />
        <span>Recharge</span>
      </button>
    </div>
  )
}
