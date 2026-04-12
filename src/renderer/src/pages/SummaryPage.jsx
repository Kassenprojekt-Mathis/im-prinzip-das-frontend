import { useSummaryViewModel } from '../hooks/useSummary'
import CustomerCardModal from '../components/CustomerCardModal'
import QuestionmarkIcon from '../assets/Icons/Questionmark.png'
import HandsIcon from '../assets/Icons/Hands.png'
import WarningIcon from '../assets/Icons/Warning.png'

export default function SummaryPage() {
  const vm = useSummaryViewModel()

  return (
    <div className="relative flex flex-col h-full items-center justify-center">
      <div className="p-6 w-full max-w-md">
        <div className="text-center mb-4">
          {vm.inspectionCompleted ? (
            <>
              <div className="flex justify-center mb-3">
                <img src={HandsIcon} alt="Hände" className="w-40 h-40 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Kontrolle vorbei!</h2>
              <p className="text-sm text-gray-600">Sie können nun zur Zahlung fortfahren.</p>
            </>
          ) : vm.inspectionActive ? (
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

        {!vm.inspectionActive && (
          <div className="mb-4">
            {vm.appliedVoucher ? (
              <div className="flex items-center justify-between bg-green-50 border-2 border-green-400 rounded-lg px-4 py-3">
                <div>
                  <p className="font-bold text-green-800 text-sm tracking-widest">
                    {vm.appliedVoucher.code}
                  </p>
                  <p className="text-green-700 text-xs">
                    -{vm.appliedVoucher.discountAmount.toFixed(2).replace('.', ',')} EUR Rabatt
                  </p>
                </div>
                <button
                  onClick={vm.removeVoucher}
                  className="text-red-500 font-bold text-lg hover:text-red-700 ml-4"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vm.voucherCode}
                  onChange={(e) => vm.setVoucherCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && vm.applyVoucher()}
                  placeholder="Gutschein-Code eingeben"
                  className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                />
                <button
                  onClick={vm.applyVoucher}
                  disabled={!vm.voucherCode.trim()}
                  className="px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-40"
                  style={{ backgroundColor: '#948BB8' }}
                >
                  Einlösen
                </button>
              </div>
            )}
            {vm.voucherStatus && (
              <p
                className={`text-xs mt-1 px-1 ${
                  vm.voucherStatus.type === 'success' ? 'text-green-700' : 'text-red-600'
                }`}
              >
                {vm.voucherStatus.message}
              </p>
            )}
          </div>
        )}

        {(!vm.inspectionActive || vm.inspectionCompleted) && (
          <div className="flex gap-4 justify-center">
            {!vm.inspectionCompleted && (
              <button
                onClick={vm.handleBackToScan}
                className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#E1E1F2' }}
              >
                Zurück zum Einscannen
              </button>
            )}
            <button
              onClick={vm.handleContinueToPayment}
              className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: '#948BB8' }}
            >
              Weiter zur Zahlung
            </button>
          </div>
        )}
      </div>
      <CustomerCardModal
        isOpen={vm.showCustomerCard}
        onYes={vm.handleCustomerCardYes}
        onNo={vm.handleCustomerCardNo}
      />
    </div>
  )
}
