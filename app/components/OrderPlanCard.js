'use client'

export default function OrderPlanCard({
  completed = 0,
  totalLabel = '0',
  price = 0,
  timeLeft = '0 hours left'
}) {
  return (
    <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center">
      {/* Left Section */}
      <div className="flex-1 flex flex-col items-center text-center">
        <p className="text-sm font-semibold text-gray-700">
          Order completed
        </p>

        <p className="text-3xl font-bold text-black leading-tight mt-1">
          {String(completed || 0).padStart(2, '0')}
        </p>

        <p className="text-sm text-gray-500">
          left of {totalLabel}
        </p>
      </div>

      {/* Vertical Divider */}
      <div className="w-px h-14 bg-gray-300 mx-4" />

      {/* Right Section */}
      <div className="flex-1 flex flex-col items-center text-center">
        <p className="text-sm font-semibold text-orange-500">
          Plan expiring
        </p>

        <p className="text-2xl font-bold text-orange-500 leading-tight mt-1">
          ₹{price || 0}
        </p>

        <p className="text-sm text-orange-400">
          {timeLeft}
        </p>
      </div>
    </div>
  )
}
