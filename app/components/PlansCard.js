'use client'

import { Zap } from 'lucide-react'

export default function PlansCard({
  price = 0,
  validityDays = 0,
  orderType = 'None',
  onRecharge
}) {
  return (
    <div className="space-y-2">
      {/* Title */}
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        Subscription Plan
      </h3>

      {/* Plan Card */}
      <div className="bg-white rounded-lg border border-zinc-200/80 p-5 shadow-2xs flex items-center justify-between gap-3">
        {/* Left Info */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              ₹{price || 0}
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-medium">
            Order Type: <span className="text-zinc-900 font-semibold">{orderType}</span>
          </p>
        </div>

        {/* Middle Info */}
        <div className="text-center px-2">
          <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
            Validity
          </p>
          <p className="text-xs font-bold text-zinc-900">
            {String(validityDays || 0).padStart(2, '0')} Days
          </p>
        </div>

        {/* Right Action */}
        <button
          onClick={onRecharge}
          className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-md shadow-xs transition cursor-pointer shrink-0"
        >
          <Zap size={14} />
          <span>Recharge</span>
        </button>
      </div>
    </div>
  )
}
