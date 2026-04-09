import Modal from './Modal'
import PropTypes from 'prop-types'

export default function EmployeeMenuModal({
  isOpen,
  onInspectionClick,
  onProductsClick,
  onResetClick,
  onClose
}) {
  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Mitarbeiter-Menü</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={onInspectionClick}
            className="px-8 py-4 text-white font-semibold text-lg rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#948BB8' }}
          >
            Kontrolle
          </button>
          <button
            onClick={onProductsClick}
            className="px-8 py-4 text-white font-semibold text-lg rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#948BB8' }}
          >
            Produkte
          </button>
          <button
            onClick={onResetClick}
            className="px-8 py-4 text-white font-semibold text-lg rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#948BB8' }}
          >
            Einkauf zurücksetzen
          </button>
          <button
            onClick={onClose}
            className="px-8 py-4 text-gray-700 font-semibold rounded-lg transition-colors hover:opacity-90 mt-2"
            style={{ backgroundColor: '#E1E1F2' }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </Modal>
  )
}

EmployeeMenuModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onInspectionClick: PropTypes.func.isRequired,
  onProductsClick: PropTypes.func.isRequired,
  onResetClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}
