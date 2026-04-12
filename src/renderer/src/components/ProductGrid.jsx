import PropTypes from 'prop-types'

export default function ProductGrid({ aktiveProdukteList, counts, onIncrease, onDecrease }) {
  return (
    <div className="grid grid-cols-3 gap-6 flex-1">
      {aktiveProdukteList.map((item) => (
        <div
          key={item.id}
          className="bg-[#E9EAF1] rounded-xl p-4 flex flex-col items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-4 text-xl font-bold">
            <button
              onClick={() => onDecrease(item.id)}
              className="px-3 py-1 bg-white rounded shadow active:scale-95"
            >
              -
            </button>
            <span>{counts[item.id] || 0}</span>
            <button
              onClick={() => onIncrease(item.id)}
              className="px-3 py-1 bg-white rounded shadow active:scale-95"
            >
              +
            </button>
          </div>
          <span className="text-lg font-bold mt-2">{item.name}</span>
        </div>
      ))}
    </div>
  )
}

ProductGrid.propTypes = {
  aktiveProdukteList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  counts: PropTypes.objectOf(PropTypes.number).isRequired,
  onIncrease: PropTypes.func.isRequired,
  onDecrease: PropTypes.func.isRequired
}
