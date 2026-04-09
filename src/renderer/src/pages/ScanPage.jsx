import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { scannerApi } from '../api/scannerAPI'
import { categoryApi } from '../api/categoryAPI'
import { productApi } from '../api/productAPI'
import apfel from '../../../../resources/apfel.png'
import karotte from '../../../../resources/karotte.png'
import croissant from '../../../../resources/croissant.png'
import ScannerIcon from '../assets/Icons/Scanner.png'
import BarcodeIcon from '../assets/Icons/Barcode.png'
import WarningIcon from '../assets/Icons/Warning.png'

const categoryImages = {
  Obst: apfel,
  Gemüse: karotte,
  Backwaren: croissant
}

export default function ScanPage() {
  const navigate = useNavigate()
  const devMode = useDevMode()
  const barcodeRef = useRef(null)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanStatus, setScanStatus] = useState(null)

  // State für Alterskontrolle
  const [ageControlActive, setAgeControlActive] = useState(
    sessionStorage.getItem('ageControlActive') === 'true'
  )
  const [pendingAgeProduct, setPendingAgeProduct] = useState(() => {
    const stored = sessionStorage.getItem('pendingAgeProduct')
    return stored ? JSON.parse(stored) : null
  })

  // Einzige geordnete Liste aller Artikel (manuelle + Barcode)
  // Jeder Eintrag: { type: 'manual', id, name, price } oder { type: 'barcode', barcode, name, price, discount }
  const [cartItemsList, setCartItemsList] = useState(() => {
    const stored = sessionStorage.getItem('cartItemsList')
    return stored ? JSON.parse(stored) : []
  })

  // Action-History für Undo-Funktionalität
  const [actionHistory, setActionHistory] = useState([])

  // Counts für die Produkt-Grid-Anzeige ableiten
  const counts = cartItemsList.reduce((acc, item) => {
    if (item.type === 'manual') {
      acc[item.id] = (acc[item.id] || 0) + 1
    }
    return acc
  }, {})

  const focusBarcodeInput = useCallback(() => {
    // Nicht fokussieren wenn ein Modal aktiv ist
    const modalOpen = sessionStorage.getItem('modalOpen') === 'true'

    if (barcodeRef.current && !modalOpen) {
      barcodeRef.current.focus()
    }
  }, [])

  useEffect(() => {
    focusBarcodeInput()
    const timer = setTimeout(focusBarcodeInput, 100)
    return () => clearTimeout(timer)
  }, [focusBarcodeInput])

  const [kategorien, setKategorien] = useState([])
  const [aktiveProdukteList, setAktiveProdukteList] = useState([])

  useEffect(() => {
    const anzeigeKategorien = ['Obst', 'Gemüse', 'Backwaren']
    categoryApi
      .getAllCategories()
      .then((alle) => alle.filter((k) => anzeigeKategorien.includes(k.bezeichnung)))
      .then(setKategorien)
      .catch(console.error)
  }, [])

  const handleBarcodeScan = async () => {
    if (!barcodeInput.trim()) return
    const barcode = barcodeInput.trim()
    setScanStatus(null)

    // Kundenkarte scannen
    if (sessionStorage.getItem('pendingCustomerCard') === 'true') {
      sessionStorage.removeItem('pendingCustomerCard')
      sessionStorage.setItem('customerCard', barcode)
      window.dispatchEvent(new Event('cartUpdated'))
      setScanStatus({ type: 'success', message: `Kundenkarte ${barcode} erfasst` })
      window.api?.tapo?.flashGreen()
      setBarcodeInput('')
      return
    }

    // Produkt scannen
    try {
      const product = await scannerApi.sendBarcode(barcode)
      const item = {
        type: 'barcode',
        barcode,
        name: product.name || `Unbekannt (${barcode})`,
        price: product.price || 0,
        discount: product.discount || null
      }
      setCartItemsList((prev) => [...prev, item])
      setActionHistory((prev) => [...prev, { type: 'barcode' }])
      setScanStatus({ type: 'success', message: `${item.name} hinzugefuegt` })
      window.api?.tapo?.flashGreen()
    } catch {
      const item = {
        type: 'barcode',
        barcode,
        name: `Unbekannt (${barcode})`,
        price: 0
      }
      setCartItemsList((prev) => [...prev, item])
      setActionHistory((prev) => [...prev, { type: 'barcode' }])
      setScanStatus({ type: 'error', message: `Unbekannt (${barcode}) hinzugefuegt` })
      window.api?.tapo?.flashRed()
    }
    setBarcodeInput('')
  }

  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    if (!activeCategory) return
    productApi
      .getProductsByCategory(activeCategory.id)
      .then(setAktiveProdukteList)
      .catch(console.error)
  }, [activeCategory])

  const increase = (id) => {
    const product = aktiveProdukteList.find((p) => p.id === id)
    if (!product) return

    // Age Control Check - nur beim ersten altersbeschränkten Produkt
    const ageControlCompleted = sessionStorage.getItem('ageControlCompleted') === 'true'
    if (product.mindestalter && product.mindestalter >= 16) {
      if (!ageControlCompleted) {
        // Erste Kontrolle - warten auf Mitarbeiter
        setAgeControlActive(true)
        setPendingAgeProduct(product)
        sessionStorage.setItem('ageControlActive', 'true')
        sessionStorage.setItem('pendingAgeProduct', JSON.stringify(product))
        //Item wird nach der erfolgreichen Kontrolle hinzugefügt
        return
      }
      // Kontrolle bereits abgeschlossen - direkt hinzufügen
      setCartItemsList((prev) => [
        ...prev,
        {
          type: 'manual',
          id: product.id,
          name: product.name,
          price: product.preis || 0,
          mindestalter: product.mindestalter
        }
      ])
      setActionHistory((prev) => [...prev, { type: 'category', productId: id }])
      return
    }

    setCartItemsList((prev) => [
      ...prev,
      { type: 'manual', id: product.id, name: product.name, price: product.preis || 0 }
    ])
    setActionHistory((prev) => [...prev, { type: 'category', productId: id }])
  }

  const decrease = (id) => {
    setCartItemsList((prev) => {
      // Letztes Vorkommen dieses Produkts entfernen
      const lastIndex = findLastIndex(prev, (item) => item.type === 'manual' && item.id === id)
      if (lastIndex === -1) return prev
      return [...prev.slice(0, lastIndex), ...prev.slice(lastIndex + 1)]
    })
  }

  const resetLast = () => {
    if (cartItemsList.length === 0) return

    // Letztes Item aus cartItemsList entfernen
    setCartItemsList((prev) => {
      if (prev.length === 0) return prev
      return prev.slice(0, -1)
    })

    // actionHistory aktualisieren
    setActionHistory((prev) => prev.slice(0, -1))
  }

  // Hilfsfunktion: findLastIndex (für ältere JS-Umgebungen)
  const findLastIndex = (arr, predicate) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i])) return i
    }
    return -1
  }

  // Cart-Items für Sidebar und sessionStorage zusammenbauen (jedes Item einzeln mit quantity: 1)
  const getScannedItems = () => {
    return cartItemsList.map((item) => {
      if (item.type === 'manual') {
        return { name: item.name, id: item.id, price: 0, quantity: 1 }
      }
      return {
        barcode: item.barcode,
        name: item.name,
        price: item.price || 0,
        discount: item.discount || null,
        quantity: 1
      }
    })
  }

  useEffect(() => {
    const allItems = getScannedItems()
    sessionStorage.setItem('cartItems', JSON.stringify(allItems))
    sessionStorage.setItem('cartItemsList', JSON.stringify(cartItemsList))
    window.dispatchEvent(new Event('cartUpdated'))
  }, [cartItemsList])

  useEffect(() => {
    const handleAgeControlUpdate = () => {
      setAgeControlActive(sessionStorage.getItem('ageControlActive') === 'true')
      const stored = sessionStorage.getItem('pendingAgeProduct')
      setPendingAgeProduct(stored ? JSON.parse(stored) : null)

      // cartItemsList neu laden nach Alterskontrolle
      const cartStored = sessionStorage.getItem('cartItemsList')
      if (cartStored) {
        setCartItemsList(JSON.parse(cartStored))
      }
    }

    window.addEventListener('ageControlStatusChanged', handleAgeControlUpdate)
    return () => window.removeEventListener('ageControlStatusChanged', handleAgeControlUpdate)
  }, [])

  const hasItems = cartItemsList.length > 0

  const handleNavigateToSummary = () => {
    const items = getScannedItems()
    sessionStorage.setItem('cartItems', JSON.stringify(items))
    navigate('/summary')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barcode Input - deaktiviert während Alterskontrolle */}
      <input
        ref={barcodeRef}
        autoFocus
        type="text"
        value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
        onBlur={() => setTimeout(focusBarcodeInput, 50)}
        placeholder="Barcode eingeben..."
        disabled={ageControlActive}
        className={
          devMode
            ? 'mb-2 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B4B] disabled:opacity-50 disabled:cursor-not-allowed'
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

      {ageControlActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src={WarningIcon} alt="Warnung" className="w-32 h-32 object-contain" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Altersprüfung erforderlich</h2>
            {pendingAgeProduct && (
              <p className="text-xl text-gray-700 mb-2">
                <strong>{pendingAgeProduct.name}</strong>
              </p>
            )}
            <p className="text-lg text-gray-700 mb-4">
              Ein Mitarbeiter muss Ihren gescannten Artikel kontrollieren.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {kategorien.map((kat) => (
              <button
                key={kat.id}
                onClick={() => setActiveCategory(kat)}
                className={`h-28 rounded-xl flex flex-col items-center justify-center text-xl font-bold border-4 transition
                  ${
                    activeCategory?.id === kat.id
                      ? 'bg-[#7C83FD] text-white border-[#6C72E8]'
                      : 'bg-[#D9DADD] text-[#4A4A68] border-[#C9CAD1] hover:bg-[#cfd0d4]'
                  }
                `}
              >
                {categoryImages[kat.bezeichnung] && (
                  <img src={categoryImages[kat.bezeichnung]} className="h-10 mb-2 object-contain" />
                )}
                {kat.bezeichnung.toUpperCase()}
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
            </div>
          ) : (
            <>
              {/* Produkte vom Backend */}

              <div className="grid grid-cols-3 gap-6 flex-1">
                {aktiveProdukteList.map((item) => (
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
            </>
          )}

          {hasItems && !ageControlActive && (
            <div className="flex justify-between mt-6 gap-4">
              <button
                onClick={resetLast}
                className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#E1E1F2' }}
              >
                Letzten Artikel löschen
              </button>
              <button
                onClick={handleNavigateToSummary}
                className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#948BB8' }}
              >
                Weiter zur Zusammenfassung →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
