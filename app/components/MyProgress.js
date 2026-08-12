import { useState, useMemo } from 'react'

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' }
]

export default function MyProgress({ progressData }) {
  const [period, setPeriod] = useState('today')

  const safeData = progressData || {
    today: { earnings: 0, hours: '0:00 hrs', orders: 0 },
    week: { earnings: 0, hours: '0:00 hrs', orders: 0 }
  }

  const current = useMemo(() => safeData[period] || safeData.today, [period, safeData])

  return (
    <section className="w-full bg-white rounded-md border border-slate-200 p-5 shadow-2xs space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Work Progress & Earnings
        </h3>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-sm border border-slate-200">
          {PERIODS.map(({ key, label }) => {
            const isActive = period === key

            return (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-3 py-1 rounded-sm text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </header>

      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50 rounded-sm p-4 border border-slate-200/80 text-center">
        <div>
          <span className="text-xs font-semibold text-slate-500 block uppercase text-[10px]">Earnings</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {formatINRCurrency(current.earnings)}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 block uppercase text-[10px]">Hours</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {current.hours}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 block uppercase text-[10px]">Jobs</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {current.orders}
          </span>
        </div>
      </div>
    </section>
  )
}

function formatINRCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(amount || 0))
}
