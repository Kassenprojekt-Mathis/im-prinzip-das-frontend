// ViewModel für CheckoutLayout
import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { useLogin } from './useLogin'
import {
  readCartFromStorage,
  readCustomerFromStorage,
  readAppliedVoucher,
  readPendingAgeProduct,
  readInspectionActive,
  readAgeControlActiveFromStorage,
  setModalOpen,
  clearModalOpen,
  setEmployeeAuthorized,
  markInspectionComplete,
  updateCartInStorage,
  updateCartListInStorage,
  appendToCartList,
  updateVerifiedAge
} from '../models/checkoutModel'
import { calcMaxBirthDate } from '../models/scanModel'

export function useCheckoutLayout() {
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
  const [customerCard, setCustomerCard] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(readAppliedVoucher)

  const isSummary = location.pathname.includes('/summary')
  const inspectionActive = readInspectionActive()
  const ageControlActive = readAgeControlActiveFromStorage()
  const isActive = (path) => location.pathname.includes(path)

  const loadCart = useCallback(() => {
    setCartItems(readCartFromStorage())
    const { customerCard: card, customerName: name } = readCustomerFromStorage()
    setCustomerCard(card)
    setCustomerName(name)
    setAppliedVoucher(readAppliedVoucher())
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    window.addEventListener('inspectionStatusChanged', loadCart)
    return () => {
      window.removeEventListener('cartUpdated', loadCart)
      window.removeEventListener('inspectionStatusChanged', loadCart)
    }
  }, [loadCart])

  const handleUpdateQuantity = (key, newQuantity) => {
    updateCartInStorage(key, newQuantity)
    updateCartListInStorage(key, newQuantity)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemoveItem = (key) => {
    updateCartInStorage(key, 0)
    updateCartListInStorage(key, 0)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleLogoClick = () => {
    setModalOpen()
    setShowLogin(true)
  }

  const handleLoginSuccess = () => {
    setShowLogin(false)
    clearModalOpen()
    setShowEmployeeMenu(true)
    window.api?.tapo?.setWhite() // Lampe weiß für Mitarbeiter, Mitarbeitermenü geöffnet
  }

  const handleLoginCancel = () => {
    setShowLogin(false)
    clearModalOpen()
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
    setEmployeeAuthorized()
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

  const handleInspectionVerificationYes = () => {
    setShowInspectionVerification(false)
    markInspectionComplete()
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
    markInspectionComplete()
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
    const product = readPendingAgeProduct()
    if (product.id) {
      appendToCartList(product)
    }
    updateVerifiedAge(product.mindestalter)
    sessionStorage.removeItem('ageControlActive')
    sessionStorage.removeItem('pendingAgeProduct')
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

  const handleNavigateTo = (path) => {
    if (!inspectionActive && !ageControlActive) navigate(path)
  }

  const handleNavigateToSummary = () => {
    if (inspectionActive || ageControlActive) return
    navigate('/summary', { state: { fromPayment: location.pathname === '/payment' } })
  }

  return {
    devMode,
    isSummary,
    inspectionActive,
    ageControlActive,
    isActive,
    cartItems,
    customerCard,
    customerName,
    appliedVoucher,
    pendingAgeProduct: readPendingAgeProduct(),
    pendingAgeProductMaxBirthDate: calcMaxBirthDate(readPendingAgeProduct().mindestalter),
    showInspectionVerification,
    showInspectionFailed,
    showAgeVerification,
    showHelpModal,
    showLogin,
    showEmployeeMenu,
    loginAuth,
    handleLogoClick,
    handleLoginSuccess,
    handleLoginCancel,
    handleEmployeeMenuClose: () => setShowEmployeeMenu(false),
    handleInspectionClick,
    handleProductsClick,
    handleResetClick,
    handleHelp: () => setShowHelpModal(true),
    handleHelpClose: () => setShowHelpModal(false),
    handleInspectionVerificationYes,
    handleInspectionVerificationNo,
    handleInspectionAnpassen,
    handleInspectionBeenden,
    handleAgeVerified,
    handleAgeRejected,
    handleUpdateQuantity,
    handleRemoveItem,
    handleNavigateTo,
    handleNavigateToSummary
  }
}
