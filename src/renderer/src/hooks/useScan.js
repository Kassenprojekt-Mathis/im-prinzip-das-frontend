import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { scannerApi } from '../api/scannerAPI'
import { categoryApi } from '../api/categoryAPI'
import { productApi } from '../api/productAPI'

const ANZEIGE_KATEGORIEN = ['Obst', 'Gemüse', 'Backwaren']

function findLastIndex(arr, predicate) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i
  }
  return -1
}

function buildCartItem(product) {
  return {
    type: 'manual',
    id: product.id,
    name: product.name,
    price: product.preis || 0,
    discount: product.rabatt || null,
    mindestalter: product.mindestalter || null
  }
}

function toSidebarItem(item) {
  if (item.type === 'manual') {
    return { name: item.name, id: item.id, price: item.price || 0, discount: item.discount || null, quantity: 1 }
  }
  return { barcode: item.barcode, name: item.name, price: item.price || 0, discount: item.discount || null, quantity: 1 }
}

export function useScan() {
  const navigate = useNavigate()
  const devMode = useDevMode()
  const barcodeRef = useRef(null)

  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanStatus, setScanStatus] = useState(null)

  const [ageControlActive, setAgeControlActive] = useState(
    sessionStorage.getItem('ageControlActive') === 'true'
  )
  const [pendingAgeProduct, setPendingAgeProduct] = useState(() => {
    const stored = sessionStorage.getItem('pendingAgeProduct')
    return stored ? JSON.parse(stored) : null
  })

  const [cartItemsList, setCartItemsList] = useState(() => {
    const stored = sessionStorage.getItem('cartItemsList')
    return stored ? JSON.parse(stored) : []
  })

  const [kategorien, setKategorien] = useState([])
  const [aktiveProdukteList, setAktiveProdukteList] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)

  // Counts für die Produkt-Grid-Anzeige
  const counts = useMemo(
    () =>
      cartItemsList.reduce((acc, item) => {
        if (item.type === 'manual') acc[item.id] = (acc[item.id] || 0) + 1
        return acc
      }, {}),
    [cartItemsList]
  )

  const scannedItems = useMemo(() => cartItemsList.map(toSidebarItem), [cartItemsList])
  const hasItems = cartItemsList.length > 0

  // Fokus auf Barcode-Input, solange kein Modal offen ist
  const focusBarcodeInput = useCallback(() => {
    const modalOpen = sessionStorage.getItem('modalOpen') === 'true'
    if (barcodeRef.current && !modalOpen) barcodeRef.current.focus()
  }, [])

  useEffect(() => {
    focusBarcodeInput()
    const timer = setTimeout(focusBarcodeInput, 100)
    return () => clearTimeout(timer)
  }, [focusBarcodeInput])

  // Kategorien laden (gefiltert auf Anzeige-Kategorien)
  useEffect(() => {
    categoryApi
      .getAllCategories()
      .then((alle) => alle.filter((k) => ANZEIGE_KATEGORIEN.includes(k.bezeichnung)))
      .then(setKategorien)
      .catch(console.error)
  }, [])

  // Produkte nach aktiver Kategorie laden
  useEffect(() => {
    if (!activeCategory) return
    let cancelled = false
    productApi
      .getProductsByCategory(activeCategory.id)
      .then((data) => { if (!cancelled) setAktiveProdukteList(data) })
      .catch(console.error)
    return () => { cancelled = true }
  }, [activeCategory])

  // SessionStorage + Sidebar-Event bei jeder Warenkorb-Änderung
  useEffect(() => {
    sessionStorage.setItem('cartItems', JSON.stringify(scannedItems))
    sessionStorage.setItem('cartItemsList', JSON.stringify(cartItemsList))
    window.dispatchEvent(new Event('cartUpdated'))
  }, [cartItemsList, scannedItems])

  // Alterskontrolle-Event vom CheckoutLayout
  useEffect(() => {
    const handleAgeControlUpdate = () => {
      setAgeControlActive(sessionStorage.getItem('ageControlActive') === 'true')
      const stored = sessionStorage.getItem('pendingAgeProduct')
      setPendingAgeProduct(stored ? JSON.parse(stored) : null)
      const cartStored = sessionStorage.getItem('cartItemsList')
      if (cartStored) setCartItemsList(JSON.parse(cartStored))
    }
    window.addEventListener('ageControlStatusChanged', handleAgeControlUpdate)
    return () => window.removeEventListener('ageControlStatusChanged', handleAgeControlUpdate)
  }, [])

  const handleBarcodeScan = useCallback(async () => {
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
      setScanStatus({ type: 'success', message: `${item.name} hinzugefuegt` })
      window.api?.tapo?.flashGreen()
    } catch {
      const item = { type: 'barcode', barcode, name: `Unbekannt (${barcode})`, price: 0 }
      setCartItemsList((prev) => [...prev, item])
      setScanStatus({ type: 'error', message: `Unbekannt (${barcode}) hinzugefuegt` })
      window.api?.tapo?.flashRed()
    }
    setBarcodeInput('')
  }, [barcodeInput])

  const increase = useCallback(
    (id) => {
      const product = aktiveProdukteList.find((p) => p.id === id)
      if (!product) return

      const ageControlCompleted = sessionStorage.getItem('ageControlCompleted') === 'true'
      if (product.mindestalter && product.mindestalter >= 16) {
        if (!ageControlCompleted) {
          setAgeControlActive(true)
          setPendingAgeProduct(product)
          sessionStorage.setItem('ageControlActive', 'true')
          sessionStorage.setItem('pendingAgeProduct', JSON.stringify(product))
          return
        }
      }

      setCartItemsList((prev) => [...prev, buildCartItem(product)])
    },
    [aktiveProdukteList]
  )

  const decrease = useCallback((id) => {
    setCartItemsList((prev) => {
      const lastIndex = findLastIndex(prev, (item) => item.type === 'manual' && item.id === id)
      if (lastIndex === -1) return prev
      return [...prev.slice(0, lastIndex), ...prev.slice(lastIndex + 1)]
    })
  }, [])

  const resetLast = useCallback(() => {
    if (cartItemsList.length === 0) return
    setCartItemsList((prev) => prev.slice(0, -1))
  }, [cartItemsList.length])

  const handleNavigateToSummary = useCallback(() => {
    sessionStorage.setItem('cartItems', JSON.stringify(scannedItems))
    navigate('/summary')
  }, [scannedItems, navigate])

  return {
    // Refs
    barcodeRef,
    // State
    barcodeInput,
    setBarcodeInput,
    scanStatus,
    ageControlActive,
    pendingAgeProduct,
    kategorien,
    aktiveProdukteList,
    activeCategory,
    setActiveCategory,
    counts,
    hasItems,
    devMode,
    focusBarcodeInput,
    // Handler
    handleBarcodeScan,
    increase,
    decrease,
    resetLast,
    handleNavigateToSummary
  }
}
