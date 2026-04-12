//comnponent for product form in ProductManagementPage.jsx

import PropTypes from 'prop-types'

export default function ProductForm({
  manualInput,
  setManualInput,
  categories,
  editingProduct,
  onSubmit
}) {
  const handleChange = (field) => (e) => setManualInput({ ...manualInput, [field]: e.target.value })

  const inputClass =
    'w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#948BB8]'

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={manualInput.name}
            onChange={handleChange('name')}
            placeholder="Bio-Apfel"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Preis (€) *</label>
          <input
            type="number"
            step="0.01"
            value={manualInput.preis}
            onChange={handleChange('preis')}
            placeholder="1.99"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">MwSt (%) *</label>
          <select
            value={manualInput.mwst_satz}
            onChange={handleChange('mwst_satz')}
            required
            className={inputClass}
          >
            <option value="">-- Auswählen --</option>
            <option value="7">7%</option>
            <option value="19">19%</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Lagerbestand *</label>
          <input
            type="number"
            value={manualInput.lagerbestand}
            onChange={handleChange('lagerbestand')}
            placeholder="100"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Kategorie *</label>
        <select
          value={manualInput.kategorie_id}
          onChange={handleChange('kategorie_id')}
          required
          className={inputClass}
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
          <label className="block text-xs font-semibold text-gray-700 mb-1">Rabatt (%)</label>
          <input
            type="number"
            step="0.01"
            value={manualInput.rabatt}
            onChange={handleChange('rabatt')}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Mindestalter</label>
          <input
            type="number"
            value={manualInput.mindestalter}
            onChange={handleChange('mindestalter')}
            placeholder="0"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Produktbild-URL</label>
        <input
          type="url"
          value={manualInput.bild}
          onChange={handleChange('bild')}
          placeholder="https://example.com/bild.jpg"
          className={inputClass}
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
  )
}

ProductForm.propTypes = {
  manualInput: PropTypes.shape({
    name: PropTypes.string.isRequired,
    preis: PropTypes.string.isRequired,
    mwst_satz: PropTypes.string.isRequired,
    lagerbestand: PropTypes.string.isRequired,
    kategorie_id: PropTypes.string.isRequired,
    rabatt: PropTypes.string.isRequired,
    mindestalter: PropTypes.string.isRequired,
    bild: PropTypes.string.isRequired
  }).isRequired,
  setManualInput: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      bezeichnung: PropTypes.string.isRequired
    })
  ).isRequired,
  editingProduct: PropTypes.object,
  onSubmit: PropTypes.func.isRequired
}

ProductForm.defaultProps = {
  editingProduct: null
}
