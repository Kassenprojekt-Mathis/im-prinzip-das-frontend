import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apfel from '../../../../resources/apfel.png'
import karotte from '../../../../resources/karotte.png'
import croissant from '../../../../resources/croissant.png'
import ScannerIcon from '../assets/Icons/Scanner.png'
import BarcodeIcon from '../assets/Icons/Barcode.png'

export default function ScanPage() {
  const navigate = useNavigate()

  const categories = [
    { name: 'Obst', img: apfel },
    { name: 'Gemüse', img: karotte },
    { name: 'Backwaren', img: croissant }
  ]

  //MockDaten zum Testen

  const products = {
    Obst: [
      { id: 1, name: 'Apfel' },
      { id: 2, name: 'Banane' },
      { id: 3, name: 'Kiwi' },
      { id: 4, name: 'Traube' },
      { id: 5, name: 'Pfirsich' },
      { id: 6, name: 'Kirsche' }
    ],
    Gemüse: [
      { id: 7, name: 'Karotte' },
      { id: 8, name: 'Brokkoli' },
      { id: 9, name: 'Tomate' }
    ],
    Backwaren: [
      { id: 10, name: 'Croissant' },
      { id: 11, name: 'Brötchen' },
      { id: 12, name: 'Baguette' }
    ]
  }

  const [activeCategory, setActiveCategory] = useState(null)

  const [counts, setCounts] = useState({})

  const increase = (id) => {
    setCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }))
  }

  const decrease = (id) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0)
    }))
  }

  const resetLast = () => {
    const keys = Object.keys(counts)
    const last = keys[keys.length - 1]

    if (!last) return

    setCounts((prev) => ({
      ...prev,
      [last]: Math.max(prev[last] - 1, 0)
    }))
  }

  // Scanned items für die nächsten Pages zusammenbauen
  const getScannedItems = () => {
    const items = []
    for (const category of Object.values(products)) {
      for (const product of category) {
        const count = counts[product.id] || 0
        if (count > 0) {
          items.push({ ...product, quantity: count, price: 0 })
        }
      }
    }
    return items
  }

  const hasItems = Object.values(counts).some((c) => c > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Kategorien */}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`h-28 rounded-xl flex flex-col items-center justify-center text-xl font-bold border-4 transition
              ${
                activeCategory === cat.name
                  ? 'bg-[#7C83FD] text-white border-[#6C72E8]' //true
                  : 'bg-[#D9DADD] text-[#4A4A68] border-[#C9CAD1] hover:bg-[#cfd0d4]' //false
              }
            `}
          >
            <img src={cat.img} className="h-10 mb-2 object-contain" />
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>

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
        <>
          {/* Produkte --> überarbeiten sobald Backend Anbindung steht*/}

          <div className="grid grid-cols-3 gap-6 flex-1">
            {products[activeCategory].map((item) => (
              <div
                key={item.id}
                className="bg-[#E9EAF1] rounded-xl p-4 flex flex-col items-center justify-between shadow-sm"
              >
                {/* Counter */}

                <div className="flex items-center gap-4 text-xl font-bold">
                  <button
                    onClick={() => decrease(item.id)}
                    className="px-3 py-1 bg-white rounded shadow active:scale-95"
                  >
                    -
                  </button>

                  <span>{counts[item.id] || 0}</span>

                  <button
                    onClick={() => increase(item.id)}
                    className="px-3 py-1 bg-white rounded shadow active:scale-95"
                  >
                    +
                  </button>
                </div>

                {/* Name */}

                <span className="text-lg font-bold mt-2"> {item.name} </span>
              </div>
            ))}
          </div>

          {/* Buttons */}

          <div className="flex justify-between mt-6 gap-4">
            <button
              onClick={resetLast}
              className="bg-[#A9ACC3] text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-[#8f93aa]"
            >
              letzten gescannten Artikel löschen
            </button>
            <button
              onClick={() => navigate('/payment', { state: { items: getScannedItems() } })}
              disabled={!hasItems}
              className="px-8 py-3 text-lg font-bold bg-[#1E1B4B] text-white rounded-lg hover:bg-[#2d2a5e] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              WEITER ZUR ZAHLUNG →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
