//component for product card in ProductManagementPage.jsx

import PropTypes from 'prop-types'

export default function ProductCard({ product, categories, onEdit, onToggleAktiv, onDelete }) {
  const kategorieBezeichnung =
    categories.find((c) => c.id === product.kategorie_id)?.bezeichnung ||
    `ID: ${product.kategorie_id}`

  return (
    <div
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
          <p className="text-xs text-gray-600">Kategorie: {kategorieBezeichnung}</p>
          <p className="text-xs text-gray-600">Lager: {product.lagerbestand}</p>
          <p className="text-sm font-bold text-gray-800">{product.preis?.toFixed(2)} €</p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onEdit(product)}
            className="py-1 bg-[#948BB8] text-white text-xs rounded hover:opacity-90"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleAktiv(product)}
            className={`py-1 text-white text-xs rounded hover:opacity-90 ${
              product.aktiv ? 'bg-green-500' : 'bg-orange-500'
            }`}
          >
            {product.aktiv ? 'Aktiv' : 'Deaktiviert'}
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Del
          </button>
        </div>
      </div>
    </div>
  )
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    preis: PropTypes.number.isRequired,
    lagerbestand: PropTypes.number.isRequired,
    kategorie_id: PropTypes.number.isRequired,
    aktiv: PropTypes.bool.isRequired,
    bild: PropTypes.string
  }).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      bezeichnung: PropTypes.string.isRequired
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggleAktiv: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}
