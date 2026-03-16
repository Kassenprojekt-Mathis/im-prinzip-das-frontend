import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { printerApi } from '../api/printerAPI'

export default function SummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // State
  const [printers, setPrinters] = useState([])
  const [currentPrinter, setCurrentPrinter] = useState('')
  const [isPrinting, setIsPrinting] = useState(false)
  const [printStatus, setPrintStatus] = useState(null) // { type: 'success'|'error', message: string }

  // Daten aus der PaymentPage übernehmen 
  const scannedItems = location.state?.items || []
  const paymentMethod = location.state?.paymentMethod || 'Bar'

  // Artikel zusammenfassen (gleiche Artikel gruppieren und Menge zählen)
  const items = scannedItems.reduce((acc, item) => {
    const key = item.barcode || item.name
    const existing = acc.find((i) => (i.barcode || i.name) === key)
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1
    } else {
      acc.push({ ...item, quantity: item.quantity || 1 })
    }
    return acc
  }, [])

  const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)

  // Drucker beim Laden abfragen
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

  // Drucker wechseln
  const handlePrinterChange = async (e) => {
    const name = e.target.value
    setCurrentPrinter(name)
    try {
      await printerApi.setPrinter(name)
      setPrintStatus({ type: 'success', message: `Drucker gewechselt: ${name}` })
    } catch (err) {
      setPrintStatus({ type: 'error', message: `Fehler: ${err.message}` })
    }
  }

  // Bon drucken
  const handlePrint = async () => {
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

  // Test-Bon drucken
  const handleTestPrint = async () => {
    setIsPrinting(true)
    setPrintStatus(null)
    try {
      await printerApi.printTestReceipt()
      setPrintStatus({ type: 'success', message: 'Test-Bon wurde gedruckt! 🧪' })
    } catch (err) {
      setPrintStatus({ type: 'error', message: `Druckfehler: ${err.message}` })
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#1e1e38]">Zusammenfassung</h1>

      {/* ── Artikel-Liste ── */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left text-gray-500">
              <th className="py-2">Artikel</th>
              <th className="py-2 text-center">Anz.</th>
              <th className="py-2 text-right">Preis</th>
              <th className="py-2 text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 font-medium">{item.name}</td>
                <td className="py-2 text-center">{item.quantity || 1}</td>
                <td className="py-2 text-right">
                  {(item.price || 0).toFixed(2).replace('.', ',')} €
                </td>
                <td className="py-2 text-right font-semibold">
                  {((item.price || 0) * (item.quantity || 1)).toFixed(2).replace('.', ',')} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Summe ── */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t-2 border-[#1E1B4B]">
          <span className="text-lg font-black text-[#1e1e38]">SUMME:</span>
          <span className="text-2xl font-bold text-[#1E1B4B]">
            {total.toFixed(2).replace('.', ',')} €
          </span>
        </div>
      </div>

      {/* ── Drucker-Auswahl ── */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">
            🖨️ Drucker:
          </label>
          <select
            value={currentPrinter}
            onChange={handlePrinterChange}
            className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1B4B]"
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
      </div>

      {/* ── Status-Meldung ── */}
      {printStatus && (
        <div
          className={`p-3 rounded-lg text-sm ${
            printStatus.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {printStatus.message}
        </div>
      )}

      {/* ── Druck-Buttons ── */}
      <div className="flex gap-3">
        <button
          onClick={handleTestPrint}
          disabled={isPrinting || printers.length === 0}
          className="px-4 py-2.5 text-sm font-semibold border-2 border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🧪 Test-Bon
        </button>
        <button
          onClick={handlePrint}
          disabled={isPrinting || printers.length === 0}
          className="flex-1 py-2.5 text-lg font-bold bg-[#1E1B4B] text-white rounded-lg hover:bg-[#2d2a5e] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPrinting ? '⏳ Wird gedruckt...' : '🖨️ BON DRUCKEN'}
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-2 border-t border-gray-200">
        <button
          onClick={() => navigate('/payment', { state: { items: scannedItems } })}
          className="px-6 py-2.5 text-sm font-bold border-2 border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50 active:scale-95 transition-transform"
        >
          ← ZURÜCK
        </button>
        <button
          onClick={() => navigate('/scan')}
          className="flex-1 py-2.5 text-lg font-bold bg-[#1E1B4B] text-white rounded-lg hover:bg-[#2d2a5e] active:scale-95 transition-transform"
        >
          NEUER EINKAUF
        </button>
      </div>
    </div>
  )
}
