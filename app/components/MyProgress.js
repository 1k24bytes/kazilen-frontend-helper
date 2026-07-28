import { useState, useMemo, useTransition, memo } from 'react'

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' }
]

const BUTTON_CLASSES = {
  active:
    'bg-sky-500 text-white shadow-md ring-2 ring-sky-300 scale-105',
  inactive:
    'bg-sky-50 text-sky-700 hover:bg-sky-100'
}

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
    <section className="w-full mx-auto space-y-4">
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 transition-opacity duration-300 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              My Progress
            </h3>
            {isPending && <div className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />}
          </div>

          <div
            className="flex items-center gap-2 bg-slate-50 p-1 rounded-full border border-slate-100"
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
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider
                    transition-all duration-200 ease-out
                    ${isActive ? BUTTON_CLASSES.active : BUTTON_CLASSES.inactive}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </header>

        {/* Stats */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
          <div className="flex items-stretch justify-around">
            <Stat
              label="Earnings"
              value={formatINRCurrency(current.earnings)}
            />
            <Divider />
            <Stat label="Time" value={current.hours} />
            <Divider />
            <Stat label="Orders" value={current.orders} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- helpers ---------- */

function formatINRCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Number(amount || 0))
}

/* ---------- UI components ---------- */

const Stat = memo(function Stat({ label, value }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-xl font-black text-slate-800 tracking-tight">
        {value}
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  )
})

const Divider = memo(function Divider() {
  return (
    <div
      className="w-px bg-slate-200 mx-2 self-stretch"
      role="separator"
      aria-hidden="true"
    />
  )
})
