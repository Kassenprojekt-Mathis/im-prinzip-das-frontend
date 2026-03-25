import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { scannerApi } from '../api/scannerAPI'
import apfel from '../../../../resources/apfel.png'
import karotte from '../../../../resources/karotte.png'
import croissant from '../../../../resources/croissant.png'
import ScannerIcon from '../assets/Icons/Scanner.png'
import BarcodeIcon from '../assets/Icons/Barcode.png'

export default function ScanPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const devMode = useDevMode()
  const barcodeRef = useRef(null)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanStatus, setScanStatus] = useState(null)
  const [scannedBarcodeItems, setScannedBarcodeItems] = useState([])

  const focusBarcodeInput = useCallback(() => {
    if (barcodeRef.current) {
      barcodeRef.current.focus()
    }
  }, [])

  useEffect(() => {
    focusBarcodeInput()
    const timer = setTimeout(focusBarcodeInput, 100)
    return () => clearTimeout(timer)
  }, [focusBarcodeInput])

  const categories = [
    { name: 'Obst', img: apfel },
    { name: 'Gemüse', img: karotte },
    { name: 'Backwaren', img: croissant }
  ]

  //MockDaten zum Testen

  const products = {
    Obst: [
      { id: 1, name: 'Apfel' },
      { id: 2, name: 'Banane' },
      { id: 3, name: 'Kiwi' },
      { id: 4, name: 'Traube' },
      { id: 5, name: 'Pfirsich' },
      { id: 6, name: 'Kirsche' }
    ],
    Gemüse: [
      { id: 7, name: 'Karotte' },
      { id: 8, name: 'Brokkoli' },
      { id: 9, name: 'Tomate' }
    ],
    Backwaren: [
      { id: 10, name: 'Croissant' },
      { id: 11, name: 'Brötchen' },
      { id: 12, name: 'Baguette' }
    ]
  }

  const handleBarcodeScan = async () => {
    if (!barcodeInput.trim()) return
    const barcode = barcodeInput.trim()
    setScanStatus(null)
    try {
      const product = await scannerApi.sendBarcode(barcode)
      const item = {
        barcode,
        name: product.name || `Unbekannt (${barcode})`,
        price: product.price || 0,
        quantity: 1
      }
      setScannedBarcodeItems((prev) => [...prev, item])
      setScanStatus({ type: 'success', message: `${item.name} hinzugefuegt` })
      window.api?.tapo?.flashGreen()
    } catch {
      const item = {
        barcode,
        name: `Unbekannt (${barcode})`,
        price: 0,
        quantity: 1
      }
      setScannedBarcodeItems((prev) => [...prev, item])
      setScanStatus({ type: 'error', message: `Unbekannt (${barcode}) hinzugefuegt` })
      window.api?.tapo?.flashRed()
    }
    setBarcodeInput('')
  }

  const [activeCategory, setActiveCategory] = useState(location.state?.category || null)

  const [counts, setCounts] = useState({})

  const increase = (id) => {
    setCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }))
  }

  const decrease = (id) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0)
    }))
  }

  const resetLast = () => {
    const keys = Object.keys(counts)
    const last = keys[keys.length - 1]

    if (!last) return

    setCounts((prev) => ({
      ...prev,
      [last]: Math.max(prev[last] - 1, 0)
    }))
  }

  // Scanned items für die nächsten Pages zusammenbauen
  const getScannedItems = () => {
    const items = []
    for (const category of Object.values(products)) {
      for (const product of category) {
        const count = counts[product.id] || 0
        if (count > 0) {
          items.push({ ...product, quantity: count, price: 0 })
        }
      }
    }
    return [...items, ...scannedBarcodeItems]
  }

  useEffect(() => {
    const allItems = getScannedItems()
    if (allItems.length > 0) {
      sessionStorage.setItem('cartItems', JSON.stringify(allItems))
    }
  }, [counts, scannedBarcodeItems])

  const hasItems = Object.values(counts).some((c) => c > 0) || scannedBarcodeItems.length > 0

  const handleNavigateToSummary = () => {
    const items = getScannedItems()
    sessionStorage.setItem('cartItems', JSON.stringify(items))
    navigate('/summary')
  }

  return (
    <div className="flex flex-col h-full">
      <input
        ref={barcodeRef}
        autoFocus
        type="text"
        value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
        onBlur={() => setTimeout(focusBarcodeInput, 50)}
        placeholder="Barcode eingeben..."
        className={
          devMode
            ? 'mb-2 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B4B]'
            : 'absolute opacity-0 pointer-events-none'
        }
      />

      {devMode && (
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleBarcodeScan}
              className="px-6 py-2 text-sm font-bold bg-[#1E1B4B] text-white rounded-lg hover:bg-[#2d2a5e] active:scale-95 transition-transform"
            >
              Scannen
            </button>
            <button
              onClick={() => window.api?.tapo?.flashGreen()}
              className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-transform"
            >
              🟢 Lampe
            </button>
            <button
              onClick={() => window.api?.tapo?.flashRed()}
              className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-transform"
            >
              🔴 Lampe
            </button>
          </div>
          {scanStatus && (
            <div
              className={`p-2 rounded-lg text-sm ${
                scanStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {scanStatus.message}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`h-28 rounded-xl flex flex-col items-center justify-center text-xl font-bold border-4 transition
              ${
                activeCategory === cat.name
                  ? 'bg-[#7C83FD] text-white border-[#6C72E8]' //true
                  : 'bg-[#D9DADD] text-[#4A4A68] border-[#C9CAD1] hover:bg-[#cfd0d4]' //false
              }
            `}
          >
            <img src={cat.img} className="h-10 mb-2 object-contain" />
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>

      {activeCategory === null ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="flex justify-center items-end gap-12 mb-8">
            <img src={BarcodeIcon} alt="Barcode" className="w-24 h-24 object-contain" />
            <img
              src={ScannerIcon}
              alt="Scanner"
              className="w-40 h-40 object-contain"
              style={{ transform: 'rotate(-25deg) translateY(-20px)' }}
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-gray-800">Herzlich Willkommen!</h1>
            <p className="text-xl text-gray-700">
              Bitte scannen Sie Ihre Artikel aus dem Warenkorb ein.
            </p>
          </div>
          {hasItems && (
            <button
              onClick={handleNavigateToSummary}
              className="mt-6 px-8 py-3 text-white font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: '#948BB8' }}
            >
              WEITER →
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Produkte --> überarbeiten sobald Backend Anbindung steht*/}

          <div className="grid grid-cols-3 gap-6 flex-1">
            {products[activeCategory].map((item) => (
              <div
                key={item.id}
                className="bg-[#E9EAF1] rounded-xl p-4 flex flex-col items-center justify-between shadow-sm"
              >
                {/* Counter */}

                <div className="flex items-center gap-4 text-xl font-bold">
                  <button
                    onClick={() => decrease(item.id)}
                    className="px-3 py-1 bg-white rounded shadow active:scale-95"
                  >
                    -
                  </button>

                  <span>{counts[item.id] || 0}</span>

                  <button
                    onClick={() => increase(item.id)}
                    className="px-3 py-1 bg-white rounded shadow active:scale-95"
                  >
                    +
                  </button>
                </div>

                {/* Name */}

                <span className="text-lg font-bold mt-2"> {item.name} </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6 gap-4">
            <button
              onClick={resetLast}
              className="bg-[#A9ACC3] text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-[#8f93aa]"
            >
              letzten gescannten Artikel löschen
            </button>
            <button
              onClick={handleNavigateToSummary}
              disabled={!hasItems}
              className="px-8 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#948BB8' }}
            >
              WEITER →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
