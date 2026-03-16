import { Outlet } from 'react-router-dom'
import logoPrinzip from '../assets/Prinzip_Logo.png'

export default function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 flex flex-col font-sans text-[#1e1e38]">
      <header className="flex justify-between items-center mb-4">
        <div className="h-16 w-48 bg-[#1E1B4B] rounded-lg flex items-center justify-center overflow-hidden shadow-md">
          <img src={logoPrinzip} alt="Prinzip Logo" />
        </div>

        <button className="text-[#1E1B4B] font-extrabold text-2xl tracking-wide border-4 border-gray-300 bg-white px-10 py-3 rounded-md shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
          HILFE
        </button>
      </header>

      <div className="flex w-full h-10 mb-4 text-lg font-bold text-[#4A4A68]">
        <div
          className="flex-1 bg-[#D9DADD] flex items-center justify-center relative z-10"
          style={{ clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%)' }}
        >
          EINSCANNEN
        </div>
        <div
          className="flex-1 bg-[#D9DADD] flex items-center justify-center relative z-20 -ml-[2%]"
          style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' }}
        >
          ZAHLUNG
        </div>

        <div
          className="flex-1 bg-[#D9DADD] flex items-center justify-center relative z-30 -ml-[2%]"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)' }}
        >
          ZUSAMMENFASSUNG
        </div>
      </div>

      <main className="flex-1 grid grid-cols-3 gap-6">
        <section className="col-span-2 bg-white border-[6px] border-[#D9DADD] rounded-xl flex flex-col relative overflow-hidden shadow-sm">
          <div className="p-4 flex-1 overflow-y-auto">
            <Outlet />
          </div>
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
