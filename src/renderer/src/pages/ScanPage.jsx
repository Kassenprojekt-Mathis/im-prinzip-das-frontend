import { useScan } from '../hooks/useScan'
import CategoryGrid from '../components/CategoryGrid'
import ProductGrid from '../components/ProductGrid'
import ScannerIcon from '../assets/Icons/Scanner.png'
import BarcodeIcon from '../assets/Icons/Barcode.png'
import WarningIcon from '../assets/Icons/Warning.png'

export default function ScanPage() {
  const {
    barcodeRef,
    barcodeInput,
    setBarcodeInput,
    scanStatus,
    ageControlActive,
    pendingAgeProduct,
    kategorien,
    aktiveProdukteList,
    activeCategory,
    setActiveCategory,
    counts,
    hasItems,
    devMode,
    focusBarcodeInput,
    handleBarcodeScan,
    increase,
    decrease,
    resetLast,
    handleNavigateToSummary
  } = useScan()

  return (
    <div className="flex flex-col h-full">
      <input
        ref={barcodeRef}
        autoFocus
        type="text"
        value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
        onBlur={() => setTimeout(focusBarcodeInput, 50)}
        placeholder="Barcode eingeben..."
        disabled={ageControlActive}
        className={
          devMode
            ? 'mb-2 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1B4B] disabled:opacity-50 disabled:cursor-not-allowed'
            : 'absolute opacity-0 pointer-events-none'
        }
      />

      {devMode && (
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleBarcodeScan}
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
          {scanStatus && (
            <div
              className={`p-2 rounded-lg text-sm ${
                scanStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {scanStatus.message}
            </div>
          )}
        </div>
      )}

      {ageControlActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src={WarningIcon} alt="Warnung" className="w-32 h-32 object-contain" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Altersprüfung erforderlich</h2>
            {pendingAgeProduct && (
              <p className="text-xl text-gray-700 mb-2">
                <strong>{pendingAgeProduct.name}</strong>
              </p>
            )}
            <p className="text-lg text-gray-700 mb-4">
              Ein Mitarbeiter muss Ihren gescannten Artikel kontrollieren.
            </p>
          </div>
        </div>
      ) : (
        <>
          <CategoryGrid
            kategorien={kategorien}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
          />

          {activeCategory === null ? (
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
            <ProductGrid
              aktiveProdukteList={aktiveProdukteList}
              counts={counts}
              onIncrease={increase}
              onDecrease={decrease}
            />
          )}

          {hasItems && (
            <div className="flex justify-between mt-6 gap-4">
              <button
                onClick={resetLast}
                className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: '#E1E1F2' }}
              >
                Letzten Artikel löschen
              </button>
              <button
                onClick={handleNavigateToSummary}
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
