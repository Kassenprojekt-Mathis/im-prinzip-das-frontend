// Model für SummaryPage — reine Datenzugriffs- und Berechnungslogik, kein React

export function readInspectionState() {
  return {
    inspectionCompleted: sessionStorage.getItem('inspectionCompleted') === 'true',
    inspectionActive: sessionStorage.getItem('inspectionActive') === 'true'
  }
}

export function readCustomerCardAsked() {
  return sessionStorage.getItem('customerCardAsked') === 'true'
}

export function shouldShowCustomerCardModal({ fromPayment, customerCardAsked, inspectionCompleted }) {
  return !fromPayment && !customerCardAsked && !inspectionCompleted
}

export function setInspectionActiveInStorage() {
  sessionStorage.setItem('inspectionActive', 'true')
}

export function acceptCustomerCard() {
  sessionStorage.setItem('customerCardAsked', 'true')
  sessionStorage.setItem('pendingCustomerCard', 'true')
}

export function declineCustomerCard() {
  sessionStorage.setItem('customerCardAsked', 'true')
}

export function shouldTriggerInspection() {
  return Math.random() < 0.5
}
