import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useVoucher } from '../hooks/useVoucher'
import CustomerCardModal from '../components/CustomerCardModal'
import QuestionmarkIcon from '../assets/Icons/Questionmark.png'
import HandsIcon from '../assets/Icons/Hands.png'
import WarningIcon from '../assets/Icons/Warning.png'

export default function SummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPayment = location.state?.fromPayment || false
  const customerCardAsked = sessionStorage.getItem('customerCardAsked') === 'true'
  const inspectionCompleted = sessionStorage.getItem('inspectionCompleted') === 'true'

  const [showCustomerCard, setShowCustomerCard] = useState(
    !fromPayment && !customerCardAsked && !inspectionCompleted
  )
  const [inspectionActive, setInspectionActive] = useState(
    sessionStorage.getItem('inspectionActive') === 'true'
  )

  const {
    voucherCode,
    setVoucherCode,
    voucherStatus,
    appliedVoucher,
    applyVoucher,
    removeVoucher
  } = useVoucher()

  const handleContinueToPayment = () => {
    if (!inspectionCompleted && !inspectionActive) {
      if (Math.random() < 0.5) {
        setInspectionActive(true)
        sessionStorage.setItem('inspectionActive', 'true')
        window.dispatchEvent(new Event('inspectionStatusChanged'))
        return
      }
    }
    navigate('/payment')
  }

  const handleCustomerCardYes = () => {
    sessionStorage.setItem('customerCardAsked', 'true')
    sessionStorage.setItem('pendingCustomerCard', 'true')
    setShowCustomerCard(false)
    navigate('/scan')
  }
  const handleCustomerCardNo = () => {
    sessionStorage.setItem('customerCardAsked', 'true')
    setShowCustomerCard(false)
  }
  return (
    <div className="relative flex flex-col h-full items-center justify-center">
      <div className="p-6 w-full max-w-md">
        <div className="text-center mb-4">
          {inspectionCompleted ? (
            <>
              <div className="flex justify-center mb-3">
                <img src={HandsIcon} alt="Hände" className="w-40 h-40 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Kontrolle vorbei!</h2>
              <p className="text-sm text-gray-600">Sie können nun zur Zahlung fortfahren.</p>
            </>
          ) : inspectionActive ? (
            <>
              <div className="flex justify-center mb-3">
                <img src={WarningIcon} alt="Warnung" className="w-32 h-32 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Sie wurden für eine Zufallskontrolle ausgewählt
              </h2>
              <p className="text-sm text-gray-600">
                Ein Mitarbeiter ist auf dem Weg, um Ihren Einkauf zu überprüfen. <br />
                Bitte warten Sie einen Moment.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-3">
                <img src={QuestionmarkIcon} alt="Frage" className="w-32 h-32 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Alles eingescannt?</h2>
              <p className="text-sm text-gray-600">Es kann eine Zufallskontrolle stattfinden!</p>
            </>
          )}
        </div>

        {!inspectionActive && (
          <div className="mb-4">
            {appliedVoucher ? (
              <div className="flex items-center justify-between bg-green-50 border-2 border-green-400 rounded-lg px-4 py-3">
                <div>
                  <p className="font-bold text-green-800 text-sm tracking-widest">
                    {appliedVoucher.code}
                  </p>
                  <p className="text-green-700 text-xs">
                    -{appliedVoucher.discountAmount.toFixed(2).replace('.', ',')} EUR Rabatt
                  </p>
                </div>
                <button
                  onClick={removeVoucher}
                  className="text-red-500 font-bold text-lg hover:text-red-700 ml-4"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && applyVoucher()}
                  placeholder="Gutschein-Code eingeben"
                  className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                />
                <button
                  onClick={applyVoucher}
                  disabled={!voucherCode.trim()}
                  className="px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-40"
                  style={{ backgroundColor: '#948BB8' }}
                >
                  Einlösen
                </button>
              </div>
            )}
            {voucherStatus && (
              <p
                className={`text-xs mt-1 px-1 ${
                  voucherStatus.type === 'success' ? 'text-green-700' : 'text-red-600'
                }`}
              >
                {voucherStatus.message}
              </p>
            )}
          </div>
        )}

        {(!inspectionActive || inspectionCompleted) && (
          <div className="flex gap-4 justify-center">
            {!inspectionCompleted && (
              <button
                onClick={() => navigate('/scan')}
                className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#E1E1F2' }}
              >
                Zurück zum Einscannen
              </button>
            )}
            <button
              onClick={handleContinueToPayment}
              className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: '#948BB8' }}
            >
              Weiter zur Zahlung
            </button>
          </div>
        )}
      </div>
      <CustomerCardModal
        isOpen={showCustomerCard}
        onYes={handleCustomerCardYes}
        onNo={handleCustomerCardNo}
      />
    </div>
  )
}
