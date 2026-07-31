'use client'

import { Radio } from 'lucide-react'

export default function LiveDispatchFeed({ isOnline = true }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-2">
      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
        <Radio size={18} className={isOnline ? "text-emerald-600 animate-pulse" : "text-slate-400"} />
      </div>

      <h3 className="text-sm font-bold text-slate-900">
        {isOnline ? "Searching for nearby job dispatches..." : "You are currently offline"}
      </h3>
      
      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
        {isOnline 
          ? "Live customer service requests in your area will appear here automatically." 
          : "Toggle your status to ONLINE above to start receiving instant job requests in Nagpur."}
      </p>
    </div>
  )
}
