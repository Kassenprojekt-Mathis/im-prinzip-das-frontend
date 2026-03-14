import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { scannerApi } from '../api/scannerAPI'

// ── debug screen = true, for presentation = false ──
const DEV_MODE = true

export default function ScanPage() {
  const navigate = useNavigate()
  const [barcode, setBarcode] = useState('')
  const [scannedItems, setScannedItems] = useState([])
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  // fukus immer auf input feld setzen -> für scanner
  useEffect(() => {
    const keepFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    keepFocus()

    window.addEventListener('click', keepFocus)
    window.addEventListener('focus', keepFocus)
    return () => {
      window.removeEventListener('click', keepFocus)
      window.removeEventListener('focus', keepFocus)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const scannedCode = barcode.trim()
    if (!scannedCode) return

    setError(null)

    try {
      const product = await scannerApi.sendBarcode(scannedCode)
      setScannedItems((prev) => [...prev, product])

      // ── Tapo: Grün blinken ──
      window.api?.tapo?.flashGreen().catch((e) =>
        console.warn('Tapo flashGreen fehlgeschlagen:', e.message)
      )
    } catch (err) {
      console.error('Scan-Fehler:', err.message)
      setError(err.message)

      // ── Tapo: Rot blinken ──
      window.api?.tapo?.flashRed().catch((e) =>
        console.warn('Tapo flashRed fehlgeschlagen:', e.message)
      )

      // platzhalter bis backend angebunden ist
      setScannedItems((prev) => [
        ...prev,
        { barcode: scannedCode, name: `Unbekannt (${scannedCode})`, price: 0 }
      ])
    }

    setBarcode('')
  }

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className={
            DEV_MODE
              ? 'w-full p-2 border-2 border-dashed border-orange-400 rounded-lg bg-orange-50 text-sm mb-3 outline-none focus:border-orange-500'
              : 'absolute opacity-0 w-0 h-0'
          }
          placeholder={DEV_MODE ? '🔧 Barcode scannen oder manuell eintippen + Enter...' : ''}
          aria-label="Barcode Scanner Eingabe"
          autoFocus
        />
      </form>

      {DEV_MODE && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-300 rounded-lg text-xs text-yellow-800">
          🔧 <strong>DEV-Modus aktiv</strong> — Input ist sichtbar für manuelle Eingabe. Setze{' '}
          <code>DEV_MODE = false</code> in ScanPage.jsx um es unsichtbar zu machen.
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {scannedItems.length === 0 ? (
          <div className="text-gray-400">
            <p className="text-2xl font-bold mb-2">📦 Bitte Artikel scannen</p>
            <p className="text-sm">
              Der Scanner ist bereit. Halten Sie den Barcode vor den Scanner.
            </p>
          </div>
        ) : (
          <div className="w-full text-left">
            <h2 className="text-lg font-bold mb-3 text-[#1e1e38]">Gescannte Artikel:</h2>
            <ul className="space-y-2">
              {scannedItems.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <span className="font-medium">{item.name || item.barcode}</span>
                  {item.price != null && (
                    <span className="font-semibold">
                      {item.price.toFixed(2).replace('.', ',')}€
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={() => navigate('/summary', { state: { items: scannedItems } })}
          disabled={scannedItems.length === 0}
          className="w-full py-3 text-lg font-bold bg-[#1E1B4B] text-white rounded-lg hover:bg-[#2d2a5e] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          WEITER ZUR ZUSAMMENFASSUNG →
        </button>
      </div>
    </div>
  )
}
