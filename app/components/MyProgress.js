import { useState, useMemo, useTransition, memo } from 'react'

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' }
]

export default function MyProgress({ progressData }) {
  const [period, setPeriod] = useState('today')
  const [isPending, startTransition] = useTransition()

  const safeData = progressData || {
    today: { earnings: 0, hours: '0:00 hrs', orders: 0 },
    week: { earnings: 0, hours: '0:00 hrs', orders: 0 }
  }

  const current = useMemo(() => safeData[period] || safeData.today, [period, safeData])

  const handlePeriodChange = (key) => {
    startTransition(() => {
      setPeriod(key)
    })
  }

  return (
    <section className="w-full">
      <div className={`bg-white rounded-lg border border-zinc-200/80 p-5 shadow-2xs transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {/* Header */}
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              My Progress
            </h3>
            {isPending && <div className="w-3 h-3 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />}
          </div>

          <div
            className="inline-flex items-center p-0.5 bg-zinc-100 rounded-md border border-zinc-200/60"
            role="tablist"
            aria-label="Progress period"
          >
            {PERIODS.map(({ key, label }) => {
              const isActive = period === key

              return (
                <button
                  key={key}
                  onClick={() => handlePeriodChange(key)}
                  role="tab"
                  aria-selected={isActive}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="bg-zinc-50/70 rounded-md p-4 border border-zinc-200/60">
          <div className="grid grid-cols-3 divide-x divide-zinc-200">
            <Stat
              label="Earnings"
              value={formatINRCurrency(current.earnings)}
            />
            <Stat label="Hours Worked" value={current.hours} />
            <Stat label="Orders" value={current.orders} />
          </div>
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

const Stat = memo(function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 text-center">
      <div className="text-xl font-bold text-zinc-900 tracking-tight">
        {value}
      </div>
      <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  )
})
