import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { printerApi } from '../api/printerAPI'
import { productApi } from '../api/productAPI'
import { receiptApi } from '../api/receiptAPI'

export function usePayment() {
  const navigate = useNavigate()
  const location = useLocation()
  const devMode = useDevMode()

  const scannedItems = useMemo(
    () => location.state?.items || JSON.parse(sessionStorage.getItem('cartItems') || '[]'),
    [location.state]
  )

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

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [items]
  )

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
      setPrintStatus({ type: 'success', message: 'Bon wurde erfolgreich gedruckt!' })
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

  const handlePayment = async (method) => {
    setPaymentMethod(method)
    try {
      const stockItems = items.map((item) => ({
        id: item.id || null,
        barcode: item.barcode || null,
        quantity: item.quantity || 1
      }))
      if (stockItems.length > 0) await productApi.reduceStock(stockItems)
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Lagerbestands:', err)
    }
    try {
      const kundeId = parseInt(sessionStorage.getItem('customerCard'), 10) || null
      await receiptApi.createReceipt({ kundeId, gesamtbetrag: total, zahlungsmethode: method })
    } catch (err) {
      console.error('Fehler beim Erstellen des Belegs:', err)
    }
    setPaymentComplete(true)
  }

  const handlePrinterChange = async (e) => {
    const name = e.target.value
    setCurrentPrinter(name)
    try {
      await printerApi.setPrinter(name)
    } catch (err) {
      setPrintStatus({ type: 'error', message: `Fehler: ${err.message}` })
    }
  }

  const handleNextPurchase = () => {
    sessionStorage.clear()
    navigate('/scan')
  }

  return {
    items,
    total,
    paymentComplete,
    paymentMethod,
    isPrinting,
    printStatus,
    printers,
    currentPrinter,
    devMode,
    ecoScore,
    handlePayment,
    handlePrinterChange,
    handleNextPurchase,
    printReceipt
  }
}
