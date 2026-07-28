'use client'

export default function PlansCard({
  price = 0,
  validityDays = 0,
  orderType = 'None',
  onRecharge
}) {
  return (
    <div className="mt-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-black mb-3">
        Plans
      </h3>

      {/* Plan Card */}
      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
        {/* Left Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-black">
                ₹{price || 0}
            </span>
          </div>

          <p className="text-sm text-gray-600">
            Order
          </p>
          <p className="text-sm font-semibold text-black">
            {orderType}
          </p>
        </div>

        {/* Middle Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Validity
          </p>
          <p className="text-base font-semibold text-black">
            {String(validityDays || 0).padStart(2, '0')} Days
          </p>
        </div>

        {/* Right Action */}
        <button
          onClick={onRecharge}
          className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold px-5 py-2 rounded-full"
        >
          Recharge
        </button>
      </div>
    </div>
  )
}
