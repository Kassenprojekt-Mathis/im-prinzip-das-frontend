import { usePayment } from '../hooks/usePayment'
import CardIcon from '../assets/Icons/Card.png'
import CashIcon from '../assets/Icons/Cash.png'
import PersonIcon from '../assets/Icons/Person.png'

export default function PaymentPage() {
  const {
    total,
    paymentComplete,
    ecoScore,
    isPrinting,
    printStatus,
    printers,
    currentPrinter,
    devMode,
    handlePayment,
    handlePrinterChange,
    handleNextPurchase,
    printReceipt
  } = usePayment()

  if (paymentComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold mb-6">ZAHLUNG GENEHMIGT</h1>
          <p className="text-2xl text-gray-800">Danke für den Einkauf.</p>
          <p className="text-2xl text-gray-800 mb-4">Auf Wiedersehen!</p>
          <div className="flex justify-center mb-8">
            <img src={PersonIcon} alt="Person" className="w-32 h-32 object-contain" />
          </div>
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <p className="text-xl text-gray-700 mb-2">Ihr neuer EcoScore:</p>
            <p className="text-5xl font-bold" style={{ color: '#948BB8' }}>
              {ecoScore}
            </p>
          </div>

          {devMode && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 justify-center">
                <label className="text-sm font-semibold text-gray-600">Drucker:</label>
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
                {isPrinting ? 'Wird gedruckt...' : 'BON DRUCKEN'}
              </button>
            </div>
          )}

          {printStatus && (
            <div
              className={`mb-6 p-2 rounded-lg text-sm ${
                printStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {printStatus.message}
            </div>
          )}

          <button
            onClick={handleNextPurchase}
            className="px-12 py-4 text-white text-xl font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#948BB8' }}
          >
            Nächster Einkauf
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <p className="text-2xl font-bold text-[#1e1e38]">
        Zu zahlen: {total.toFixed(2).replace('.', ',')} €
      </p>
      <div className="grid grid-cols-2 gap-8 max-w-3xl w-full">
        <button
          onClick={() => handlePayment('Kartenzahlung')}
          className="flex flex-col items-center justify-center p-12 rounded-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#D9DADD' }}
        >
          <img src={CardIcon} alt="Kartenzahlung" className="w-32 h-32 object-contain mb-4" />
          <span className="text-2xl font-bold text-gray-800">Kartenzahlung</span>
        </button>
        <button
          onClick={() => handlePayment('Bar')}
          className="flex flex-col items-center justify-center p-12 rounded-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#D9DADD' }}
        >
          <img src={CashIcon} alt="Barzahlung" className="w-32 h-32 object-contain mb-4" />
          <span className="text-2xl font-bold text-gray-800">Barzahlung</span>
        </button>
      </div>
    </div>
  )
}
