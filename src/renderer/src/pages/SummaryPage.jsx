import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import CustomerCardModal from '../components/CustomerCardModal'
import QuestionmarkIcon from '../assets/Icons/Questionmark.png'
import HandsIcon from '../assets/Icons/Hands.png'
import WarningIcon from '../assets/Icons/Warning.png'
import apfel from '../../../../resources/apfel.png'
import karotte from '../../../../resources/karotte.png'
import croissant from '../../../../resources/croissant.png'
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

  const categories = [
    { name: 'Obst', img: apfel },
    { name: 'Gemüse', img: karotte },
    { name: 'Backwaren', img: croissant }
  ]
  const handleContinueToPayment = () => {
    if (!inspectionCompleted && !inspectionSelected) {
      if (Math.random() < 0.8) {
        setInspectionSelected(true)
        sessionStorage.setItem('inspectionActive', 'true')
        return
      }
    }
    navigate('/payment')
  }
  const handleCustomerCardYes = () => {
    sessionStorage.setItem('customerCardAsked', 'true')
    setShowCustomerCard(false)
    navigate('/scan')
  }
  const handleCustomerCardNo = () => {
    sessionStorage.setItem('customerCardAsked', 'true')
    setShowCustomerCard(false)
  }
  return (
    <div className="relative flex flex-col h-full">
      {/* Kategorien */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() =>
              !inspectionSelected && navigate('/scan', { state: { category: cat.name } })
            }
            disabled={inspectionSelected}
            className={`h-28 rounded-xl flex flex-col items-center justify-center text-xl font-bold border-4 transition ${
              inspectionSelected
                ? 'bg-[#D9DADD] text-[#4A4A68] border-[#C9CAD1] opacity-50 cursor-not-allowed'
                : 'bg-[#D9DADD] text-[#4A4A68] border-[#C9CAD1] hover:bg-[#cfd0d4]'
            }`}
          >
            <img src={cat.img} className="h-10 mb-2 object-contain" />
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mt-6 gap-4">
          {inspectionCompleted ? (
            <>
              <div className="flex justify-center mb-3">
                <img src={HandsIcon} alt="Hände" className="w-40 h-40 object-contain" />
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-3">Kontrolle vorbei!</h2>
              <p className="text-xl text-gray-700">Sie können nun zur Zahlung fortfahren.</p>
            </>
          ) : inspectionSelected ? (
            <>
              <div className="flex justify-center mb-3">
                <img src={WarningIcon} alt="Warnung" className="w-32 h-32 object-contain" />
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-3">
                Sie wurden für eine Zufallskontrolle ausgewählt
              </h2>
              <p className="text-xl text-gray-700">
                Ein Mitarbeiter ist auf dem Weg, um Ihren Einkauf zu überprüfen. <br />
                Bitte warten Sie einen Moment.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-3">
                <img src={QuestionmarkIcon} alt="Frage" className="w-32 h-32 object-contain" />
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-3">Alles eingescannt?</h2>
              <p className="text-xl text-gray-700">Es kann eine Zufallskontrolle stattfinden!</p>
            </>
          )}
        </div>
      </div>

      {(!inspectionSelected || inspectionCompleted) && (
        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={handleContinueToPayment}
            className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#948BB8' }}
          >
            WEITER →
          </button>
        </div>
      )}
      <CustomerCardModal
        isOpen={showCustomerCard}
        onYes={handleCustomerCardYes}
        onNo={handleCustomerCardNo}
      />
    </div>
  )
}
