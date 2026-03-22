import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CardIcon from '../assets/Icons/Card.png'
import CashIcon from '../assets/Icons/Cash.png'
import PersonIcon from '../assets/Icons/Person.png'

export default function PaymentPage() {
  const navigate = useNavigate()
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [ecoScore] = useState(() => Math.floor(Math.random() * 100) + 1)
  const handleCardPayment = () => {
    setPaymentComplete(true)
  }
  const handleCashPayment = () => {
    setPaymentComplete(true)
  }
  const handleNextPurchase = () => {
    sessionStorage.clear()
    navigate('/scan')
  }
  if (paymentComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold mb-6">ZAHLUNG GENEHMIGT</h1>
          <p className="text-2xl text-gray-800">Danke für den Einkauf.</p>
          <p className="text-2xl text-gray-800 mb-4">Auf Wiedersehen!</p>
          <div className="flex justify-center mb-8">
            <img src={PersonIcon} alt="Person" className="w-32 h-32 object-contain" />
          </div>
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <p className="text-xl text-gray-700 mb-2">Ihr neuer EcoScore:</p>
            <p className="text-5xl font-bold" style={{ color: '#948BB8' }}>
              {ecoScore}
            </p>
          </div>
          <button
            onClick={handleNextPurchase}
            className="px-12 py-4 text-white text-xl font-semibold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#948BB8' }}
          >
            Nächster Einkauf
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="grid grid-cols-2 gap-8 max-w-3xl w-full">
        <button
          onClick={handleCardPayment}
          className="flex flex-col items-center justify-center p-12 rounded-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#D9DADD' }}
        >
          <div className="mb-4">
            <img src={CardIcon} alt="Kartenzahlung" className="w-32 h-32 object-contain" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Kartenzahlung</span>
        </button>
        <button
          onClick={handleCashPayment}
          className="flex flex-col items-center justify-center p-12 rounded-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: '#D9DADD' }}
        >
          <div className="mb-4">
            <img src={CashIcon} alt="Barzahlung" className="w-32 h-32 object-contain" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Barzahlung</span>
        </button>
      </div>
    </div>
  )
}
