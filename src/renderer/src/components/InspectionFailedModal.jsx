import Modal from './Modal'
import PropTypes from 'prop-types'

export default function InspectionFailedModal({ isOpen, onAnpassen, onBeenden }) {
  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Einkauf nicht korrekt</h2>
        <p className="text-gray-600 mb-8">Möchten Sie den Einkauf anpassen oder beenden?</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onAnpassen}
            className="px-8 py-3 text-gray-700 font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#E1E1F2' }}
          >
            Anpassen
          </button>
          <button
            onClick={onBeenden}
            className="px-8 py-3 text-white font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#948BB8' }}
          >
            Beenden
          </button>
        </div>
      </div>
    </Modal>
  )
}

InspectionFailedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onAnpassen: PropTypes.func.isRequired,
  onBeenden: PropTypes.func.isRequired
}
