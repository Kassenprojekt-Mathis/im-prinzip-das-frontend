import { useNavigate, useLocation } from 'react-router-dom'

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = location.state?.items || []

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <p>Payment Page</p>
      </div>

      <div className="flex gap-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => navigate('/scan')}
          className="px-6 py-2.5 text-sm font-bold border-2 border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50 active:scale-95 transition-transform"
        >
          ← ZURÜCK
        </button>
        <button
          onClick={() => navigate('/summary', { state: { items, paymentMethod: 'Bar' } })}
          className="flex-1 py-2.5 text-lg font-bold bg-[#1E1B4B] text-white rounded-lg hover:bg-[#2d2a5e] active:scale-95 transition-transform"
        >
          WEITER ZUR ZUSAMMENFASSUNG →
        </button>
      </div>
    </div>
  )
}
