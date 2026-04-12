// ViewModel für Gutschein
import { useState } from 'react'
import { ecoApi } from '../api/ecoApi'

export function useVoucher() {
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherStatus, setVoucherStatus] = useState(null) // { type: 'success'|'error', message }
  const [appliedVoucher, setAppliedVoucher] = useState(() => {
    const stored = sessionStorage.getItem('appliedVoucher')
    return stored ? JSON.parse(stored) : null
  })

  const discountAmount = appliedVoucher ? parseFloat(appliedVoucher.discountAmount) : 0

  const _getCartTotal = () => {
    const cartItems = JSON.parse(sessionStorage.getItem('cartItems') || '[]')
    return cartItems.reduce((sum, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1)
      const itemDiscount = (item.discount?.amount || 0) * (item.quantity || 1)
      return sum + itemTotal - itemDiscount
    }, 0)
  }

  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase()
    if (!code) return
    setVoucherStatus(null)

    try {
      const total = _getCartTotal()
      await ecoApi.validateGutschein(code, total)
      const gutschein = await ecoApi.getGutscheinByCode(code)

      const discountAmt = gutschein.ist_prozentual
        ? total * (parseFloat(gutschein.wert) / 100)
        : parseFloat(gutschein.wert)

      const voucher = {
        code: gutschein.code,
        id: gutschein.id,
        wert: gutschein.wert,
        ist_prozentual: gutschein.ist_prozentual,
        discountAmount: Math.min(discountAmt, total)
      }

      sessionStorage.setItem('appliedVoucher', JSON.stringify(voucher))
      setAppliedVoucher(voucher)
      setVoucherCode('')
      setVoucherStatus({
        type: 'success',
        message: `Gutschein eingelöst: -${voucher.discountAmount.toFixed(2).replace('.', ',')} EUR`
      })
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      setVoucherStatus({ type: 'error', message: err.message })
    }
  }

  const removeVoucher = () => {
    sessionStorage.removeItem('appliedVoucher')
    setAppliedVoucher(null)
    setVoucherStatus(null)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const einloesen = async (originalTotal) => {
    if (!appliedVoucher) return
    await ecoApi.einloesenGutschein(appliedVoucher.code, originalTotal)
  }

  const getFinalTotal = (total) => Math.max(0, total - discountAmount)

  return {
    voucherCode,
    setVoucherCode,
    voucherStatus,
    appliedVoucher,
    discountAmount,
    applyVoucher,
    removeVoucher,
    einloesen,
    getFinalTotal
  }
}
