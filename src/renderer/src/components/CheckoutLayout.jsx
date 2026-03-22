import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import logoPrinzip from '../assets/Prinzip_Logo.png'
import RandomInspectionVerificationModal from './RandomInspectionModal'
import HelpModal from './HelpModal'

import Sidebar from './Sidebar'

const sampleCartData = {
  items: [
    { name: 'Bio-Kekse', price: 2.99 },
    {
      name: 'Milch',
      price: 1.19,
      discount: { label: '-30% Mindesthaltbarkeitsrabatt', amount: 0.36 }
    },
    { name: 'Kiwi', price: 0.5 }
  ],
  customerAccount: '1234',
  total: 4.32,
  savings: 0.36
}

export default function CheckoutLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [showInspectionVerification, setShowInspectionVerification] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  const isActive = (path) => location.pathname.includes(path)

  const handleRandomInspection = () => {
    setShowInspectionVerification(true)
  }

  const handleHelp = () => {
    setShowHelpModal(true)
  }

  const handleHelpClose = () => {
    setShowHelpModal(false)
  }

  const handleInspectionVerificationYes = () => {
    setShowInspectionVerification(false)
    sessionStorage.setItem('inspectionCompleted', 'true')
    navigate('/summary')
  }

  const handleInspectionVerificationNo = () => {
    setShowInspectionVerification(false)
    sessionStorage.setItem('inspectionCompleted', 'true')
    navigate('/summary')
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 flex flex-col font-sans text-[#1e1e38]">
      <header className="flex justify-between items-center mb-4">
        <button
          onClick={handleRandomInspection}
          className="h-16 w-48 bg-[#1E1B4B] rounded-lg flex items-center justify-center overflow-hidden shadow-md hover:opacity-90 transition-opacity cursor-pointer"
        >
          <img src={logoPrinzip} alt="Prinzip Logo" />
        </button>

        <button
          onClick={handleHelp}
          className="text-[#1E1B4B] font-extrabold text-2xl tracking-wide border-4 border-gray-300 bg-white px-10 py-3 rounded-md shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
        >
          HILFE
        </button>
      </header>

      <div className="flex w-full h-10 mb-4 text-lg font-bold">
        <button
          onClick={() => navigate('/scan')}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-10 transition-colors ${
            isActive('/scan') ? 'text-white' : 'text-[#4A4A68]'
          }`}
          style={{ clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)' }}
        >
          EINSCANNEN
        </button>
        <button
          onClick={() => {
            const fromPayment = location.pathname === '/payment'
            navigate('/summary', { state: { fromPayment } })
          }}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-20 -ml-[2%] transition-colors ${
            isActive('/summary') ? 'text-white' : 'text-[#4A4A68]'
          }`}
          style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' }}
        >
          ZUSAMMENFASSUNG
        </button>

        <button
          onClick={() => navigate('/payment')}
          className={`flex-1 bg-[#D9DADD] flex items-center justify-center relative z-30 -ml-[2%] transition-colors ${
            isActive('/payment') ? 'text-white' : 'text-[#4A4A68]'
          }`}
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)' }}
        >
          ZAHLUNG
        </button>
      </div>

      <main className="flex-1 grid grid-cols-3 gap-6">
        <section className="col-span-2 bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col relative overflow-hidden shadow-sm">
          <div className="p-4 flex-1 overflow-y-auto">
            <Outlet />
          </div>

          <RandomInspectionVerificationModal
            isOpen={showInspectionVerification}
            onYes={handleInspectionVerificationYes}
            onNo={handleInspectionVerificationNo}
          />

          <HelpModal isOpen={showHelpModal} onClose={handleHelpClose} />
        </section>

        <aside className="col-span-1 bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col shadow-sm overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto"></div>

          <div className="bg-[#EBECEF] border-t-[6px] border-[#D9DADD] p-6 flex justify-between items-end h-32">
            <span className="text-2xl font-black tracking-tight">SUMME:</span>
            <span className="text-3xl font-bold"> €</span>
          </div>
        </aside>
      </main>
    </div>
  )
}
