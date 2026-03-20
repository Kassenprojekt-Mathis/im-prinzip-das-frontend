import ScannerIcon from '../assets/Icons/Scanner.png'
import BarcodeIcon from '../assets/Icons/Barcode.png'
export default function ScanPageHome() {
  return (
    <div className="relative flex flex-col h-full">
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
    </div>
  )
}
