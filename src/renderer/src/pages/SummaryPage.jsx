import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import CustomerCardModal from '../components/CustomerCardModal'
import EmployeeAuthModal from '../components/EmployeeAuthModal'
import RandomInspectionVerificationModal from '../components/RandomInspectionModal'
import QuestionmarkIcon from '../assets/Icons/Questionmark.png'
import HandsIcon from '../assets/Icons/Hands.png'
import WarningIcon from '../assets/Icons/Warning.png'
export default function SummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPayment = location.state?.fromPayment || false
  const customerCardAsked = sessionStorage.getItem('customerCardAsked') === 'true'
  const inspectionCompleted = sessionStorage.getItem('inspectionCompleted') === 'true'
  
  const [showCustomerCard, setShowCustomerCard] = useState(
    !fromPayment && !customerCardAsked && !inspectionCompleted
  )
  const [inspectionSelected, setInspectionSelected] = useState(false)
  const [showEmployeeAuth, setShowEmployeeAuth] = useState(false)
  const [showInspectionVerification, setShowInspectionVerification] = useState(false)
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState(null)
  const handleContinueToPayment = () => {
    // Prüfen, ob Zufallskontrolle ausgelöst werden soll
    if (!inspectionCompleted && !inspectionSelected) {
      if (Math.random() < 0.8) {
        setInspectionSelected(true)
        sessionStorage.setItem('inspectionActive', 'true')
        // Mitarbeiter-Authentifizierung öffnen
        setShowEmployeeAuth(true)
        return
      }
    }
    navigate('/payment')
  }

  const handleEmployeeAuthSuccess = (employeeData) => {
    setAuthenticatedEmployee(employeeData)
    setShowEmployeeAuth(false)
    // Nach erfolgreicher Anmeldung → Kontrolle starten
    setShowInspectionVerification(true)
  }

  const handleEmployeeAuthCancel = () => {
    setShowEmployeeAuth(false)
    setInspectionSelected(false)
    sessionStorage.removeItem('inspectionActive')
  }

  const handleInspectionYes = () => {
    setShowInspectionVerification(false)
    sessionStorage.setItem('inspectionCompleted', 'true')
    sessionStorage.removeItem('inspectionActive')
    // Einkauf wurde überprüft und ist korrekt
    navigate('/payment')
  }

  const handleInspectionNo = () => {
    setShowInspectionVerification(false)
    sessionStorage.setItem('inspectionCompleted', 'true')
    sessionStorage.removeItem('inspectionActive')
    // Einkauf wurde überprüft, aber es gibt Probleme
    // Zurück zum Scannen, damit Kunde Artikel hinzufügen/entfernen kann
    navigate('/scan')
  }
  const handleCustomerCardYes = () => {
    sessionStorage.setItem('customerCardAsked', 'true')
    sessionStorage.setItem('pendingCustomerCard', 'true')
    setShowCustomerCard(false)
    navigate('/scan')
  }
  const handleCustomerCardNo = () => {
    sessionStorage.setItem('customerCardAsked', 'true')
    setShowCustomerCard(false)
  }
  return (
    <div className="relative flex flex-col h-full items-center justify-center">
      <div className="p-6">
        <div className="text-center mb-4">
          {showInspectionVerification ? (
            <>
              <div className="flex justify-center mb-3">
                <img src={HandsIcon} alt="Hände" className="w-40 h-40 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Mitarbeiter: {authenticatedEmployee?.userName}
              </h2>
              <p className="text-sm text-gray-600">führt die Kontrolle durch...</p>
            </>
          ) : inspectionCompleted ? (
            <>
              <div className="flex justify-center mb-3">
                <img src={HandsIcon} alt="Hände" className="w-40 h-40 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Kontrolle vorbei!</h2>
              <p className="text-sm text-gray-600">Sie können nun zur Zahlung fortfahren.</p>
            </>
          ) : inspectionSelected ? (
            <>
              <div className="flex justify-center mb-3">
                <img src={WarningIcon} alt="Warnung" className="w-32 h-32 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Sie wurden für eine Zufallskontrolle ausgewählt
              </h2>
              <p className="text-sm text-gray-600">
                Ein Mitarbeiter ist auf dem Weg, um Ihren Einkauf zu überprüfen. <br />
                Bitte warten Sie einen Moment.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-3">
                <img src={QuestionmarkIcon} alt="Frage" className="w-32 h-32 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Alles eingescannt?</h2>
              <p className="text-sm text-gray-600">Es kann eine Zufallskontrolle stattfinden!</p>
            </>
          )}
        </div>
        {(!inspectionSelected || inspectionCompleted) && (
          <div className="flex gap-4 justify-center">
            {!inspectionCompleted && (
              <button
                onClick={() => navigate('/scan')}
                className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#E1E1F2' }}
              >
                Zurück zum Einscannen
              </button>
            )}
            <button
              onClick={handleContinueToPayment}
              className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: '#948BB8' }}
            >
              Weiter zur Zahlung
            </button>
          </div>
        )}
      </div>
      <CustomerCardModal
        isOpen={showCustomerCard}
        onYes={handleCustomerCardYes}
        onNo={handleCustomerCardNo}
      />
      
      <EmployeeAuthModal
        isOpen={showEmployeeAuth}
        onSuccess={handleEmployeeAuthSuccess}
        onCancel={handleEmployeeAuthCancel}
      />

      <RandomInspectionVerificationModal
        isOpen={showInspectionVerification}
        onYes={handleInspectionYes}
        onNo={handleInspectionNo}
      />
    </div>
  )
}
