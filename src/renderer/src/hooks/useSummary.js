// ViewModel für SummaryPage
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useVoucher } from './useVoucher'
import {
  readInspectionState,
  readCustomerCardAsked,
  shouldShowCustomerCardModal,
  setInspectionActiveInStorage,
  acceptCustomerCard,
  declineCustomerCard,
  shouldTriggerInspection
} from '../models/summaryModel'

export function useSummary() {
  const navigate = useNavigate()
  const location = useLocation()

  const fromPayment = location.state?.fromPayment || false
  const customerCardAsked = readCustomerCardAsked()
  const { inspectionCompleted, inspectionActive: storedInspectionActive } = readInspectionState()

  const [showCustomerCard, setShowCustomerCard] = useState(
    shouldShowCustomerCardModal({ fromPayment, customerCardAsked, inspectionCompleted })
  )
  const [inspectionActive, setInspectionActive] = useState(storedInspectionActive)

  const voucher = useVoucher()

  const handleContinueToPayment = () => {
    if (!inspectionCompleted && !inspectionActive) {
      if (shouldTriggerInspection()) {
        setInspectionActive(true)
        setInspectionActiveInStorage()
        window.dispatchEvent(new Event('inspectionStatusChanged'))
        return
      }
    }
    navigate('/payment')
  }

  const handleCustomerCardYes = () => {
    acceptCustomerCard()
    setShowCustomerCard(false)
    navigate('/scan')
  }

  const handleCustomerCardNo = () => {
    declineCustomerCard()
    setShowCustomerCard(false)
  }

  return {
    inspectionCompleted,
    inspectionActive,
    showCustomerCard,
    voucherCode: voucher.voucherCode,
    setVoucherCode: voucher.setVoucherCode,
    voucherStatus: voucher.voucherStatus,
    appliedVoucher: voucher.appliedVoucher,
    applyVoucher: voucher.applyVoucher,
    removeVoucher: voucher.removeVoucher,
    handleContinueToPayment,
    handleCustomerCardYes,
    handleCustomerCardNo,
    handleBackToScan: () => navigate('/scan')
  }
}
