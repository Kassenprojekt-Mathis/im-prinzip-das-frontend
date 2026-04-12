// ViewModel für PaymentPage
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDevMode } from '../context/DevModeContext'
import { useVoucher } from './useVoucher'
import { printerApi } from '../api/printerAPI'
import { receiptApi } from '../api/receiptAPI'
import { ecoApi } from '../api/ecoAPI'
import {
  groupCartItems,
  calculateTotal,
  mapItemsToApiFormat,
  getCustomerId
} from '../models/paymentModel'

export function usePaymentViewModel() {
  const navigate = useNavigate()
  const location = useLocation()
  const devMode = useDevMode()
  const { getFinalTotal, einloesen, appliedVoucher } = useVoucher()

  const scannedItems = useMemo(
    () => location.state?.items || JSON.parse(sessionStorage.getItem('cartItems') || '[]'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const items = useMemo(() => groupCartItems(scannedItems), [scannedItems])
  const total = useMemo(() => calculateTotal(items), [items])
  const finalTotal = getFinalTotal(total)

  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [ecoScore, setEcoScore] = useState(null)
  const [ecoVoucher, setEcoVoucher] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const ecoVoucherRef = useRef(null)
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
        subtotal: total,
        total: finalTotal,
        paymentMethod,
        footer: 'Vielen Dank fuer Ihren Einkauf!',
        voucher: ecoVoucherRef.current || null,
        appliedCoupon: appliedVoucher || null
      })
      setPrintStatus({ type: 'success', message: 'Bon wurde erfolgreich gedruckt! 🖨️' })
    } catch (err) {
      setPrintStatus({ type: 'error', message: `Druckfehler: ${err.message}` })
    } finally {
      setIsPrinting(false)
    }
  }

  const redeemAppliedVoucher = async () => {
    try {
      await einloesen(total)
    } catch (err) {
      console.error('Fehler beim Einlösen des Gutscheins:', err)
    }
  }

  const createReceipt = async (method, kundeId) => {
    try {
      await receiptApi.createReceipt({
        produkte: mapItemsToApiFormat(items),
        gegebenesgeld: finalTotal,
        zahlungsmethode: method,
        kundeId
      })
    } catch (err) {
      console.error('Fehler beim Erstellen des Belegs:', err)
      setPaymentError(err.message || 'Beleg konnte nicht erstellt werden')
    }
  }

  const checkEcoPoints = async (kundeId) => {
    if (!kundeId) return
    try {
      const punkte = await ecoApi.getEcopunkte(kundeId)
      setEcoScore(punkte)
      if (punkte > 0 && punkte % 5 === 0) {
        const gutschein = await ecoApi.createGutschein()
        ecoVoucherRef.current = gutschein
        setEcoVoucher(gutschein)
      }
    } catch (err) {
      console.error('Fehler beim Ecopunkte-Check:', err)
    }
  }

  const processPayment = async (method) => {
    setPaymentError(null)
    const kundeId = getCustomerId()
    await redeemAppliedVoucher()
    await createReceipt(method, kundeId)
    await checkEcoPoints(kundeId)
  }

  useEffect(() => {
    if (paymentComplete && !devMode && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true
      printReceipt()
    }
  }, [paymentComplete, devMode])

  const handlePrinterChange = async (e) => {
    const name = e.target.value
    setCurrentPrinter(name)
    try {
      await printerApi.setPrinter(name)
    } catch (err) {
      setPrintStatus({ type: 'error', message: `Fehler: ${err.message}` })
    }
  }

  const handlePayment = async (method) => {
    setPaymentMethod(method)
    await processPayment(method)
    setPaymentComplete(true)
  }

  const handleNextPurchase = () => {
    sessionStorage.clear()
    navigate('/scan')
  }

  return {
    devMode,
    paymentComplete,
    paymentMethod,
    ecoScore,
    ecoVoucher,
    paymentError,
    isPrinting,
    printStatus,
    printers,
    currentPrinter,
    handlePayment,
    handleNextPurchase,
    handlePrinterChange,
    printReceipt
  }
}
