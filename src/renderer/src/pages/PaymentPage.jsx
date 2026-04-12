import PropTypes from 'prop-types'
import { usePaymentViewModel } from '../hooks/usePaymentViewModel'
import CardIcon from '../assets/Icons/Card.png'
import CashIcon from '../assets/Icons/Cash.png'
import PersonIcon from '../assets/Icons/Person.png'

function PrintStatusBanner({ printStatus }) {
  if (!printStatus) return null
  const colorClass =
    printStatus.type === 'success'
      ? 'bg-green-50 border border-green-200 text-green-700'
      : 'bg-red-50 border border-red-200 text-red-700'
  return <div className={`p-2 rounded-lg text-sm ${colorClass}`}>{printStatus.message}</div>
}

PrintStatusBanner.propTypes = {
  printStatus: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'error']).isRequired,
    message: PropTypes.string.isRequired
  })
}

function PaymentSuccessView({
  ecoScore,
  ecoVoucher,
  devMode,
  isPrinting,
  printStatus,
  printers,
  currentPrinter,
  handlePrinterChange,
  printReceipt,
  handleNextPurchase
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-6">ZAHLUNG GENEHMIGT</h1>
        <p className="text-2xl text-gray-800">Danke für den Einkauf.</p>
        <p className="text-2xl text-gray-800 mb-4">Auf Wiedersehen!</p>
        <div className="flex justify-center mb-8">
          <img src={PersonIcon} alt="Person" className="w-32 h-32 object-contain" />
        </div>

        {ecoScore !== null && (
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <p className="text-xl text-gray-700 mb-2">Ihre neuen Ecopunkte:</p>
            <p className="text-5xl font-bold" style={{ color: '#948BB8' }}>
              {ecoScore}
            </p>
          </div>
        )}

        {ecoVoucher && (
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-6">
            <p className="text-lg font-bold text-green-700 mb-1">Eco-Gutschein erhalten!</p>
            <p className="text-2xl font-bold text-green-800 tracking-widest">{ecoVoucher.code}</p>
            <p className="text-sm text-green-600 mt-1">
              Wert: {parseFloat(ecoVoucher.wert).toFixed(2)} EUR &mdash; siehe Bon
            </p>
          </div>
        )}

        {devMode && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 justify-center">
              <label className="text-sm font-semibold text-gray-600">🖨️ Drucker:</label>
              <select
                value={currentPrinter}
                onChange={handlePrinterChange}
                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1B4B]"
              >
                {printers.length === 0 ? (
                  <option value="">Keine Drucker gefunden</option>
                ) : (
                  printers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))
                )}
              </select>
            </div>
            <button
              onClick={printReceipt}
              disabled={isPrinting || printers.length === 0}
              className="px-8 py-3 text-white text-lg font-bold rounded-lg bg-[#1E1B4B] hover:bg-[#2d2a5e] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? '⏳ Wird gedruckt...' : '🖨️ BON DRUCKEN'}
            </button>
            <PrintStatusBanner printStatus={printStatus} />
          </div>
        )}

        {!devMode && <PrintStatusBanner printStatus={printStatus} />}

        <button
          onClick={handleNextPurchase}
          className="px-12 py-4 text-white text-xl font-semibold rounded-lg transition-colors hover:opacity-90 mt-6"
          style={{ backgroundColor: '#948BB8' }}
        >
          Nächster Einkauf
        </button>
      </div>
    </div>
  )
}

PaymentSuccessView.propTypes = {
  ecoScore: PropTypes.number,
  ecoVoucher: PropTypes.shape({
    code: PropTypes.string.isRequired,
    wert: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }),
  devMode: PropTypes.bool.isRequired,
  isPrinting: PropTypes.bool.isRequired,
  printStatus: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'error']).isRequired,
    message: PropTypes.string.isRequired
  }),
  printers: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentPrinter: PropTypes.string.isRequired,
  handlePrinterChange: PropTypes.func.isRequired,
  printReceipt: PropTypes.func.isRequired,
  handleNextPurchase: PropTypes.func.isRequired
}

function PaymentSelectionView({ paymentError, handlePayment }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {paymentError && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-300 text-red-700 text-center max-w-xl">
          <p className="text-lg font-bold mb-1">Zahlung fehlgeschlagen</p>
          <p>{paymentError}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-8 max-w-3xl w-full">
        <button
          onClick={() => handlePayment('Kartenzahlung')}
          className="flex flex-col items-center justify-center p-12 rounded-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#D9DADD' }}
        >
          <div className="mb-4">
            <img src={CardIcon} alt="Kartenzahlung" className="w-32 h-32 object-contain" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Kartenzahlung</span>
        </button>
        <button
          onClick={() => handlePayment('Bar')}
          className="flex flex-col items-center justify-center p-12 rounded-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#D9DADD' }}
        >
          <div className="mb-4">
            <img src={CashIcon} alt="Barzahlung" className="w-32 h-32 object-contain" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Barzahlung</span>
        </button>
      </div>
    </div>
  )
}

PaymentSelectionView.propTypes = {
  paymentError: PropTypes.string,
  handlePayment: PropTypes.func.isRequired
}

export default function PaymentPage() {
  const vm = usePaymentViewModel()

  if (vm.paymentComplete) {
    return (
      <PaymentSuccessView
        ecoScore={vm.ecoScore}
        ecoVoucher={vm.ecoVoucher}
        devMode={vm.devMode}
        isPrinting={vm.isPrinting}
        printStatus={vm.printStatus}
        printers={vm.printers}
        currentPrinter={vm.currentPrinter}
        handlePrinterChange={vm.handlePrinterChange}
        printReceipt={vm.printReceipt}
        handleNextPurchase={vm.handleNextPurchase}
      />
    )
  }

  return <PaymentSelectionView paymentError={vm.paymentError} handlePayment={vm.handlePayment} />
}
