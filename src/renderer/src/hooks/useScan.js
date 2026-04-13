import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { scannerApi } from '../api/scannerAPI'
import { categoryApi } from '../api/categoryAPI'
import { productApi } from '../api/productAPI'
import { kundeApi } from '../api/kundeAPI'
import {
  findLastIndex,
  getScannedItems,
  buildBarcodeCartItem,
  buildManualCartItem,
  buildPendingAgeProduct,
  readAgeControlActive,
  readPendingAgeProductFromStorage,
  readCartItemsListFromStorage,
  isPendingCustomerCard,
  readVerifiedAge,
  setCustomerData,
  clearPendingCustomerCard,
  setPendingAgeControl,
  syncCartToStorage
} from '../models/scanModel'
import { readModalOpen } from '../models/checkoutModel'

export function useScan() {
  const navigate = useNavigate()
  const devMode = useDevMode()

  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanStatus, setScanStatus] = useState(null)
  const [ageControlActive, setAgeControlActive] = useState(readAgeControlActive)
  const [pendingAgeProduct, setPendingAgeProduct] = useState(readPendingAgeProductFromStorage)
  const [cartItemsList, setCartItemsList] = useState(readCartItemsListFromStorage)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [kategorien, setKategorien] = useState([])
  const [aktiveProdukteList, setAktiveProdukteList] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)

  const counts = cartItemsList.reduce((acc, item) => {
    if (item.type === 'manual') {
      acc[item.id] = (acc[item.id] || 0) + 1
    }
    return acc
  }, {})

  const hasItems = cartItemsList.length > 0

  // focusBarcodeInput wird vom View-Layer als Callback verwendet (DOM-Concern)
  // Wir exponieren es damit der View nach Alterskontrolle refokussieren kann
  const [focusRequested, setFocusRequested] = useState(0)

  const requestFocus = useCallback(() => {
    setFocusRequested((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const anzeigeKategorien = ['Obst', 'Gemüse', 'Backwaren']
    categoryApi
      .getAllCategories()
      .then((alle) => alle.filter((k) => anzeigeKategorien.includes(k.bezeichnung)))
      .then(setKategorien)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!activeCategory) return
    productApi
      .getProductsByCategory(activeCategory.id)
      .then(setAktiveProdukteList)
      .catch(console.error)
  }, [activeCategory])

  useEffect(() => {
    const allItems = getScannedItems(cartItemsList)
    syncCartToStorage(allItems, cartItemsList)
    window.dispatchEvent(new Event('cartUpdated'))
  }, [cartItemsList])

  useEffect(() => {
    const handleAgeControlUpdate = () => {
      const isStillActive = readAgeControlActive()
      setAgeControlActive(isStillActive)
      setPendingAgeProduct(readPendingAgeProductFromStorage())

      if (isStillActive) {
        window.api?.tapo?.setBlue() // Lampe blau: Kunde wartet auf Alterskontrolle
      } else {
        window.api?.tapo?.setColor('white') // Lampe zurück auf weiß nach Alterskontrolle
        requestFocus()
      }

      const cartStored = sessionStorage.getItem('cartItemsList')
      if (cartStored) {
        setCartItemsList(JSON.parse(cartStored))
      }
    }

    window.addEventListener('ageControlStatusChanged', handleAgeControlUpdate)
    return () => window.removeEventListener('ageControlStatusChanged', handleAgeControlUpdate)
  }, [requestFocus])

  const handleBarcodeScan = async (barcode) => {
    if (!barcode.trim()) return
    const trimmed = barcode.trim()
    setScanStatus(null)

    if (isPendingCustomerCard()) {
      try {
        const kunde = await kundeApi.getKundeById(trimmed)
        setCustomerData(kunde)
        window.dispatchEvent(new Event('cartUpdated'))
        setScanStatus({
          type: 'success',
          message: `Kundenkarte ${kunde.vorname} ${kunde.name} erfasst (${kunde.ecopunkte} Ecopunkte)`
        })
        window.api?.tapo?.flashGreen()
      } catch {
        clearPendingCustomerCard()
        setScanStatus({ type: 'error', message: `Kundenkarte nicht gefunden (ID: ${trimmed})` })
        window.api?.tapo?.flashRed()
      }
      return
    }

    try {
      const product = await scannerApi.sendBarcode(trimmed)
      const verifiedAge = readVerifiedAge()
      if (
        product.mindestalter &&
        product.mindestalter >= 16 &&
        product.mindestalter > verifiedAge
      ) {
        const pending = buildPendingAgeProduct(trimmed, product)
        setAgeControlActive(true)
        setPendingAgeProduct(pending)
        setPendingAgeControl(pending)
        setScanStatus({
          type: 'warning',
          message: `Alterskontrolle für ${product.name} erforderlich`
        })
        return
      }

      const item = buildBarcodeCartItem(trimmed, product)
      setCartItemsList((prev) => [...prev, item])
      setScanStatus({ type: 'success', message: `${item.name} hinzugefuegt` })
      window.api?.tapo?.flashGreen()
    } catch {
      setScanStatus({ type: 'error', message: `Unbekannt (${trimmed}) – Hilfe angefordert` })
      window.api?.tapo?.flashRed('blue')
      setHelpModalOpen(true)
    }
  }

  const increase = (id) => {
    const product = aktiveProdukteList.find((p) => p.id === id)
    if (!product) return

    const verifiedAge = readVerifiedAge()
    if (product.mindestalter && product.mindestalter >= 16) {
      if (product.mindestalter > verifiedAge) {
        setAgeControlActive(true)
        setPendingAgeProduct(product)
        setPendingAgeControl(product)
        return
      }
    }

    const item = buildManualCartItem(product)
    setCartItemsList((prev) => [...prev, item])
  }

  const decrease = (id) => {
    setCartItemsList((prev) => {
      const lastIndex = findLastIndex(prev, (item) => item.type === 'manual' && item.id === id)
      if (lastIndex === -1) return prev
      return [...prev.slice(0, lastIndex), ...prev.slice(lastIndex + 1)]
    })
  }

  const resetLast = () => {
    if (cartItemsList.length === 0) return
    setCartItemsList((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)))
  }

  const handleNavigateToSummary = () => {
    const items = getScannedItems(cartItemsList)
    sessionStorage.setItem('cartItems', JSON.stringify(items))
    navigate('/summary')
  }

  return {
    devMode,
    barcodeInput,
    setBarcodeInput,
    scanStatus,
    ageControlActive,
    pendingAgeProduct,
    cartItemsList,
    helpModalOpen,
    setHelpModalOpen,
    kategorien,
    aktiveProdukteList,
    activeCategory,
    setActiveCategory,
    counts,
    hasItems,
    focusRequested,
    isModalOpen: readModalOpen(),
    handleBarcodeScan,
    increase,
    decrease,
    resetLast,
    handleNavigateToSummary
  }
}
