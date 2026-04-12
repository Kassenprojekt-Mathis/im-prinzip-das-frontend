import { useRef, useEffect } from 'react'
import { useProductManagementViewModel } from '../hooks/useProductManagement'

export default function ProductManagementPage() {
  const vm = useProductManagementViewModel()
  const barcodeRef = useRef(null)

  useEffect(() => {
    if (vm.activeTab === 'scan' && !vm.editingProduct && barcodeRef.current) {
      barcodeRef.current.focus()
    }
  }, [vm.activeTab, vm.editingProduct])

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Produktverwaltung</h1>
        </div>
        <button
          onClick={vm.handleBack}
          className="px-6 py-2 bg-[#E1E1F2] text-gray-700 font-semibold rounded hover:bg-[#D1D1E2]"
        >
          ← Zurück zur Kasse
        </button>
      </div>

      {vm.message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            vm.message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {vm.message.text}
        </div>
      )}

      {/* 2-Spalten Layout */}
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-12rem)]">
        {/* LINKE SPALTE: Produktliste */}
        <div className="flex flex-col bg-white rounded-lg border-2 border-gray-300 p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Aktuelle Produkte ({vm.products.length})
          </h2>

          {/* Suchfeld und Kategorie-Filter */}
          <div className="mb-3 space-y-2">
            <input
              type="text"
              value={vm.searchProduct}
              onChange={(e) => vm.setSearchProduct(e.target.value)}
              placeholder="Produkt suchen..."
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
            />
            <select
              value={vm.filterCategory}
              onChange={(e) => vm.setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
            >
              <option value="">Alle Kategorien</option>
              {vm.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.bezeichnung}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {vm.filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {vm.searchProduct ? 'Keine Produkte gefunden' : 'Keine Produkte vorhanden'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {vm.filteredProducts.map((product) => (
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
                          {vm.categories.find((c) => c.id === product.kategorie_id)?.bezeichnung ||
                            `ID: ${product.kategorie_id}`}
                        </p>
                        <p className="text-xs text-gray-600">Lager: {product.lagerbestand}</p>
                        <p className="text-sm font-bold text-gray-800">
                          {product.preis?.toFixed(2)} €
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => vm.handleEdit(product)}
                          className="py-1 bg-[#948BB8] text-white text-xs rounded hover:opacity-90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => vm.handleToggleAktiv(product)}
                          className={`py-1 text-white text-xs rounded hover:opacity-90 ${
                            product.aktiv ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                        >
                          {product.aktiv ? 'Aktiv' : 'Deaktiviert'}
                        </button>
                        <button
                          onClick={() => vm.handleDelete(product.id)}
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
              {vm.editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </h2>
            {vm.editingProduct && (
              <button
                onClick={vm.handleCancelEdit}
                className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Abbrechen
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Tab-Navigation nur wenn nicht im Edit-Modus */}
            {!vm.editingProduct && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => vm.setActiveTab('scan')}
                  className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${
                    vm.activeTab === 'scan'
                      ? 'bg-[#948BB8] text-white'
                      : 'bg-[#E1E1F2] text-gray-700'
                  }`}
                >
                  Barcode scannen
                </button>
                <button
                  onClick={() => vm.setActiveTab('manual')}
                  className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${
                    vm.activeTab === 'manual'
                      ? 'bg-[#948BB8] text-white'
                      : 'bg-[#E1E1F2] text-gray-700'
                  }`}
                >
                  Manuell
                </button>
              </div>
            )}

            {/* Scan-Tab */}
            {vm.activeTab === 'scan' && !vm.editingProduct && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode</label>
                <div className="flex gap-2">
                  <input
                    ref={barcodeRef}
                    type="text"
                    value={vm.barcodeInput}
                    onChange={(e) => vm.setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && vm.handleBarcodeScan()}
                    placeholder="Barcode scannen..."
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                  />
                  <button
                    onClick={vm.handleBarcodeScan}
                    className="px-4 py-2 bg-[#948BB8] text-white font-semibold rounded hover:opacity-90"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Manual-Tab */}
            {(vm.activeTab === 'manual' || vm.editingProduct) && (
              <form onSubmit={vm.handleFormSubmit} className="space-y-3">
                {/* ID/Barcode-Feld – nur bei Neuanlage sichtbar */}
                {!vm.editingProduct && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ID / Barcode *
                    </label>
                    <input
                      type="text"
                      value={vm.manualInput.id}
                      onChange={(e) => vm.setManualInput({ ...vm.manualInput, id: e.target.value })}
                      placeholder="Barcode scannen oder ID eingeben"
                      required
                      readOnly={vm.idFromScan}
                      className={`w-full px-3 py-2 text-sm border-2 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8] ${
                        vm.manualInput.id
                          ? 'border-green-400 bg-green-50 font-semibold'
                          : 'border-gray-300'
                      }`}
                    />
                    {vm.manualInput.id && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Barcode {vm.manualInput.id} übernommen
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={vm.manualInput.name}
                      onChange={(e) =>
                        vm.setManualInput({ ...vm.manualInput, name: e.target.value })
                      }
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
                      value={vm.manualInput.preis}
                      onChange={(e) =>
                        vm.setManualInput({ ...vm.manualInput, preis: e.target.value })
                      }
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
                      value={vm.manualInput.mwst_satz}
                      onChange={(e) =>
                        vm.setManualInput({ ...vm.manualInput, mwst_satz: e.target.value })
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
                      value={vm.manualInput.lagerbestand}
                      onChange={(e) =>
                        vm.setManualInput({ ...vm.manualInput, lagerbestand: e.target.value })
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
                    value={vm.manualInput.kategorie_id}
                    onChange={(e) =>
                      vm.setManualInput({ ...vm.manualInput, kategorie_id: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                  >
                    <option value="">-- Auswählen --</option>
                    {vm.categories.map((cat) => (
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
                      value={vm.manualInput.rabatt}
                      onChange={(e) =>
                        vm.setManualInput({ ...vm.manualInput, rabatt: e.target.value })
                      }
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
                      value={vm.manualInput.mindestalter}
                      onChange={(e) =>
                        vm.setManualInput({ ...vm.manualInput, mindestalter: e.target.value })
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
                    value={vm.manualInput.bild}
                    onChange={(e) => vm.setManualInput({ ...vm.manualInput, bild: e.target.value })}
                    placeholder="https://example.com/bild.jpg"
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]"
                  />
                  {vm.manualInput.bild && (
                    <div className="mt-2">
                      <img
                        src={vm.manualInput.bild}
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
                  {vm.editingProduct ? 'Aktualisieren' : 'Hinzufügen'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
