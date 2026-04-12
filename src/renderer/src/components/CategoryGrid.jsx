import PropTypes from 'prop-types'
import apfel from '../../../../resources/apfel.png'
import karotte from '../../../../resources/karotte.png'
import croissant from '../../../../resources/croissant.png'

const categoryImages = {
  Obst: apfel,
  Gemüse: karotte,
  Backwaren: croissant
}

export default function CategoryGrid({ kategorien, activeCategory, onCategorySelect }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {kategorien.map((kat) => (
        <button
          key={kat.id}
          onClick={() => onCategorySelect(kat)}
          className={`h-28 rounded-xl flex flex-col items-center justify-center text-xl font-bold border-4 transition
            ${
              activeCategory?.id === kat.id
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
  )
}

CategoryGrid.propTypes = {
  kategorien: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      bezeichnung: PropTypes.string.isRequired
    })
  ).isRequired,
  activeCategory: PropTypes.shape({
    id: PropTypes.number.isRequired
  }),
  onCategorySelect: PropTypes.func.isRequired
}

CategoryGrid.defaultProps = {
  activeCategory: null
}
