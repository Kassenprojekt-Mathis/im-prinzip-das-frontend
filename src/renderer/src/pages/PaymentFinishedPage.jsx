import { useNavigate } from 'react-router-dom'
import questionmark from '../../../../resources/fragezeichen.png'

export default function PaymentFinishedPage() {
  const navigate = useNavigate()
  const handleBackToScan = () => {
    navigate('/scan')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Icon und Text im Zentrum */}

      <div className="flex flex-col items-center justify-center flex-1 text-center">
        <img src={questionmark} className="h-64 mb-4 object-contain" />
        <h2 className="text-3xl font-bold mb-2"> Alles eingescannt?</h2>
        <p className="text-gray-600">Es kann eine Zufallskontrolle stattfinden!</p>
      </div>

      {/* Button unten zentriert */}

      <div className="flex justify-center pb-6"></div>

      <button
        onClick={handleBackToScan}
        className="bg-[#B5B5F9] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#8f93aa]"
      >
        Zurück zum Einscannen
      </button>
    </div>
  )
}
