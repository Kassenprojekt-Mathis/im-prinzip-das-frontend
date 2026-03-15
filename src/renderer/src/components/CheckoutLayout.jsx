import { Outlet } from 'react-router-dom'

import logoPrinzip from '../assets/Prinzip_Logo.png'

import Sidebar from './Sidebar'

const sampleCartData = {
  items: [
    { name: 'Bio-Kekse', price: 2.99 },
    {
      name: 'Milch',
      price: 1.19,
      discount: { label: '-30% Mindesthaltbarkeitsrabatt', amount: 0.36 }
    },
    { name: 'Kiwi', price: 0.50 }
  ],
  customerAccount: '1234',
  total: 4.32,
  savings: 0.36
}

export default function CheckoutLayout() {
  return (
    // Hintergrund der gesamten Kassen-App
    <div className="min-h-screen bg-[#F0F4F8] p-3 md:p-4 lg:p-6 flex flex-col font-sans text-[#1e1e38]">
      {/* ================= HEADER ================= */}
      <header className="flex justify-between items-center mb-2 md:mb-4">
        {/* Logo */}
        <div className="h-16 w-48 bg-[#1E1B4B] rounded-lg flex items-center justify-center overflow-hidden shadow-md">
          <img src={logoPrinzip} alt="Prinzip Logo" />
        </div>

        {/* Hilfe Button */}
        <button className="text-[#1E1B4B] font-extrabold text-base md:text-xl lg:text-2xl tracking-wide border-4 border-gray-300 bg-white px-4 md:px-8 lg:px-10 py-2 md:py-3 rounded-md shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
          HILFE
        </button>
      </header>

      {/* ================= STEPPER ================= */}
      <div className="flex w-full h-8 md:h-10 mb-2 md:mb-4 text-xs md:text-sm lg:text-lg font-bold text-[#4A4A68]">
        {/* Schritt 1: Einscannen  */}
        <div
          className="flex-1 bg-[#D9DADD] flex items-center justify-center relative z-10"
          style={{ clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)' }}
        >
          EINSCANNEN
        </div>
        {/* Schritt 2: Zusammenfassung  */}
        <div
          className="flex-1 bg-[#D9DADD] flex items-center justify-center relative z-20 -ml-[2%]"
          style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' }}
        >
          ZUSAMMENFASSUNG
        </div>

        {/* Schritt 3: Zahlung */}
        <div
          className="flex-1 bg-[#D9DADD] flex items-center justify-center relative z-30 -ml-[2%]"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)' }}
        >
          ZAHLUNG
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <main className="flex-1 grid grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {/* Linke Box: Dynamischer Inhalt (Pages) */}
        <section className="col-span-2 bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col relative overflow-hidden shadow-sm">
          {/* HIER RENDERT DER REACT ROUTER DIE JEWEILIGEN PAGES (ScanPage, PaymentPage etc.) */}
          <div className="p-4 flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </section>

        {/* Rechte Box: Statische Sidebar - Warenkorb & Summe */}
        <aside className="col-span-1 bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col shadow-sm overflow-hidden">
          <Sidebar
            items={sampleCartData.items}
            customerAccount={sampleCartData.customerAccount}
            total={sampleCartData.total}
            savings={sampleCartData.savings}
          />
        </aside>
      </main>
    </div>
  )
}
