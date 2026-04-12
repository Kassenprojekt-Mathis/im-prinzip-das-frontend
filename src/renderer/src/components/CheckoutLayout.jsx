import { useState, useEffect, useCallback } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { useLogin } from '../hooks/useLogin'
import logoPrinzip from '../assets/Prinzip_Logo.png'
import RandomInspectionVerificationModal from './RandomInspectionModal'
import InspectionFailedModal from './InspectionFailedModal'
import AgeVerificationModal from './AgeVerificationModal'
import Login from './Login'
import EmployeeMenuModal from './EmployeeMenuModal'
import HelpModal from './HelpModal'
import Sidebar from './Sidebar'

export default function CheckoutLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const devMode = useDevMode()
  const loginAuth = useLogin()

  const [showInspectionVerification, setShowInspectionVerification] = useState(false)
  const [showInspectionFailed, setShowInspectionFailed] = useState(false)
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showEmployeeMenu, setShowEmployeeMenu] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [customerCard, setCustomerCard] = useState(sessionStorage.getItem('customerCard') || '')

  const isSummary = location.pathname.includes('/summary')

  const inspectionActive = sessionStorage.getItem('inspectionActive') === 'true'
  const ageControlActive = sessionStorage.getItem('ageControlActive') === 'true'

  const loadCart = useCallback(() => {
    const stored = sessionStorage.getItem('cartItems')
    setCartItems(stored ? JSON.parse(stored) : [])
    setCustomerCard(sessionStorage.getItem('customerCard') || '')
  }, [])

  useEffect(() => {
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    window.addEventListener('inspectionStatusChanged', loadCart)
    return () => {
      window.removeEventListener('cartUpdated', loadCart)
      window.removeEventListener('inspectionStatusChanged', loadCart)
    }
  }, [loadCart])

  const handleUpdateQuantity = (key, newQuantity) => {
    const stored = sessionStorage.getItem('cartItems')
    const allItems = stored ? JSON.parse(stored) : []

    const firstIndex = allItems.findIndex((item) => (item.barcode || item.name) === key)
    if (firstIndex === -1) return

    const template = { ...allItems[firstIndex], quantity: 1 }

    const newItems = []
    for (let i = 0; i < newQuantity; i++) {
      newItems.push({ ...template })
    }

    // Items vor dem ersten Match (die nicht matchen) + neue Items + Items nach dem ersten Match (die nicht matchen)
    const before = allItems.slice(0, firstIndex)
    const after = allItems.slice(firstIndex).filter((item) => (item.barcode || item.name) !== key)

    const updatedCart = [...before, ...newItems, ...after]
    sessionStorage.setItem('cartItems', JSON.stringify(updatedCart))

    updateCartItemsList(key, newQuantity)

    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemoveItem = (key) => {
    const stored = sessionStorage.getItem('cartItems')
    const allItems = stored ? JSON.parse(stored) : []

    const updatedCart = allItems.filter((item) => (item.barcode || item.name) !== key)
    sessionStorage.setItem('cartItems', JSON.stringify(updatedCart))

    updateCartItemsList(key, 0)

    window.dispatchEvent(new Event('cartUpdated'))
  }

  const updateCartItemsList = (key, newQuantity) => {
    const stored = sessionStorage.getItem('cartItemsList')
    if (!stored) return

    const list = JSON.parse(stored)

    const firstIndex = list.findIndex((item) => (item.barcode || item.name) === key)
    if (firstIndex === -1) return

    if (newQuantity === 0) {
      const updated = list.filter((item) => (item.barcode || item.name) !== key)
      sessionStorage.setItem('cartItemsList', JSON.stringify(updated))
      return
    }

    const template = { ...list[firstIndex] }

    const newItems = []
    for (let i = 0; i < newQuantity; i++) {
      newItems.push({ ...template })
    }

    // Reihenfolge beibehalten: Items vor dem ersten Match + neue Items + Items nach dem ersten Match (ohne Matches)
    const before = list.slice(0, firstIndex)
    const after = list.slice(firstIndex).filter((item) => (item.barcode || item.name) !== key)

    sessionStorage.setItem('cartItemsList', JSON.stringify([...before, ...newItems, ...after]))
  }

  const isActive = (path) => location.pathname.includes(path)

  const handleLogoClick = () => {
    sessionStorage.setItem('modalOpen', 'true')
    setShowLogin(true)
  }

  const handleLoginSuccess = () => {
    setShowLogin(false)
    sessionStorage.removeItem('modalOpen')
    setShowEmployeeMenu(true)
  }

  const handleLoginCancel = () => {
    setShowLogin(false)
    sessionStorage.removeItem('modalOpen')
  }

  const handleEmployeeMenuClose = () => {
    setShowEmployeeMenu(false)
  }

  const handleInspectionClick = () => {
    setShowEmployeeMenu(false)

    if (ageControlActive) {
      setShowAgeVerification(true)
    } else if (inspectionActive) {
      setShowInspectionVerification(true)
    } else {
      alert('Aktuell keine Kontrolle')
    }
  }

  const handleProductsClick = () => {
    setShowEmployeeMenu(false)
    sessionStorage.setItem('employeeAuthorized', 'true')
    navigate('/products')
  }

  const handleResetClick = () => {
    if (window.confirm('Einkauf wirklich zurücksetzen?')) {
      setShowEmployeeMenu(false)
      sessionStorage.clear()
      window.dispatchEvent(new Event('cartUpdated'))
      navigate('/scan')
    }
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
    window.dispatchEvent(new Event('inspectionStatusChanged'))
    navigate('/summary')
  }

  const handleInspectionVerificationNo = () => {
    setShowInspectionVerification(false)
    window.api?.tapo?.flashRed()
    setShowInspectionFailed(true)
  }

  const handleInspectionAnpassen = () => {
    setShowInspectionFailed(false)
    sessionStorage.removeItem('inspectionActive')
    sessionStorage.setItem('inspectionCompleted', 'true')
    window.dispatchEvent(new Event('inspectionStatusChanged'))
    navigate('/scan')
  }

  const handleInspectionBeenden = () => {
    setShowInspectionFailed(false)
    window.api?.printer?.printReceipt(cartItems)
    sessionStorage.clear()
    window.dispatchEvent(new Event('inspectionStatusChanged'))
    navigate('/scan')
  }

  const handleAgeVerified = () => {
    setShowAgeVerification(false)
    const pendingProduct = JSON.parse(sessionStorage.getItem('pendingAgeProduct') || '{}')

    const stored = sessionStorage.getItem('cartItemsList')
    if (stored && pendingProduct.id) {
      const cartList = JSON.parse(stored)
      cartList.push({
        type: 'manual',
        id: pendingProduct.id,
        name: pendingProduct.name,
        price: 0,
        mindestalter: pendingProduct.mindestalter
      })
      sessionStorage.setItem('cartItemsList', JSON.stringify(cartList))
    }

    sessionStorage.removeItem('ageControlActive')
    sessionStorage.removeItem('pendingAgeProduct')
    sessionStorage.setItem('ageControlCompleted', 'true')
    window.dispatchEvent(new Event('ageControlStatusChanged'))
    window.api?.tapo?.flashGreen()
  }

  const handleAgeRejected = () => {
    setShowAgeVerification(false)

    sessionStorage.removeItem('ageControlActive')
    sessionStorage.removeItem('pendingAgeProduct')
    window.dispatchEvent(new Event('ageControlStatusChanged'))
    window.api?.tapo?.flashRed()
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
          onClick={handleLogoClick}
          className="h-16 w-48 bg-[#1E1B4B] rounded-lg flex items-center justify-center overflow-hidden shadow-md hover:opacity-90 transition-opacity"
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
          onClick={() => !inspectionActive && !ageControlActive && navigate('/scan')}
          disabled={inspectionActive || ageControlActive}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-10 transition-colors ${
            isActive('/scan') ? 'text-white' : 'text-[#4A4A68]'
          } ${inspectionActive || ageControlActive ? 'opacity-50' : ''}`}
          style={{ clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)' }}
        >
          EINSCANNEN
        </button>
        <button
          onClick={() => {
            if (inspectionActive || ageControlActive) return
            const fromPayment = location.pathname === '/payment'
            navigate('/summary', { state: { fromPayment } })
          }}
          disabled={inspectionActive || ageControlActive}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-20 -ml-[2%] transition-colors ${
            isActive('/summary') ? 'text-white' : 'text-[#4A4A68]'
          } ${inspectionActive || ageControlActive ? 'opacity-50' : ''}`}
          style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' }}
        >
          ZUSAMMENFASSUNG
        </button>

        <button
          onClick={() => !inspectionActive && !ageControlActive && navigate('/payment')}
          disabled={inspectionActive || ageControlActive}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-30 -ml-[2%] transition-colors  ${
            isActive('/payment') ? 'text-white' : 'text-[#4A4A68]'
          } ${inspectionActive || ageControlActive ? 'opacity-50' : ''}`}
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)' }}
        >
          ZAHLUNG
        </button>
      </div>

      <main
        className="flex-1 grid gap-6"
        style={{
          gridTemplateColumns: isSummary ? '3fr 2fr' : '2fr 1fr',
          transition: 'grid-template-columns 300ms ease'
        }}
      >
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

          <AgeVerificationModal
            isOpen={showAgeVerification}
            onYes={handleAgeVerified}
            onNo={handleAgeRejected}
          />

          <InspectionFailedModal
            isOpen={showInspectionFailed}
            onAnpassen={handleInspectionAnpassen}
            onBeenden={handleInspectionBeenden}
          />

          <Login
            isOpen={showLogin}
            selectedUsername={loginAuth.selectedUsername}
            setSelectedUsername={loginAuth.setSelectedUsername}
            password={loginAuth.password}
            setPassword={loginAuth.setPassword}
            employeeList={loginAuth.employeeList}
            isLoading={loginAuth.isLoading}
            error={loginAuth.error}
            onLoadEmployees={loginAuth.loadEmployees}
            onAuth={() => loginAuth.login(handleLoginSuccess)}
            onCancel={() => loginAuth.cancelLogin(handleLoginCancel)}
          />

          <EmployeeMenuModal
            isOpen={showEmployeeMenu}
            onInspectionClick={handleInspectionClick}
            onProductsClick={handleProductsClick}
            onResetClick={handleResetClick}
            onClose={handleEmployeeMenuClose}
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
