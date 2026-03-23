import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { printerApi } from '../api/printerAPI'
import CardIcon from '../assets/Icons/Card.png'
import CashIcon from '../assets/Icons/Cash.png'
import PersonIcon from '../assets/Icons/Person.png'

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const devMode = useDevMode()
  const scannedItems = location.state?.items || []

  const items = useMemo(() => {
    return scannedItems.reduce((acc, item) => {
      const key = item.barcode || item.name
      const existing = acc.find((i) => (i.barcode || i.name) === key)
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1
      } else {
        acc.push({ ...item, quantity: item.quantity || 1 })
      }
      return acc
    }, [])
  }, [scannedItems])

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
  }, [items])

  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [ecoScore] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [isPrinting, setIsPrinting] = useState(false)
  const [printStatus, setPrintStatus] = useState(null)
  const [printers, setPrinters] = useState([])
  const [currentPrinter, setCurrentPrinter] = useState('')
  const hasAutoPrinted = useRef(false)

  useEffect(() => {
    async function loadPrinters() {
      try {
        const [available, current] = await Promise.all([
          printerApi.getAvailablePrinters(),
          printerApi.getCurrentPrinter()
        ])
        setPrinters(available)
        setCurrentPrinter(current)
      } catch (err) {
        console.error('Drucker konnten nicht geladen werden:', err)
      }
    }
    loadPrinters()
  }, [])

  const printReceipt = async () => {
    setIsPrinting(true)
    setPrintStatus(null)
    try {
      await printerApi.printReceipt({
        storeName: 'Im Prinzip',
        items,
        total,
        paymentMethod,
        footer: 'Vielen Dank fuer Ihren Einkauf!'
      })
      setPrintStatus({ type: 'success', message: 'Bon wurde erfolgreich gedruckt! 🖨️' })
    } catch (err) {
      setPrintStatus({ type: 'error', message: `Druckfehler: ${err.message}` })
    } finally {
      setIsPrinting(false)
    }
  }

  useEffect(() => {
    if (paymentComplete && !devMode && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true
      printReceipt()
    }
  }, [paymentComplete, devMode])

  const handlePrinterChange = async (e) => {
    const name = e.target.value
    setCurrentPrinter(name)
    try {
      await printerApi.setPrinter(name)
    } catch (err) {
      setPrintStatus({ type: 'error', message: `Fehler: ${err.message}` })
    }
  }

  const handleCardPayment = () => {
    setPaymentMethod('Kartenzahlung')
    setPaymentComplete(true)
  }
  const handleCashPayment = () => {
    setPaymentMethod('Bar')
    setPaymentComplete(true)
  }
  const handleNextPurchase = () => {
    sessionStorage.clear()
    navigate('/scan')
  }
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
              {printStatus && (
                <div
                  className={`p-2 rounded-lg text-sm ${
                    printStatus.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {printStatus.message}
                </div>
              )}
            </div>
          )}

          {!devMode && printStatus && (
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
    <div className="flex items-center justify-center h-full p-8">
      <div className="grid grid-cols-2 gap-8 max-w-3xl w-full">
        <button
          onClick={handleCardPayment}
          className="flex flex-col items-center justify-center p-12 rounded-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#D9DADD' }}
        >
          <div className="mb-4">
            <img src={CardIcon} alt="Kartenzahlung" className="w-32 h-32 object-contain" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Kartenzahlung</span>
        </button>
        <button
          onClick={handleCashPayment}
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
