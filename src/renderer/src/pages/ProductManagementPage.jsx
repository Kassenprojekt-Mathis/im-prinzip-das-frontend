import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productApi } from '../api/productAPI'
import { categoryApi } from '../api/categoryAPI'

const INITIAL_MANUAL_INPUT = {
  name: '',
  preis: '',
  mwst_satz: '',
  lagerbestand: '',
  kategorie_id: '',
  rabatt: '0',
  mindestalter: '0',
  bild: ''
}

export default function ProductManagementPage() {
  const navigate = useNavigate()
  const barcodeRef = useRef(null)

  const [barcodeInput, setBarcodeInput] = useState('')
  const [manualInput, setManualInput] = useState(INITIAL_MANUAL_INPUT)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('scan')
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchProduct, setSearchProduct] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const showMessage = (type, text, duration = 3000) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), duration)
  }

  const resetManualInput = () => {
    setManualInput(INITIAL_MANUAL_INPUT)
  }

  const loadProducts = async () => {
    try {
      const data = await productApi.getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error)
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAllCategories()
        setCategories(data)
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error)
      }
    }
    fetchCategories()
    loadProducts()
  }, [])

  useEffect(() => {
    if (activeTab === 'scan' && !editingProduct && barcodeRef.current) {
      barcodeRef.current.focus()
    }
  }, [activeTab, editingProduct])

  const handleBarcodeScan = async () => {
    if (!barcodeInput.trim()) return
    const barcode = barcodeInput.trim()

    try {
      await productApi.createProduct({ barcode })
      await loadProducts()
      showMessage('success', `Produkt ${barcode} hinzugefügt`)
      setBarcodeInput('')
    } catch (error) {
      showMessage('error', error.message || 'Fehler beim Hinzufügen')
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (
      !manualInput.name ||
      !manualInput.preis ||
      !manualInput.mwst_satz ||
      !manualInput.lagerbestand ||
      !manualInput.kategorie_id
    ) {
      showMessage('error', 'Bitte alle Pflichtfelder ausfüllen')
      return
    }

    const produktDaten = {
      name: manualInput.name,
      preis: parseFloat(manualInput.preis),
      mwst_satz: parseFloat(manualInput.mwst_satz),
      lagerbestand: parseInt(manualInput.lagerbestand),
      kategorie_id: parseInt(manualInput.kategorie_id),
      rabatt: parseFloat(manualInput.rabatt || '0'),
      mindestalter: parseInt(manualInput.mindestalter || '0'),
      bild: manualInput.bild || null
    }

    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, produktDaten)
      } else {
        await productApi.createProduct(produktDaten)
      }
      await loadProducts()
      showMessage('success', editingProduct ? 'Produkt aktualisiert' : 'Produkt hinzugefügt')
      setEditingProduct(null)
      resetManualInput()
    } catch (error) {
      showMessage('error', error.message || 'Fehler')
    }
  }

  const handleDelete = async (produktId) => {
    if (!window.confirm('Möchten Sie dieses Produkt wirklich löschen?')) return

    try {
      await productApi.deleteProduct(produktId)
      await loadProducts()
      showMessage('success', 'Produkt gelöscht')
    } catch (error) {
      showMessage('error', error.message || 'Fehler beim Löschen')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setManualInput({
      name: product.name,
      preis: product.preis.toString(),
      mwst_satz: product.mwst_satz.toString(),
      lagerbestand: product.lagerbestand.toString(),
      kategorie_id: product.kategorie_id.toString(),
      rabatt: product.rabatt.toString(),
      mindestalter: product.mindestalter.toString(),
      bild: product.bild || ''
    })
    setActiveTab('manual')
  }

  const handleToggleAktiv = async (product) => {
    try {
      await productApi.toggleProductActive(product.id, !product.aktiv)
      await loadProducts()
      showMessage('success', product.aktiv ? 'Produkt deaktiviert' : 'Produkt aktiviert')
    } catch (error) {
      showMessage('error', error.message || 'Fehler beim Aktualisieren')
    }
  }

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
        (filterCategory === '' || p.kategorie_id.toString() === filterCategory)
    )
    .sort((a, b) => b.id - a.id)

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Produktverwaltung</h1>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="px-6 py-2 bg-[#E1E1F2] text-gray-700 font-semibold rounded hover:bg-[#D1D1E2]"
        >
          ← Zurück zur Kasse
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 2-Spalten Layout */}
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-12rem)]">
        {/* LINKE SPALTE: Produktliste */}
        <div className="flex flex-col bg-white rounded-lg border-2 border-gray-300 p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Aktuelle Produkte ({products.length})
          </h2>

          {/* Suchfeld und Kategorie-Filter */}
          <div className="mb-3 space-y-2">
            <input
              type="text"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              placeholder="Produkt suchen..."
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.bezeichnung}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchProduct ? 'Keine Produkte gefunden' : 'Keine Produkte vorhanden'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-2 rounded border border-gray-200 ${
                      product.aktiv ? 'bg-gray-50' : 'bg-red-50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {product.bild && (
                        <img
                          src={product.bild}
                          alt={product.name}
                          className="w-full h-20 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      )}
                      <div>
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {product.name} {!product.aktiv && '(Inaktiv)'}
                        </p>
                        <p className="text-xs text-gray-600">
                          Kategorie:{' '}
                          {categories.find((c) => c.id === product.kategorie_id)?.bezeichnung ||
                            `ID: ${product.kategorie_id}`}
                        </p>
                        <p className="text-xs text-gray-600">Lager: {product.lagerbestand}</p>
                        <p className="text-sm font-bold text-gray-800">
                          {product.preis?.toFixed(2)} €
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="py-1 bg-[#948BB8] text-white text-xs rounded hover:opacity-90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleAktiv(product)}
                          className={`py-1 text-white text-xs rounded hover:opacity-90 ${
                            product.aktiv ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                        >
                          {product.aktiv ? 'Aktiv' : 'Deaktiviert'}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECHTE SPALTE: Produkt hinzufügen/bearbeiten */}
        <div className="flex flex-col bg-white rounded-lg border-2 border-gray-300 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-800">
              {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </h2>
            {editingProduct && (
              <button
                onClick={() => {
                  setEditingProduct(null)
                  resetManualInput()
                }}
                className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Abbrechen
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Tab-Navigation nur wenn nicht im Edit-Modus */}
            {!editingProduct && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('scan')}
                  className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${
                    activeTab === 'scan' ? 'bg-[#948BB8] text-white' : 'bg-[#E1E1F2] text-gray-700'
                  }`}
                >
                  Barcode scannen
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${
                    activeTab === 'manual'
                      ? 'bg-[#948BB8] text-white'
                      : 'bg-[#E1E1F2] text-gray-700'
                  }`}
                >
                  Manuell
                </button>
              </div>
            )}

            {/* Scan-Tab */}
            {activeTab === 'scan' && !editingProduct && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode</label>
                <div className="flex gap-2">
                  <input
                    ref={barcodeRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
                    placeholder="Barcode scannen..."
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                  />
                  <button
                    onClick={handleBarcodeScan}
                    className="px-4 py-2 bg-[#948BB8] text-white font-semibold rounded hover:opacity-90"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Manual-Tab */}
            {(activeTab === 'manual' || editingProduct) && (
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={manualInput.name}
                      onChange={(e) => setManualInput({ ...manualInput, name: e.target.value })}
                      placeholder="Bio-Apfel"
                      required
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Preis (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualInput.preis}
                      onChange={(e) => setManualInput({ ...manualInput, preis: e.target.value })}
                      placeholder="1.99"
                      required
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      MwSt (%) *
                    </label>
                    <select
                      value={manualInput.mwst_satz}
                      onChange={(e) =>
                        setManualInput({ ...manualInput, mwst_satz: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                    >
                      <option value="">-- Auswählen --</option>
                      <option value="7">7%</option>
                      <option value="19">19%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Lagerbestand *
                    </label>
                    <input
                      type="number"
                      value={manualInput.lagerbestand}
                      onChange={(e) =>
                        setManualInput({ ...manualInput, lagerbestand: e.target.value })
                      }
                      placeholder="100"
                      required
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategorie *
                  </label>
                  <select
                    value={manualInput.kategorie_id}
                    onChange={(e) =>
                      setManualInput({ ...manualInput, kategorie_id: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                  >
                    <option value="">-- Auswählen --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.bezeichnung}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Rabatt (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualInput.rabatt}
                      onChange={(e) => setManualInput({ ...manualInput, rabatt: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mindestalter
                    </label>
                    <input
                      type="number"
                      value={manualInput.mindestalter}
                      onChange={(e) =>
                        setManualInput({ ...manualInput, mindestalter: e.target.value })
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Produktbild-URL
                  </label>
                  <input
                    type="url"
                    value={manualInput.bild}
                    onChange={(e) => setManualInput({ ...manualInput, bild: e.target.value })}
                    placeholder="https://example.com/bild.jpg"
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                  />
                  {manualInput.bild && (
                    <div className="mt-2">
                      <img
                        src={manualInput.bild}
                        alt="Vorschau"
                        className="w-20 h-20 object-cover rounded border-2 border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-[#948BB8] text-white font-semibold rounded hover:opacity-90"
                >
                  {editingProduct ? 'Aktualisieren' : 'Hinzufügen'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
