import { useProductManagement } from '../hooks/useProductManagement'
import ProductCard from '../components/ProductCard'
import ProductForm from '../components/ProductForm'

export default function ProductManagementPage() {
  const {
    barcodeRef,
    barcodeInput,
    setBarcodeInput,
    manualInput,
    setManualInput,
    categories,
    products,
    message,
    activeTab,
    setActiveTab,
    editingProduct,
    searchProduct,
    setSearchProduct,
    filterCategory,
    setFilterCategory,
    filteredProducts,
    handleBarcodeScan,
    handleFormSubmit,
    handleDelete,
    handleEdit,
    handleToggleAktiv,
    handleCancelEdit,
    navigate
  } = useProductManagement()

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Produktverwaltung</h1>
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

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-12rem)]">
        {/* LINKE SPALTE: Produktliste */}
        <div className="flex flex-col bg-white rounded-lg border-2 border-gray-300 p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Aktuelle Produkte ({products.length})
          </h2>

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
                  <ProductCard
                    key={product.id}
                    product={product}
                    categories={categories}
                    onEdit={handleEdit}
                    onToggleAktiv={handleToggleAktiv}
                    onDelete={handleDelete}
                  />
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
                onClick={handleCancelEdit}
                className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Abbrechen
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
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

            {(activeTab === 'manual' || editingProduct) && (
              <ProductForm
                manualInput={manualInput}
                setManualInput={setManualInput}
                categories={categories}
                editingProduct={editingProduct}
                onSubmit={handleFormSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
