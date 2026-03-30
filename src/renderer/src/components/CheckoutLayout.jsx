import { useState, useEffect, useCallback } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import logoPrinzip from '../assets/Prinzip_Logo.png'
import RandomInspectionVerificationModal from './RandomInspectionModal'
import HelpModal from './HelpModal'
import Sidebar from './Sidebar'

export default function CheckoutLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const devMode = useDevMode()

  const [showInspectionVerification, setShowInspectionVerification] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [cartItems, setCartItems] = useState([])

  const [customerCard, setCustomerCard] = useState(
    sessionStorage.getItem('customerCard') || ''
  )

  const isSummary = location.pathname.includes('/summary')

  const loadCart = useCallback(() => {
    const stored = sessionStorage.getItem('cartItems')
    setCartItems(stored ? JSON.parse(stored) : [])
    setCustomerCard(sessionStorage.getItem('customerCard') || '')
  }, [])

  useEffect(() => {
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [loadCart])

  // ── Cart-Bearbeitung (für editable Sidebar auf SummaryPage) ──

  const handleUpdateQuantity = (key, newQuantity) => {
    // cartItems ist eine flache Liste (jedes Item mit quantity: 1).
    // Wir müssen Items mit passendem key auf die neue Menge bringen.
    const stored = sessionStorage.getItem('cartItems')
    const allItems = stored ? JSON.parse(stored) : []

    // Alle Items mit diesem Key finden
    const matchingItems = allItems.filter((item) => (item.barcode || item.name) === key)
    const otherItems = allItems.filter((item) => (item.barcode || item.name) !== key)

    if (matchingItems.length === 0) return

    // Template vom ersten Match nehmen
    const template = { ...matchingItems[0], quantity: 1 }

    // Neue Menge an Items erstellen
    const newItems = []
    for (let i = 0; i < newQuantity; i++) {
      newItems.push({ ...template })
    }

    const updatedCart = [...otherItems, ...newItems]
    sessionStorage.setItem('cartItems', JSON.stringify(updatedCart))

    // Auch cartItemsList aktualisieren (für ScanPage-Kompatibilität)
    updateCartItemsList(key, newQuantity)

    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemoveItem = (key) => {
    const stored = sessionStorage.getItem('cartItems')
    const allItems = stored ? JSON.parse(stored) : []

    const updatedCart = allItems.filter((item) => (item.barcode || item.name) !== key)
    sessionStorage.setItem('cartItems', JSON.stringify(updatedCart))

    // Auch cartItemsList aktualisieren
    updateCartItemsList(key, 0)

    window.dispatchEvent(new Event('cartUpdated'))
  }

  const updateCartItemsList = (key, newQuantity) => {
    const stored = sessionStorage.getItem('cartItemsList')
    if (!stored) return

    const list = JSON.parse(stored)

    // Alle Einträge mit passendem Key finden
    const matchingIndices = []
    list.forEach((item, i) => {
      const itemKey = item.barcode || item.name
      if (itemKey === key) matchingIndices.push(i)
    })

    if (matchingIndices.length === 0) return

    // Entfernen
    if (newQuantity === 0) {
      const updated = list.filter((_, i) => !matchingIndices.includes(i))
      sessionStorage.setItem('cartItemsList', JSON.stringify(updated))
      return
    }

    // Menge anpassen: Erst alle entfernen, dann neu hinzufügen
    const template = { ...list[matchingIndices[0]] }
    const otherItems = list.filter((_, i) => !matchingIndices.includes(i))

    for (let i = 0; i < newQuantity; i++) {
      otherItems.push({ ...template })
    }

    sessionStorage.setItem('cartItemsList', JSON.stringify(otherItems))
  }

  const isActive = (path) => location.pathname.includes(path)

  const inspectionActive = sessionStorage.getItem('inspectionActive') === 'true'

  const handleRandomInspection = () => {
    if (!inspectionActive) return
    setShowInspectionVerification(true)
  }

  const handleHelp = () => {
    setShowHelpModal(true)
  }

  const handleHelpClose = () => {
    setShowHelpModal(false)
  }

  const handleInspectionVerificationYes = () => {
    setShowInspectionVerification(false)
    sessionStorage.setItem('inspectionCompleted', 'true')
    sessionStorage.removeItem('inspectionActive')
    navigate('/summary')
  }

  const handleInspectionVerificationNo = () => {
    setShowInspectionVerification(false)
    sessionStorage.setItem('inspectionCompleted', 'true')
    sessionStorage.removeItem('inspectionActive')
    navigate('/summary')
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 flex flex-col font-sans text-[#1e1e38] relative">
      {devMode && (
        <div className="fixed top-2 right-2 z-50 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          DEV MODE
        </div>
      )}
      <header className="flex justify-between items-center mb-4">
        <button
          onClick={handleRandomInspection}
          disabled={!inspectionActive}
          className={`h-16 w-48 bg-[#1E1B4B] rounded-lg flex items-center justify-center overflow-hidden shadow-md ${
            inspectionActive
              ? 'hover:opacity-90 transition-opacity cursor-pointer'
              : 'cursor-default'
          }`}
        >
          <img src={logoPrinzip} alt="Prinzip Logo" />
        </button>

        <button
          onClick={handleHelp}
          className="text-[#1E1B4B] font-extrabold text-2xl tracking-wide border-4 border-gray-300 bg-white px-10 py-3 rounded-md shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
        >
          HILFE
        </button>
      </header>

      <div className="flex w-full h-10 mb-4 text-lg font-bold">
        <button
          onClick={() => navigate('/scan')}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-10 transition-colors ${
            isActive('/scan') ? 'text-white' : 'text-[#4A4A68]'
          }`}
          style={{ clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)' }}
        >
          EINSCANNEN
        </button>
        <button
          onClick={() => {
            const fromPayment = location.pathname === '/payment'
            navigate('/summary', { state: { fromPayment } })
          }}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-20 -ml-[2%] transition-colors ${
            isActive('/summary') ? 'text-white' : 'text-[#4A4A68]'
          }`}
          style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' }}
        >
          ZUSAMMENFASSUNG
        </button>

        <button
          onClick={() => navigate('/payment')}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-30 -ml-[2%] transition-colors ${
            isActive('/payment') ? 'text-white' : 'text-[#4A4A68]'
          }`}
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)' }}
        >
          ZAHLUNG
        </button>
      </div>

      <main className="flex-1 grid gap-6" style={{ gridTemplateColumns: isSummary ? '1fr 2fr' : '2fr 1fr', transition: 'grid-template-columns 300ms ease' }}>
        <section
          className={`bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col relative overflow-hidden shadow-sm ${
            isSummary ? 'order-1' : 'order-1'
          }`}
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <Outlet />
          </div>

          <RandomInspectionVerificationModal
            isOpen={showInspectionVerification}
            onYes={handleInspectionVerificationYes}
            onNo={handleInspectionVerificationNo}
          />

          <HelpModal isOpen={showHelpModal} onClose={handleHelpClose} />
        </section>

        <aside
          className={`bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col shadow-sm overflow-hidden ${
            isSummary ? 'order-2' : 'order-2'
          }`}
        >
          <Sidebar
            items={cartItems}
            customerCard={customerCard}
            editable={isSummary}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </aside>
      </main>
    </div>
  )
}
