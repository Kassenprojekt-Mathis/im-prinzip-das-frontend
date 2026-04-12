import { useRef, useEffect, useCallback } from 'react'
import HelpModal from '../components/HelpModal'
import { useScan } from '../hooks/useScan'
import apfel from '../../../../resources/apfel.png'
import karotte from '../../../../resources/karotte.png'
import croissant from '../../../../resources/croissant.png'
import ScannerIcon from '../assets/Icons/Scanner.png'
import BarcodeIcon from '../assets/Icons/Barcode.png'
import WarningIcon from '../assets/Icons/Warning.png'

const categoryImages = {
  Obst: apfel,
  Gemüse: karotte,
  Backwaren: croissant
}

export default function ScanPage() {
  const vm = useScan()
  const barcodeRef = useRef(null)

  const focusBarcodeInput = useCallback(() => {
    if (barcodeRef.current && !vm.isModalOpen) {
      barcodeRef.current.focus()
    }
  }, [vm.isModalOpen])

  useEffect(() => {
    focusBarcodeInput()
    const timer = setTimeout(focusBarcodeInput, 100)
    return () => clearTimeout(timer)
  }, [focusBarcodeInput])

  // Fokus nach Alterskontrolle-Abschluss (vom ViewModel angefordert)
  useEffect(() => {
    if (vm.focusRequested > 0) {
      setTimeout(focusBarcodeInput, 200)
    }
  }, [vm.focusRequested, focusBarcodeInput])

  const handleScan = () => {
    vm.handleBarcodeScan(vm.barcodeInput)
    vm.setBarcodeInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <HelpModal isOpen={vm.helpModalOpen} onClose={() => vm.setHelpModalOpen(false)} />

      {/* Barcode Input - deaktiviert während Alterskontrolle */}
      <input
        ref={barcodeRef}
        autoFocus
        type="text"
        value={vm.barcodeInput}
        onChange={(e) => vm.setBarcodeInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleScan()
        }}
        onBlur={() => setTimeout(focusBarcodeInput, 50)}
        placeholder="Barcode eingeben..."
        disabled={vm.ageControlActive}
        className={
          vm.devMode
            ? 'mb-2 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B4B] disabled:opacity-50 disabled:cursor-not-allowed'
            : 'absolute opacity-0 pointer-events-none'
        }
      />

      {vm.devMode && (
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleScan}
              className="px-6 py-2 text-sm font-bold bg-[#1E1B4B] text-white rounded-lg hover:bg-[#2d2a5e] active:scale-95 transition-transform"
            >
              Scannen
            </button>
            <button
              onClick={() => window.api?.tapo?.flashGreen()}
              className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-transform"
            >
              🟢 Lampe
            </button>
            <button
              onClick={() => window.api?.tapo?.flashRed()}
              className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-transform"
            >
              🔴 Lampe
            </button>
          </div>
          {vm.scanStatus && (
            <div
              className={`p-2 rounded-lg text-sm ${
                vm.scanStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {vm.scanStatus.message}
            </div>
          )}
        </div>
      )}

      {vm.ageControlActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src={WarningIcon} alt="Warnung" className="w-32 h-32 object-contain" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Altersprüfung erforderlich</h2>
            {vm.pendingAgeProduct && (
              <p className="text-xl text-gray-700 mb-2">
                <strong>{vm.pendingAgeProduct.name}</strong>
              </p>
            )}
            <p className="text-lg text-gray-700 mb-4">
              Ein Mitarbeiter muss Ihren gescannten Artikel kontrollieren.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {vm.kategorien.map((kat) => (
              <button
                key={kat.id}
                onClick={() => vm.setActiveCategory(kat)}
                className={`h-28 rounded-xl flex flex-col items-center justify-center text-xl font-bold border-4 transition
                  ${
                    vm.activeCategory?.id === kat.id
                      ? 'bg-[#7C83FD] text-white border-[#6C72E8]'
                      : 'bg-[#D9DADD] text-[#4A4A68] border-[#C9CAD1] hover:bg-[#cfd0d4]'
                  }
                `}
              >
                {categoryImages[kat.bezeichnung] && (
                  <img src={categoryImages[kat.bezeichnung]} className="h-10 mb-2 object-contain" />
                )}
                {kat.bezeichnung.toUpperCase()}
              </button>
            ))}
          </div>

          {vm.activeCategory === null ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="flex justify-center items-end gap-12 mb-8">
                <img src={BarcodeIcon} alt="Barcode" className="w-24 h-24 object-contain" />
                <img
                  src={ScannerIcon}
                  alt="Scanner"
                  className="w-40 h-40 object-contain"
                  style={{ transform: 'rotate(-25deg) translateY(-20px)' }}
                />
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-3 text-gray-800">Herzlich Willkommen!</h1>
                <p className="text-xl text-gray-700">
                  Bitte scannen Sie Ihre Artikel aus dem Warenkorb ein.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 flex-1">
              {vm.aktiveProdukteList.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#E9EAF1] rounded-xl p-4 flex flex-col items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4 text-xl font-bold">
                    <button
                      onClick={() => vm.decrease(item.id)}
                      className="px-3 py-1 bg-white rounded shadow active:scale-95"
                    >
                      -
                    </button>
                    <span>{vm.counts[item.id] || 0}</span>
                    <button
                      onClick={() => vm.increase(item.id)}
                      className="px-3 py-1 bg-white rounded shadow active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-lg font-bold mt-2">{item.name}</span>
                  <span className="text-sm text-gray-600">{(item.preis || 0).toFixed(2)} €</span>
                </div>
              ))}
            </div>
          )}

          {vm.hasItems && !vm.ageControlActive && (
            <div className="flex justify-between mt-6 gap-4">
              <button
                onClick={vm.resetLast}
                className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#E1E1F2' }}
              >
                Letzten Artikel löschen
              </button>
              <button
                onClick={vm.handleNavigateToSummary}
                className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#948BB8' }}
              >
                Weiter zur Zusammenfassung →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
